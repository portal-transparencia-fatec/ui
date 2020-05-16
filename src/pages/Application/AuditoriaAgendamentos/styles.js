export default theme => ({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
  },
  paper: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    flex: 1,
    overflowX: 'hidden',
    width: 1000,
    maxHeight: '100%',
  },
  table: {
    width: '100%',
    overflowX: 'scroll',
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
