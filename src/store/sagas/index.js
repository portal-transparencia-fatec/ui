import { all } from 'redux-saga/effects';

import sagaUsuario from './usuario';
import sagaChat from './chat';

export default function* rootSaga() {
  yield all([
    sagaUsuario(),
    sagaChat(),
  ]);
}
