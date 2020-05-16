export default theme => ({
  root: {
    flex: 1,
    display: 'flex',
    height: '100%',
    overflow: 'auto',
    margin: theme.spacing(3),
    flexDirection: 'column',
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
  toolbar: {
    backgroundColor: theme.palette.primary.main,
    width: '100%',
  },
  rootSelectConvenio: {
    width: '100%',
    maxWidth: 'fit-content',
    backgroundColor: theme.palette.primary.main,
  },
  convenioListItemTextPrimary: {
    color: theme.palette.grey[200],
    textAlign: 'end',
    fontWeight: 400,
    fontSize: 15,
  },
  convenioListItemTextSecondary: {
    color: theme.palette.grey[100],
    textAlign: 'end',
    fontWeight: 600,
  },
  inactive: {
    color: theme.palette.error.main,
  },
  active: {
    color: theme.palette.primary.main,
  },
  selectedGrupo: {
    backgroundColor: theme.palette.grey[200],
  },
});
