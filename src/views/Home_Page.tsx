import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
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
  Video,
  MdAudioFileIcon,
  Audio,
} from './style/HomeStyled';
import { Editor, SyntheticKeyboardEvent } from "react-draft-wysiwyg";
import {
  AtomicBlockUtils,
  ContentBlock,
  ContentState,
  EditorState,
  Modifier,
  RichUtils,
} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import CodeMirror from "@uiw/react-codemirror";
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import ModelViewerComponent from './ModelViewerComponent';
import { convertToHTML } from 'draft-convert';

import { FaVideo } from 'react-icons/fa';
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
  const [audioElement, setAudioElement] = useState<JSX.Element | null>(null);
  const entityKey = block.getEntityAt(0);
  if (!entityKey) return null;
  const entity = contentState.getEntity(entityKey);
  const { src } = entity.getData();
  const type = entity.getType();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() =>{ 
    if (type === 'AUDIO') {
      setAudioElement(<Audio src={src} controls />);
    }
  }, [type, src]);
  if (type === 'IMAGE') {
    return (
        <Img src={src} alt="editor-img" />
      );
  }if (type === 'MODEL_VIEWER') {
    return (
      <ModelViewerComponent />
    );
  }if(type === 'VIDEO') {

    return <Video src={src} controls preload="none"/>;
  }if(type === 'AUDIO') {
     // eslint-disable-next-line react-hooks/rules-of-hooks
    return audioElement;
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
  const [entityKey, setEntitiyKey] = useState<string>('');
  
  const convertContentToHtml = (contentState: ContentState) => {
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
          return `<model-viewer src="${src}" alt="3D Model" auto-rotate camera-controls></model-viewer>`;
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
  };
  const onEditorStateChange = (editorStates: EditorState) => {
    setEditorState(editorStates);
    const htmlOutput = convertContentToHtml(editorStates.getCurrentContent());
    setHtmlString(htmlOutput);
  };


  // customBlockRenderFunc (react-draft-wysiwyg 1.15.0에서는 customBlockRenderFunc 사용)
  // editorState를 클로저로 캡처하여 contentState와 함께 삭제 함수를 전달합니다.
  const customBlockRenderFunc = (block: ContentBlock) => {
    if (block.getType() === 'atomic') {
      return {
        component: Media,
        editable: false,
        props: {
          contentState: editorState.getCurrentContent(),
          block,
        }
      };
    }
    return null;
  };


  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // 현재 contentState에서 새 엔티티 생성
      let contentState = editorState.getCurrentContent();
      contentState = contentState.createEntity(type, 'IMMUTABLE', { src: base64 });
      const entityKey = contentState.getLastCreatedEntityKey();
      setEntitiyKey(entityKey);
      // 업데이트된 contentState 반영
      const newEditorState = EditorState.set(editorState, { currentContent: contentState });
      // 이미지 atomic 블록 삽입
      const newStateWithImage = AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
      setEditorState(newStateWithImage);
    };
    reader.readAsDataURL(file);
  };

  const onModelChange = () => {
      let contentState = editorState.getCurrentContent();
      contentState = contentState.createEntity('MODEL_VIEWER', 'IMMUTABLE', 'https://test-s3-glb.s3.ap-northeast-2.amazonaws.com/damyo.glb');
      const entityKey = contentState.getLastCreatedEntityKey();

      // 업데이트된 contentState 반영
      const newEditorState = EditorState.set(editorState, { currentContent: contentState });
      // Model atomic 블록 삽입
      const newStateWithModel = AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
      setEditorState(newStateWithModel);
  };

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

  const toolbar = {
    options: ["inline", "blockType", "fontSize", "list", "textAlign", "colorPicker", "link", "embedded", "emoji", "remove", "history"],
    list: {
      inDropdown: true,
      options: ["unordered", "ordered", "indent", "outdent"],
    },
    textAlign: { inDropdown: true },
    link: { inDropdown: true },
    history: { inDropdown: false },
    fontFamily: {
      inDropdown: true,
      options: ["Arial", "Georgia", "Impact", "Tahoma", "Times New Roman", "Verdana", "Comic Sans MS"]
    },
    fontSize: {
      inDropdown: true,
      options: [10, 14, 18, 24, 30, 36, 48, 60, 72, 96],
    },
  };

  const getPlaceholder = () => {
    const content = editorState.getCurrentContent();
    const blocks = content.getBlockMap().toArray();
    const hasListBlock = blocks.some(block => {
      const type = block.getType();
      return type === "unordered-list-item" || type === "ordered-list-item";
    });
    return hasListBlock ? "" : "내용을 입력하세요...";
  };

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

  const toggleText = () => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      const startKey = selection.getAnchorKey(); // 선택 시작 블록
      const endKey = selection.getFocusKey(); // 선택 종료 블록
      let blockKey = startKey;
      let selectedText = "";

      // 여러 블록의 텍스트를 가져오기
      while (blockKey) {
        const block = contentState.getBlockForKey(blockKey);
        const blockText = block.getText();
        const isStartBlock = blockKey === startKey;
        const isEndBlock = blockKey === endKey;

        let startOffset = isStartBlock ? selection.getStartOffset() : 0;
        let endOffset = isEndBlock ? selection.getEndOffset() : blockText.length;

        selectedText += blockText.slice(startOffset, endOffset) + "\n";

        if (blockKey === endKey) break;
        blockKey = contentState.getKeyAfter(blockKey);
      }

      // 선택한 텍스트를 하나의 토글 블록으로 변환
      const contentStateWithEntity = contentState.createEntity("TOGGLE_BLOCK", "IMMUTABLE", {
        text: selectedText.trim(),
        label: "토글 텍스트",
      });
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        EditorState.push(editorState, contentStateWithEntity, "apply-entity"),
        entityKey,
        " "
      );

      setEditorState(newEditorState);
    }
  };

  const handleReturn = (event: SyntheticKeyboardEvent, editorState: EditorState) => {
    event.preventDefault(); // 기본 Enter 동작 방지
    const newState = RichUtils.insertSoftNewline(editorState); // 줄바꿈 처리
    setEditorState(newState);
    return true; // 기본 동작을 막았음을 Draft.js에 알림
  };

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
      <HomeContent>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(event) => onFileChange(event, 'IMAGE')}
        />
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          style={{ display: "none" }}
          onChange={(event) => onFileChange(event, 'VIDEO')}
        />
        <input 
          type="file"
          accept="audio/*"
          ref={audioInputRef}
          style={{ display: "none" }}
          onChange={(event) => onFileChange(event, 'AUDIO')}
        />
        <Editor
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
            height: "400px",
            flex: 1,
            border: "3px solid lightgray",
            padding: "20px",
            color: 'white',
          }}
          toolbarCustomButtons={[
            <ToolbarButton key="custom-image-button" onClick={handleImageUpload}>
              <CiImageOnImage />
            </ToolbarButton>,
            <ToolbarButton key="custom-glb-button" onClick={onModelChange}>
              <TbHexagon3DGLB />
            </ToolbarButton>,
            <ToolbarButton key="custom-toggle-button" onClick={toggleText}>
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
          handleReturn={handleReturn}
        />
        <EditorRowFlex>
          {htmlScriptCodeEditor()}
          {cssCodeEditor()}
          {typescriptCodeEditor()}
        </EditorRowFlex>
      </HomeContent>
      <PreviewContainer>
        {/* /<PreviewContent id="myPreview" title="preview" srcDoc={srcDoc} allow="autoplay; xr-spatial-tracking; camera" /> */}
      </PreviewContainer>
    </HomeContainer>
  );
};

export default HomePage;
