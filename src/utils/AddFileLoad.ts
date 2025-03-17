import { AtomicBlockUtils, EditorState } from "draft-js";
import React from "react";

export const onFileChange = (editorState: EditorState, setEditorState: React.Dispatch<React.SetStateAction<EditorState>> , event: React.ChangeEvent<HTMLInputElement>, type: string) => {

  let file = event.target.files?.[0];
  event.target.value = "";
  if (!file) { 
    return;
  }
  
  const reader = new FileReader();
  reader.onload = () => {
    let result = null;
    let fileURL = null;

    if (type === "MODEL_VIEWER") {
      result = reader.result as ArrayBuffer;

      // ✅ 기존 Blob URL 해제
      setEditorState((prevEditorState: EditorState) => {
        const contentState = prevEditorState.getCurrentContent();
        const blocks = contentState.getBlockMap();

        blocks.forEach((block) => {
          if (!block) return;
          const entityKey = block.getEntityAt(0);
          if (entityKey) {
            const entity = contentState.getEntity(entityKey);
            const entityData = entity.getData();
            if (entityData.src) {
              URL.revokeObjectURL(entityData.src); // 기존 Blob URL 해제
            }
          }
        });

        return prevEditorState;
      });

      // ✅ 새로운 Blob URL 생성 (같은 파일이어도 URL이 달라짐)
      fileURL = arrayBufferToFileURL(result);
    } else {
      result = reader.result as string;
    }
    
    // ✅ Draft.js의 editorState를 강제로 변경하여 업데이트 감지
    let contentState = editorState.getCurrentContent();
    contentState = contentState.createEntity(type, "IMMUTABLE", { src: type === "MODEL_VIEWER" ? fileURL : result });
    const entityKey = contentState.getLastCreatedEntityKey();
    
    // ✅ `forceSelection`을 사용하여 Draft.js가 강제로 새로운 변경을 감지하도록 설정
    const newEditorState = EditorState.forceSelection(
      EditorState.set(editorState, { currentContent: contentState }),
      editorState.getSelection()
    );

    const newStateWithModel = AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ");
    setEditorState(newStateWithModel);
  };

  if (type === "MODEL_VIEWER") {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsDataURL(file);
  }
};

const arrayBufferToFileURL = (arrayBuffer: ArrayBuffer, mimeType: string = "model/gltf-binary") => {
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
};