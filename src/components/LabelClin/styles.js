/* eslint-disable no-tabs */
import styled from 'styled-components';

export const Label = styled.div`
  padding: 4px;
  display: block;
  border-radius: 3px;
  background-color: ${props => props.bgColor || 'inherit'};
  color: ${props => props.textColor || 'inherit'};
`;

export const Container = styled.section`
	display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

export const LabelText = styled.span`
  padding: 0 8px;
  vertical-align: super;
  justify-content: center;
  align-items: center;
  align-self: center;
  font-size: 0.8em;
  font-weight: bold;
  text-align: center;
  display: inline-block;
  color: 'inherit';
`;
