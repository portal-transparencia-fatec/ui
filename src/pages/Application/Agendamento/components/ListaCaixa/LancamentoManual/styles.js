import styled from 'styled-components';

export const Divider = styled.div`
  height: 100%;
  width: 0.825px;
  background-color: #ccc;
  margin: 0 16px;
`;

export default theme => ({
  rowIndex: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: '#e1e1e1',
    color: 'rgb(102, 102, 102)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawer: {
    height: '65vh',
    backgroundColor: '#e1e1e1',
  },
  label: {
    color: 'rgb(102, 102, 102)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  drawerContent: {
    flex: 1,
    padding: theme.spacing(2),
  },
  tabs: {
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'center',
  },
  appbar: {
    overflow: 'hidden',
  },
  paper: {
    flex: 1,
    padding: theme.spacing(1),
    height: 'fit-content',
  },
  paperHorarios: {
    height: '100%',
  },
  paperPagamentos: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #d1d1d1',
    borderRadius: 5,
    marginTop: '10px',
    marginBottom: '10px',
    justifyContent: 'space-around',
  },
});
