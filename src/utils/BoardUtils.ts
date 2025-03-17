import { AtomicBlockUtils, EditorState, RichUtils } from "draft-js";
import { SyntheticKeyboardEvent } from "react-draft-wysiwyg";

// react-draft-wysiwyg 텍스트 편집기의 편집기 도구상자 설정 Object
export const toolbar = () => {
    return {
        options: ["inline", "blockType", "fontSize", "list", "textAlign", "colorPicker", "link", "embedded", "emoji", "remove", "history"],
        list: {
          inDropdown: true,
          options: ["unordered", "ordered", "indent", "outdent"],
        },
        embedded: { inDropdown: true,
          options: [],
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

    }
  }


// // react-draft-wysiwyg 토글 줄바꿈 처리
export const toggleHandleReturn = (event: SyntheticKeyboardEvent, editorState: EditorState, setEditorState: React.Dispatch<React.SetStateAction<EditorState>>) => {
      event.preventDefault(); // 기본 Enter 동작 방지
      const newState = RichUtils.insertSoftNewline(editorState); // 줄바꿈 처리
      setEditorState(newState);
      return true; // 기본 동작을 막았음을 Draft.js에 알림
};

// 텍스트 토글 기능 함수
export const toggleText = (editorState: EditorState, setEditorState: React.Dispatch<React.SetStateAction<EditorState>>) => {
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