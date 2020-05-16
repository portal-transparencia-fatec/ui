import deepPurple from '@material-ui/core/colors/deepPurple';
import styled from 'styled-components';

export const DividerVertical = styled.div`
  height: 100%;
  width: 0.825px;
  background-color: #ccc;
  margin: 0 16px;
`;

export default theme => ({
  assinatura: {
    fontSize: 16,
    minWidth: '15vw',
    fontWeight: 900,
  },
  logo: {
    maxHeight: '24px',
  },
  labelOptions: {
    padding: '4px 0',
    fontWeight: 'bold',
    fontSize: 14,
    position: 'sticky',
  },
  label: {
    color: '#fff',
    alignItems: 'center',
  },
  paper: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    color: '#666',
    // border: '1px solid #d1d1d1',
    borderRadius: 20,
    marginTop: '5px',
    marginBottom: '5px',
    justifyContent: 'space-around',
  },
  drawer: {
    height: 800,
  },
  drawerContent: {
    flex: 1,
    padding: theme.spacing(2),
  },
  table: {
    maxWidth: '100%',
    tableLayout: 'auto',
  },
  tableRow: {
    // padding: '16px 0',
    cursor: 'pointer',
  },
  picture: {
    width: 300,
    height: 300,
    borderRadius: 4,
    borderWidth: 5,
    borderColor: '#000',
  },
  tableCell: {
    fontSize: '0.6vw',
  },
  tableCellHorarios: {
    width: '120px',
    padding: '16px 8px',
    fontWeight: 'bold',
  },
  tableCellLabels: {
    width: '200px',
    padding: '16px 8px',
  },
  tableCellPicture: {
    width: '48px',
    padding: '8px 4px',
  },
  tableCellMensagem: {
    padding: '16px 8px',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  disableRow: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    color: theme.palette.text.disabled,
    cursor: 'default',
  },
  spanLetterTag: {
    backgroundColor: deepPurple['800'],
    textAlign: 'center',
    width: 32,
    height: 32,
    borderRadius: 32,
    color: theme.palette.common.white,
    fontSize: 20,
    margin: 0,
    fontWeight: 300,
  },
});
