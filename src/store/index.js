import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import reducers from './ducks';
import sagas from './sagas';
import customMiddlewares from './middlewares';

export const history = createBrowserHistory();

const sagaMonitor = console.tron ? console.tron.createSagaMonitor() : null;
const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
const createAppropriateStore = console.tron ? console.tron.createStore : createStore;

const storeMiddlewares = [
  sagaMiddleware,
  routerMiddleware(history),
  ...customMiddlewares,
];

const store = createAppropriateStore(
  reducers(history),
  compose(applyMiddleware(...storeMiddlewares)),
);

sagaMiddleware.run(sagas);

export default store;
