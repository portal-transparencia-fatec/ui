export default theme => ({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  paper: {
    flex: 1,
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    // maxWidth: 540,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
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
