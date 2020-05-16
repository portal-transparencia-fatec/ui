import styled, { keyframes } from 'styled-components';
import Icon from '@mdi/react';

const rotate = keyframes`
  from {
    transform: rotate(0deg)
  }

  to {
    transform: rotate(360deg)
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

export const AnimatedIcon = styled(Icon)`
  animation: ${rotate} 1.5s linear infinite;
`;

export const Container = styled.div`
  position: absolute;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  align-items: center;
  z-index: 5000;
  background-color: rgba(255, 255, 255, 0.35);
  animation: ${fadeIn} 1.1s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
`;
