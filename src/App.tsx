import React from 'react';
import Router from './router/Route';
import { createGlobalStyle } from 'styled-components';


function App() {
  const GlobalStyle = createGlobalStyle`
    width: 100%;
    height: 100%;
    &::-webkit-scrollbar {
      visibility: hidden;
    }
  `

  return (
    <>
      <GlobalStyle />
      <Router />
    </>
  );
}

export default App;
