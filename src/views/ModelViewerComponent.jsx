const ModelViewerComponent = ({src}) => {
    
    return (
      <div style={{width: '100%', height: '600px', display: 'grid', placeItems: 'center'}}>
        <model-viewer 
          src={src} 
          alt="3D Model" 
          auto-rotate 
          camera-controls
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-target="auto auto auto"
          camera-orbit="auto auto auto"
          style={{marginTop: '-450px', width: "100%", height: "700px", maxWidth: '70%' }}
        ></model-viewer>
      </div>
  );
}

export default ModelViewerComponent;