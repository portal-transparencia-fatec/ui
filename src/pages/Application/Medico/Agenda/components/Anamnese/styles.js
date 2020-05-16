
import styled from 'styled-components';

export const DividerVertical = styled.div`
  height: 100%;
  width: 0.825px;
  background-color: #ccc;
  margin: 0 16px;
`;

export const HTMLContainer = styled.div`
  width: 100%;
  height: 100%;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

export default theme => ({
  paper: {
    flex: 1,
    padding: theme.spacing(1),
    height: 'fit-content',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  timeline: {
    backgroundColor: '#0662a1',
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  fabItem: {
    position: 'fixed',
    right: theme.spacing(4.5),
  },
  picture: {
    width: 200,
    height: 200,
    borderRadius: 4,
    borderWidth: 5,
    borderColor: '#000',
  },
  drawer: {
    height: '62vh',
    overflowX: 'hidden',
  },
  drawerContent: {
    flex: 1,
    padding: theme.spacing(2),
  },
  footer: {
    backgroundColor: '#0662a1',
  },
  header: {
    backgroundColor: '#0662a1',
    color: '#fff',
  },
  dialog: {
    backgroundColor: '#e1e1e1',
  },
  closeIcon: {
    color: '#fff',
  },

});
