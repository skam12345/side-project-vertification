import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DesignLangText,
  EditorContainer,
  EditorRowFlex,
  HomeContainer,
  HomeContent,
  PreviewContent,
  PreviewContainer,
  CiImageOnImage,
  ToolbarButton,
  TbHexagon3DGLB,
  Img,
  FaEyeSlashIcon,
  MdAudioFileIcon,
  GlobalStyle,
} from './style/HomeStyled';
import { Editor, SyntheticKeyboardEvent } from "react-draft-wysiwyg";
import {
  ContentBlock,
  ContentState,
  EditorState,
  Modifier,
} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import CodeMirror from "@uiw/react-codemirror";
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import ModelViewerComponent from './ModelViewerComponent';
import { convertToHTML } from 'draft-convert';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { FaVideo } from 'react-icons/fa';
import { onFileChange } from '../utils/AddFileLoad';
import { toggleHandleReturn, toggleText, toolbar } from '../utils/BoardUtils';
const initialHtml = ``;
const initialCss = ``;
const initialJs = ``;

interface MediaProps {
  block: ContentBlock;
  contentState: ContentState;
}

interface ToggleBlockProps {
  block: ContentBlock;
  contentState: ContentState;
}

const ToggleBlock: React.FC<ToggleBlockProps> = ({ block, contentState }) => {
  const entity = contentState.getEntity(block.getEntityAt(0));
  const { text, label } = entity.getData();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{ cursor: "pointer", fontWeight: "bold" }}
      >
        ▶ {label || "숨겨진 텍스트"}
      </div>
      {!collapsed && <div style={{ paddingLeft: 20 }}>{text}</div>}
    </div>
  );
};

const Media: React.FC<MediaProps> = ({ block, contentState }) => {
  const entityKey = block.getEntityAt(0);
  if (!entityKey) return null;
  const entity = contentState.getEntity(entityKey);
  const { src } = entity.getData();
  const type = entity.getType();


  if (type === 'IMAGE') {
    return (
        <Img src={src} alt="editor-img" />
      );
  }if (type === 'MODEL_VIEWER') {
    console.log(src);
    return (
      <ModelViewerComponent src={src} auto-rotate camera-controls />
    );
  }else {
    return <ToggleBlock block={block} contentState={contentState} />
  }
};



const HomePage = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty() );
  const [htmlString, setHtmlString] = useState("");
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [cssCode, setCssCode] = useState(initialCss);
  const [typescriptCode, setTypescriptCode] = useState(initialJs);
  const [srcDoc, setSrcDoc] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const modelInputRef = useRef<HTMLInputElement | null>(null);

//Start: useRef => input 파일 타입 제어 함수 영역
  const handleAudioUpload = () => {
    if (audioInputRef.current) {
      audioInputRef.current.click();
    }
  }

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleVideoUpload = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleModelUpload = () => {
    if (modelInputRef.current) {
      modelInputRef.current.click();
    }
  };
// End



  const handleKeyCommand = (command: string, editorState: EditorState) => {
    if (command === "backspace") {
      const selection = editorState.getSelection();
      const content = editorState.getCurrentContent();
      const blockKey = selection.getAnchorKey();
      const block = content.getBlockForKey(blockKey);

      if (block.getType() === "atomic") {
        // Atomic 블록을 삭제
        const newContent = Modifier.removeRange(
          content,
          selection.merge({
            anchorOffset: 0,
            focusOffset: block.getLength(),
          }),
          "backward"
        );
        const newEditorState = EditorState.push(editorState, newContent, "remove-range");
        setEditorState(EditorState.forceSelection(newEditorState, newContent.getSelectionAfter()));
        return "handled";
      }
    }

    return "not-handled";
  };

  //Start: 코드 편집기 Component 정의 영역
  const htmlScriptCodeEditor = () => {
    return (
      <EditorContainer>
        <DesignLangText>HTML</DesignLangText>
        <CodeMirror 
          value={htmlCode}
          width="200px"
          height="200px"
          extensions={[html({ autoCloseTags: true })]}
          theme={'dark'}
          editable={true}
          placeholder="html 코드를 작성해주세요."
          onChange={(value) => setHtmlCode(value)}
        />
      </EditorContainer>
    );
  };

  const cssCodeEditor = () => {
    return (
      <EditorContainer>
        <DesignLangText>CSS</DesignLangText>
        <CodeMirror 
          value={cssCode}
          extensions={[css()]}
          width="200px"
          height="200px"
          theme={'dark'}
          editable={true}
          placeholder="css 코드를 작성해주세요."
          onChange={(value) => setCssCode(value)}
        />
      </EditorContainer>
    );
  };

  const typescriptCodeEditor = () => {
    return (
      <EditorContainer>
        <DesignLangText>Typescript</DesignLangText>
        <CodeMirror 
          value={typescriptCode}
          extensions={[javascript()]}
          width="200px"
          height="200px"
          theme={'dark'}
          editable={true}
          placeholder="Typescript 코드를 작성해주세요."
          onChange={(value) => setTypescriptCode(value)}
        />
      </EditorContainer>
    );
  };
  // End

  // draft-wysiwyg 게시글 편집기에 PlaceHolder가 생기게 하는 함수.

  
  const getPlaceholder = useCallback(() => {
    const content = editorState.getCurrentContent();
    const blocks = content.getBlockMap().toArray();
    const hasListBlock = blocks.some(block => {
      const type = block.getType();
      return type === "unordered-list-item" || type === "ordered-list-item";
    });
    return hasListBlock ? "" : "내용을 입력하세요...";
  }, [editorState]);

  // draft-wysiwyg 게시글 편집기에서의 타입 EditorState를 HTML 태그로 변환하는 함수.
  const convertContentToHtml = useCallback((contentState: ContentState) => {
    return convertToHTML({
      // atomic 블록에 대해 시작과 종료 태그를 빈 문자열로 지정
      blockToHTML: (block) => {
        if (block.type === "atomic") {
          return { start: "", end: "" };
        }
        return undefined;
      },
      // 엔티티 변환 옵션: MODEL_VIEWER와 IMAGE를 처리
      entityToHTML: (entity, originalText) => {
        if (entity.type === "MODEL_VIEWER") {
          const src = entity.data;
          console.log(src);
          const loader = new GLTFLoader();
          let animation = '';
          loader.load(src.src, (gltf) => {
            animation = gltf.animations[0].name;
          });
          return `<model-viewer src="${src.src}" animation-name="${animation}" autoplay alt="3D Model" auto-rotate camera-controls style="width: 100%; height: 100vh; object-fit: fill;"></model-viewer>`;
        }
        if(entity.type === "TOGGLE_BLOCK") {
          const { text, label } = entity.data;
          const formattedText = text.replace(/\n/g, "<br>");
          return `<details><summary>${label || "숨겨진 텍스트"}</summary><div>${formattedText}</div></details>`;
        }if (entity.type === "IMAGE") {
          const { src } = entity.data;
          return `<img style="width: 200px; height: 200px; object-fit: cover;" src="${src}" alt="editor-img" />`;
        }if (entity.type === "VIDEO") {
          const { src } = entity.data;
          return `<video src="${src}" controls/>`;
        }if (entity.type === "AUDIO") {
          const { src } = entity.data;
          return `<audio src="${src}" controls/>`;
        }
          return originalText;
      },
    })(contentState);
  }, []);


  // HTML태그로 변화된 EditorState 타입을 적용시키는 함수
  const onEditorStateChange = useCallback((editorStates: EditorState) => {
    setEditorState(editorStates);
    const htmlOutput = convertContentToHtml(editorStates.getCurrentContent());
    setHtmlString(htmlOutput);
  }, [convertContentToHtml]);

  // customBlockRenderFunc (react-draft-wysiwyg 1.15.0에서는 customBlockRenderFunc 사용)
  // editorState를 클로저로 캡처하여 contentState와 함께 삭제 함수를 전달합니다.
  const customBlockRenderFunc = useCallback((block: ContentBlock) => {
    if (block.getType() === 'atomic') {
      return {
        component: Media,
        editable: true,
        props: {
          contentState: editorState.getCurrentContent(),
          block,
        }
      };
    }
    return null;
  }, [editorState]);



  const callBackEditorComponent = useCallback(() => {
    return (<Editor
    editorClassName="editor"
    toolbarClassName="toolbar"
    placeholder={getPlaceholder()}
    localization={{
      locale: "ko",
    }}
    toolbar={toolbar}
    editorState={editorState}
    onEditorStateChange={onEditorStateChange}
    editorStyle={{
      height: "600px",
      flex: 1,
      border: "3px solid lightgray",
      padding: "20px",
      color: 'white',
    }}
    toolbarCustomButtons={[
      <ToolbarButton key="custom-image-button" onClick={handleImageUpload}>
        <CiImageOnImage />
      </ToolbarButton>,
      <ToolbarButton key="custom-glb-button" onClick={handleModelUpload}>
        <TbHexagon3DGLB />
      </ToolbarButton>,
      <ToolbarButton key="custom-toggle-button" onClick={() => toggleText(editorState, setEditorState)}>
        <FaEyeSlashIcon />
      </ToolbarButton>,
      <ToolbarButton key="custom-video-button" onClick={handleVideoUpload}>
        <FaVideo />
      </ToolbarButton>,
      <ToolbarButton key="custom-audio-button" onClick={handleAudioUpload}>
        <MdAudioFileIcon />
      </ToolbarButton>

    ]}
    customBlockRenderFunc={customBlockRenderFunc}
    handleKeyCommand={handleKeyCommand}
    handleReturn={(event: SyntheticKeyboardEvent) => toggleHandleReturn(event, editorState, setEditorState)}
    />);
  }, [customBlockRenderFunc, editorState, getPlaceholder, onEditorStateChange]); 


  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${cssCode}</style>
            <style>
              body {
                display: flex;
                flex-direction: column;
              }
              .model {
                position: relative;
                width: 100%;
                height: 200px;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .model-viewer {
                width: 200px;
                height: 100%;
                background-color: white;
              }
              .image {
                position: relative;
                width: 100%;
                height: 200px;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .img {
                width: 200px;
                height: 100%;
              }
              .close {
                z-index: 99;
                position: absolute;
                top: 2px;
                left: 50%;
                margin-left: 85px;
                width: 15px;
                height: 15px;
                display: none;
                justify-content: center;
                align-items: center;
                background-color: gray;
                color: white;
                font-size: 10px;
                font-weight: 900;
                opacity: 0.7;
              }
              .close:hover {
                cursor: pointer;
              }
            </style>
            <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
            <script>${typescriptCode}</script>
          </head>
          <body>
            ${htmlString}
            ${htmlCode}
          </body>
        </html>
      `);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [cssCode, htmlCode, htmlString, typescriptCode]);

  return (
    <HomeContainer>
      <GlobalStyle />
      <HomeContent>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(event) => onFileChange(editorState, setEditorState, event, 'IMAGE')}
        />
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          style={{ display: "none" }}
          onChange={(event) => onFileChange(editorState, setEditorState, event, 'VIDEO')}
        />
        <input 
          type="file"
          accept="audio/*"
          ref={audioInputRef}
          style={{ display: "none" }}
          onChange={(event) => onFileChange(editorState, setEditorState, event, 'AUDIO')}
        />
        <input
          type="file"
          accept=".glb, .gltf"
          ref={modelInputRef}
          style={{ display: "none" }}
          onChange={(event) => onFileChange(editorState, setEditorState, event, 'MODEL_VIEWER')}
        />
        {callBackEditorComponent()}
        <EditorRowFlex>
          {htmlScriptCodeEditor()}
          {cssCodeEditor()}
          {typescriptCodeEditor()}
        </EditorRowFlex>
      </HomeContent>
      <PreviewContainer>
        <PreviewContent id="myPreview" title="preview" srcDoc={srcDoc} allow="autoplay; xr-spatial-tracking; camera" />
      </PreviewContainer>
    </HomeContainer>
  );
};

export default HomePage;
