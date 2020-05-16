export default theme => ({
  root: {
    position: 'absolute',
    [theme.breakpoints.down('md')]: {
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    },
    [theme.breakpoints.up('md')]: {
      right: theme.spacing(3),
      bottom: theme.spacing(3),
    },
    zIndex: 998,
  },
  paper: {
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      width: '100% !important',
      height: '100% !important',
    },
    [theme.breakpoints.up('md')]: {
      height: 489,
      width: 360,
    },
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: theme.spacing(),
  },
  buttonConnect: {
    maxHeight: 38,
  },
  icons: {
    color: theme.palette.common.white,
  },
  titleChatToolbar: {
    flex: 1,
    color: theme.palette.common.white,
  },
});
