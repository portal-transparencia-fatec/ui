export default theme => ({
  container: {
    flex: 1,
    display: 'flex',
    // height: '100%',
  },
  content: {
    flex: 1,
    display: 'flex',
    // height: '100%',
  },
  button: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    alignSelf: 'stretch',
  },
  paper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: '20px',
    marginBottom: '20px',
  },
  textfield: {
    alignSelf: 'stretch',
    width: '100%',
  },
  textInstructions: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing(),
  },
});
