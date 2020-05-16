import styled from 'styled-components';

export const ContagemMensagens = styled.span`
  padding: 4px;
  background-color: #eb2f37;
  color: #FFF;
  font-size: 0.825rem;
  font-weight: bold;
  width: 24px;
  height: 24px;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default theme => ({
  tituloConversa: {
    fontSize: theme.typography.pxToRem(13),
  },
  subtituloConversa: {
    display: 'inline',
    fontSize: theme.typography.pxToRem(12),
  },
  negrito: {
    fontWeight: 'bold',
  },
  listItem: {
    maxWidth: 360,
  },
});
