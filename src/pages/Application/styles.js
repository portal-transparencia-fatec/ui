import logoBgTransparent from '../../assets/images/logo-bg-transparent.png';

const drawerWidth = 260;

export const Material = theme => ({
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'auto',
    backgroundColor: '#e1e1e1',
  },
  appBar: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 70, 116)',
    height: '7vh',
    // backgroundColor: theme.palette.grey[300],
    // color: theme.palette.grey[800],
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  grow: {
    flexGrow: 1,
  },

  multilineColor:{
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '1.2vw',
  },
  menuButton: {
    // marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7.1),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7.1),
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '5px 8px',
    // ...theme.mixins.toolbar,
  },
  toolbarLogo: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundImage: `url(${logoBgTransparent})`,
    backgroundRepeat: 'no-repeat',
    backgroundPositionX: 'center',
    backgroundSize: 'contain',
  },
  logoTitle: {
    height: 32,
    marginRight: theme.spacing(2),
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    flexGrow: 1,
    height: '94vh',
    marginTop: '6vh',
  },
  barIcons: {
    color: theme.palette.common.white,
  },
  menuUnidadesRoot: {
    width: '100%',
    maxWidth: 'fit-content',
    backgroundColor: theme.palette.primary.main,
  },
  unidadeListItemTextPrimary: {
    color: theme.palette.grey[200],
    textAlign: 'end',
    fontWeight: 300,
  },
  unidadeListItemTextSecondary: {
    color: theme.palette.grey[100],
    textAlign: 'end',
    fontWeight: 600,
  },
});
