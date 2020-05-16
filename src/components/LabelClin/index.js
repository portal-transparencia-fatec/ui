import React from 'react';
import Icon from '@mdi/react';
import {
  Label, LabelText, Container, Wrapper,
} from './styles';

const LabelClin = ({
  bgColor, textColor, icon, iconSize, text, subText, children, ...other
}) => (
  <Label
    style={{
      fontSize: '0.8vw',
      backgroundColor: bgColor,
      width: '100%',
      color: textColor,
      cursor: (other.onClick && 'pointer'),
    }}
    {...other}
  >
    {children || (
    <>
      <Container>
        {icon && (
          <Icon
            path={icon}
            size={iconSize}
            color={textColor}
          />
        )}
        {text && (
          <LabelText>{text}</LabelText>
        )}
      </Container>

        {typeof subText !== 'undefined' && (
          <>
            <Wrapper>
              <LabelText>{subText}</LabelText>
            </Wrapper>
          </>
        )}
    </>
    )}
  </Label>
);

LabelClin.defaultProps = {
  iconSize: '20px',
};
export default LabelClin;
