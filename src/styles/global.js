import styled, { createGlobalStyle } from 'styled-components';

import 'typeface-roboto';
import 'jquery/dist/jquery';
import 'react-dates/lib/css/_datepicker.css';

export default createGlobalStyle`
  body {
    text-rendering: optimizeLegibility;
  }

  html, body, #root {
    /* font-size: 0.8em !important; */
    height: 100%;
   
  }

  #root {
    overflow: hidden;
    margin-top: 300px !important,
  }
`;

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex: 1;
  padding: 16px;
`;
