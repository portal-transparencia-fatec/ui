import deepPurple from '@material-ui/core/colors/deepPurple';

export default theme => ({
  paper: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #d1d1d1',
    borderRadius: 5,
    marginTop: '10px',
    marginBottom: '10px',
    justifyContent: 'space-around',
  },
  tableCell: {
    fontSize: '0.8vw',
  },
  table: {
    width: '100%',
    tableLayout: 'auto',
  },
  label: {
    color: 'rgb(102, 102, 102)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  button: {
    margin: 10,
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    alignSelf: 'stretch',
  },
  tab: {
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPanel: {
    width: '100%',
  },
  tableRow: {
    cursor: 'pointer',
  },
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

  rowItemIndex: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: '#0662a1',
    fontSize: 13,
    color: '#FFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuIsVisible: {
    justifyContent: 'center',
  },
  menuHidden: {
    visibility: 'hidden',
  },
  tabs: {
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'center',
  },
  appbar: {
    overflow: 'hidden',
  },
  active: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  inactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
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
