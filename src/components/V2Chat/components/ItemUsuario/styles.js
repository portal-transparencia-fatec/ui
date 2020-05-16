import lightGreen from '@material-ui/core/colors/lightGreen';

export default theme => ({
  tituloUsuario: {
    fontSize: theme.typography.pxToRem(13.5),
  },
  subtituloUsuario: {
    display: 'inline',
    fontSize: theme.typography.pxToRem(13),
  },
  avatar: {
    backgroundColor: lightGreen['800'],
  },
});
