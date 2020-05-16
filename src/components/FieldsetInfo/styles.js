export default theme => ({
  uppercase: {
    textTransform: 'uppercase',
  },
  label: {
    color: theme.palette.grey[500],
    fontSize: theme.typography.pxToRem(13),
    border: 0,
  },
  info: {
    color: theme.palette.grey[700],
    fontSize: theme.typography.pxToRem(15),
    marginBottom: theme.spacing(0),
    border: 0,
    whiteSpace: 'pre-wrap',
  },
});
