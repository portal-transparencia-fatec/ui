import { makeStyles } from '@material-ui/styles';
import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  transition: height 0.2s ease;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

export const ContainerInput = styled.form`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
`;

export const ListaAnexos = styled.ul`
  height: auto;
  max-height: 90px;
  overflow: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const Anexo = styled.li`
  margin: 5px 0;
  color: #0662a1;
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export const useStyles = makeStyles(theme => ({
  textarea: {
    fontSize: theme.typography.pxToRem(12),
  },
  iconClose: {
    fontSize: 20,
  },
}));
