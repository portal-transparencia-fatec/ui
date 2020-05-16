export default theme => ({
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  formFilter: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  tableCellHorarios: {
    width: '40%',
    padding: '16px 8px',
    fontWeight: 'bold',
  },
  cellHorarios: {
    width: '40%',
  },
  tableCellExpansion: {
    padding: '0 !important',
  },
  tableRow: {
    padding: '8px 0',
    cursor: 'pointer',
  },
  disableRow: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    color: theme.palette.text.disabled,
    cursor: 'default',
  },
  table: {
    width: '100%',
    // overflowX: 'scroll',
    tableLayout: 'auto',
  },
});
