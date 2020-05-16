export default theme => ({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  paper: {
    flex: 1,
    padding: theme.spacing(2.5),
    height: 'fit-content',
  },
  formControl: {
    width: '100%',
    minWidth: 120,
  },
  textfield: {
    alignSelf: 'stretch',
    width: '100%',
  },
  textInstructions: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    alignSelf: 'stretch',
  },
});
