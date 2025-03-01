import { CiImageOn } from "react-icons/ci";
import { TbHexagon3D } from "react-icons/tb";
import { FaEyeSlash, FaCaretDown, FaVideo } from "react-icons/fa";
import { MdAudioFile } from "react-icons/md";
import styled from "styled-components";

export const HomeContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`;

export const HomeContent = styled.div`
    position: relative;
    width: 50%;
    height: 100%;
    background-color: black;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &::-webkit-scrollbar {
        visibility: hidden;
    }
    &::-webkit-scrollbar-button {
        display: none;
    }
    &::-webkit-scrollbar-track {
        display: none;
    }
    &::-webkit-scrollbar-track-piece {
        display: none;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #d9d9d9;
        border-radius: 20px;
    }
    &::-webkit-scrollbar-corner {
        display: none;
    }
    &::-webkit-resizer {
        display: none;
    }
`;
export const PreviewContainer = styled.div`
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;


export const PreviewContent = styled.iframe`
  border-radius: 0.75rem;
  width: 100%;
  height: 100vh;
  border: none;
  
`;


export const EditorContainer = styled.div`
    width: 30%;
    height: 100%;
    margin-right: 1px;
`;

export const DesignLangText = styled.h3`
    font-size: 15px;
    font-weight: 900;
    color:rgb(165, 165, 165);
`;

export const EditorRowFlex = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

export const ImageSection = styled.img`
    width: 500px;
    height: 500px;
    object-fit: fill;
`;

export const  ToolbarButton = styled.div`
    padding: 6px 5px 0;
    border-radius: 2px;
    margin-left: 8px;
    border: 1px solid #F1F1F1;
    display: flex;
    justify-content: flex-start;
    background: white;
    flex-wrap: wrap;
    font-size: 15px;
    margin-bottom: 5px;
    user-select: none;
    &:hover {
        border-right: 1px solid #BFBDBD;
        border-bottom: 1px solid #BFBDBD;
        cursor: pointer;
    }
`;

export const CiImageOnImage = styled(CiImageOn)`
    font-size: 20px;
`;

export const TbHexagon3DGLB = styled(TbHexagon3D)`
    font-size: 20px;
`;

export const FaEyeSlashIcon = styled(FaEyeSlash)`

    font-size: 20px;
`;

export const FaCaretDownIcon = styled(FaCaretDown)`
    font-size: 20px;
`;

export const FaCaretUpIcon = styled(FaCaretDown)`
    font-size: 20px;
`;

export const FaVideoIcon = styled(FaVideo)`
    font-size: 20px;
`;

export const MdAudioFileIcon = styled(MdAudioFile)`
    font-size: 20px;
`;

export const Image = styled.div`
    position: relative;
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const Img = styled.img`
    width: 200px;
    height:200px;
`;

export const Video = styled.video`
    width: 200px;
    height: 200px;
`;

export const Audio = styled.audio`
    width: 200px;
    height: 40px;
`;

export const Close = styled.div<{
    enter: boolean;
}>`
    z-index: 99;
    position: absolute;
    top: 2px;
    left: 50%;
    margin-left: 85px;
    width: 15px;
    height: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: gray;
    color: white;
    font-size: 10px;
    font-weight: 900;
    opacity: 0.7;
    user-select: none;
    &:hover{
        cursor: pointer;
    }
`;