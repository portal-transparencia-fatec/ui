/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-const-assign */
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

let theme = createMuiTheme({
  spacing: 8,
  shape: {
    borderRadius: 2,
  },
  overrides: {
    MuiAppBar: {
      root: {
        zIndex: 1,
      },
    },
    MuiTab: {
      root: {
        minWidth: 0,
        '@media (min-width: 0px)': {
          justifyContent: 'space-between',
          minWidth: 100,
        },
      },
    },
  },
  typography: {
    useNextVariants: true,
    fontSize: 12,
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e1e1e1',
    },
    button: {
      default: {
        dark: '#777',
        main: '#999',
        light: '#BBB',
      },
      success: {
        dark: '#549c64',
        main: '#78e08f',
        light: '#93e6a5',
      },
      error: {
        dark: '#a42004',
        main: '#eb2f06',
        light: '#ef5837',
      },
    },
    error: {
      main: '#e57878',
    },
    success: {
      main: '#30b72d',
    },
    background: {
      default: '#000',
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
