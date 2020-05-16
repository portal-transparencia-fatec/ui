import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';

const { Types, Creators } = createActions({
  setRouterTitle: ['routerTitle'],
});

export default Creators;
export const AppConfigTypes = Types;

const INITIAL_STATE = Immutable({
  router: {
    title: '',
  },
}, { prefix: 'app-config/' });

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_ROUTER_TITLE]: (state, { routerTitle }) => Immutable
    .merge(state, { router: { title: routerTitle } }, { deep: true }),
});
