export default theme => ({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    overflow: 'auto',
  },
  root: {
    margin: theme.spacing(3),
    overflow: 'auto',
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
});
