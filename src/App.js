import './config/reactotron';
import './config/moment';
import 'react-dates/initialize';
import React, { Fragment } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { SnackbarProvider } from 'notistack';

import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/moment';
import GlobalStyle from './styles/global';
import './assets/css/react-dates.css';
import theme from './styles/theme';

import store, { history } from './store';

import Routes from './routes';

const App = () => (
  <Fragment>
    <CssBaseline />
    <GlobalStyle />
    <MuiThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <SnackbarProvider maxSnack={5}>
              <Routes />
            </SnackbarProvider>
          </ConnectedRouter>
        </Provider>
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  </Fragment>
);

export default App;
