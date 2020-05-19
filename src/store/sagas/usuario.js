import {
  takeLatest, put, call, select,
} from 'redux-saga/effects';
import { replace } from 'connected-react-router';
import UsuarioService from '../../services/api';

import UsuarioActions, { UsuarioTypes } from '../ducks/usuario';
import NotifierActions from '../ducks/notifier';

function* setUnidades(user) {
  if (user && user.unidades) {
    const usuario = user;
    usuario.unidades = usuario.unidades.map((uni, index) => ({ ...uni, current: index === 0 }));
    yield put(UsuarioActions.setUnidades(usuario.unidades));
  }
}

function* signing({ login, senha }) {
  try {
    const { usuario, accessToken } = yield call([UsuarioService, 'login'], login, senha);
    localStorage.setItem('@clin:accessToken', accessToken);
    // const usuario = yield call(UsuarioService.whoami);
    yield call(setUnidades, usuario);
    localStorage.setItem('@clin:usuario', JSON.stringify(usuario));

    yield put(UsuarioActions.signingSuccess());
    yield put(replace('/app'));
  } catch ({ response: { data: { err } } }) {
    yield put({
      ...UsuarioActions.signingFailure(err),
      notifier: {
        message: err,
        options: {
          variant: 'error',
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        },
      },
    });
  }
}

function* signout() {
  // yield put(replace('/login'));
}

function* checkAuth() {
  const token = localStorage.getItem('@clin:accessToken');

  if (!token) {
    // return yield put(replace('/login'));
  }
  yield call(setUnidades, JSON.parse(localStorage.getItem('@clin:usuario')));
  yield put(UsuarioActions.signingSuccess());

  const { pathname } = yield select(state => state.router.location);

  // if (pathname && pathname !== '/login') {
  //   return yield put(replace(pathname));
  // }

  return yield put(replace('/app'));
}

function* fetchUsuarios() {
  try {
    const usuarios = yield call([UsuarioService, 'getAll']);

    yield put(UsuarioActions.fetchUsuariosSuccess(usuarios));
  } catch (err) {
    console.log(err);
    yield put(NotifierActions.notifyError('Não foi possível carregar os usuários do sistema'));
  }
}

export default function* root() {
  yield takeLatest(UsuarioTypes.SIGNING, signing);
  yield takeLatest(UsuarioTypes.SIGNOUT, signout);

  yield takeLatest(UsuarioTypes.FETCH_USUARIOS, fetchUsuarios);

  yield call(checkAuth);
}
