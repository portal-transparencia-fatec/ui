export default theme => ({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
  },
  paper: {
    flex: 1,
    padding: theme.spacing(1),
    height: 'fit-content',
  },
  table: {
    width: '100%',
    overflowX: 'scroll',
    tableLayout: 'auto',
  },

  tableCell: {
    fontSize: 13,
  },

  cellPagamentos: {
    width: '100%',
    fontWeight: 900,
  },
  cellDescricao: {
    width: '36%',
    fontWeight: 900,
  },

  cellPagamento: {
    width: '10%',
    fontWeight: 900,
  },

  cellVencimento: {
    width: '8%',
    fontWeight: 900,
  },

  cellValor: {
    width: '10%',
    fontWeight: 900,
  },

  cellMenu: {
    width: '4%',
    fontWeight: 900,
  },

  cellStatus: {
    width: '8%',
    fontWeight: 900,
  },

  cellToggle: {
    width: '8%',
    fontWeight: 900,
  },

  inputMedicoRoot: {
    color: theme.palette.common.white,
    width: '100%',
  },
  inputOcorrencia: {
    padding: '16px 0',
    backgroundColor: theme.palette.primary.light,
    cursor: 'pointer',
    zIndex: 100,
    textAlign: 'center',
    fontSize: 18,
  },
  textfield: {
    margin: theme.spacing(3),
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: 680,
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
    fontWeight: 300,
  },
  inactive: {
    color: theme.palette.error.main,
  },
  paginationLeft: {
    flex: 'none',
  },
});
