import deepPurple from '@material-ui/core/colors/deepPurple';

export default theme => ({
  table: {
    width: '100%',
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
