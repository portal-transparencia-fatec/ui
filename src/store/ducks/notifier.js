import { createActions, createReducer } from 'reduxsauce';
import uuid from 'uuid/v1';

const { Types, Creators } = createActions({
  notify: ['message', 'options'],
  notifySuccess: ['message', 'options'],
  notifyError: ['message', 'options'],
  removeSnackbar: ['key'],
  clear: [],
}, { prefix: 'notifier/' });

export default Creators;
export const NotifierTypes = Types;

const INITIAL_STATE = {
  notifications: [],
};

export const reducer = createReducer(INITIAL_STATE, {
  [Types.NOTIFY]: (state, { message, options }) => ({
    ...state,
    notifications: [
      ...state.notifications,
      { key: uuid(), message, options },
    ],
  }),
  [Types.NOTIFY_SUCCESS]: (state, { message, options = {} }) => ({
    ...state,
    notifications: [
      ...state.notifications,
      { key: uuid(), message, options: { ...options, variant: 'success' } },
    ],
  }),
  [Types.NOTIFY_ERROR]: (state, { message, options = {} }) => ({
    ...state,
    notifications: [
      ...state.notifications,
      { key: uuid(), message, options: { ...options, variant: 'error' } },
    ],
  }),
  [Types.REMOVE_SNACKBAR]: (state, { key }) => ({
    ...state,
    notifications: state.notifications.filter(notification => notification.key !== key),
  }),
  [Types.CLEAR]: () => INITIAL_STATE,
});
