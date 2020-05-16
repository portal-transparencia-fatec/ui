export default theme => ({
  paper: {
    flex: 1,
    padding: theme.spacing(1),
    height: 'fit-content',
  },
  form: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  containerButton: {
    marginTop: theme.spacing(3),
  },
  rootProgress: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 500,
  },
  tableRow: {
    cursor: 'pointer',
  },
});
