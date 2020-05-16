export default theme => ({
  root: {
    flex: 1,
    // display: 'flex',
    // height: '100%',
    // overflow: 'auto',
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
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing(0.25),
  },
  tableCellStatus: {
    maxWidth: 19,
  },
  tableRow: {
    cursor: 'pointer',
  },
});
