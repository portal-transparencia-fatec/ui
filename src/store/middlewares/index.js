import NotificationActions from '../ducks/notifier';
import { UsuarioTypes } from '../ducks/usuario';
import ChatActions, { ChatTypes } from '../ducks/chat';

const notifierMiddleware = ({ dispatch }) => next => (action) => {
  if (Object.prototype.hasOwnProperty.call(action, 'notifier')) {
    const { message, options } = action.notifier;
    dispatch(NotificationActions.notify(message, options));
  }

  return next(action);
};

const signoutMiddleware = ({ dispatch }) => next => (action) => {
  if (action.type === UsuarioTypes.SIGNOUT) {
    dispatch(ChatActions.disconnect());
  }

  return next(action);
};

const closeCurrentChatMiddleware = ({ getState, dispatch }) => next => (action) => {
  const { chat } = getState();
  if (action.type === ChatTypes.SET_VISIBLE && !action.visibility) {
    dispatch(ChatActions.closeCurrentChat());
  }

  if (action.type === ChatTypes.TOGGLE_VISIBLE && chat.isVisible) {
    dispatch(ChatActions.closeCurrentChat());
  }

  next(action);
};

export default [
  notifierMiddleware,
  signoutMiddleware,
  closeCurrentChatMiddleware,
];
