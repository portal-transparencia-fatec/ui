export default theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  containerExpansion: {
    height: 250,
    overflow: 'auto',
  },
  picture: {
    width: 275,
    height: 275,
    borderRadius: 4,
    borderWidth: 5,
    borderColor: '#000',
  },
});
