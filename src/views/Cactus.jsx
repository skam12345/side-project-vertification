import React from 'react';
import * as pc from "playcanvas";

const Cactus = () => {
  return  <model-viewer src={'https://test-s3-glb.s3.ap-northeast-2.amazonaws.com/damyo.glb'} auto-rotate camera-controls style={{ width: "400px", height: "400px" }} />;
}

export default Cactus;
