import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';

const { Types, Creators } = createActions({
  setMenu: ['isMenuOpen'],


  signing: ['login', 'senha'],
  signingSuccess: ['user'],
  signingFailure: ['error'],
  setUnidadeAtual: ['unidadeId'],
  setUnidades: ['unidades'],
  signout: null,

  fetchUsuarios: null,
  fetchUsuariosSuccess: ['usuarios'],
  setUsuario: ['usuario', 'index'],
}, { prefix: 'user/' });

export default Creators;
export const UsuarioTypes = Types;

const INITIAL_STATE = Immutable({
  isMenuOpen: true,
  info: [],
  permissoes: [],
  unidades: [],
  isSigning: false,
  isLogged: false,
  error: false,
  message: '',
  usuarios: [],
});

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_MENU]: (state, { isMenuOpen }) => {
    return Immutable.merge(state, { isMenuOpen });
  },


  [Types.SIGNING]: state => Immutable.merge(state, { isSigning: true }),

  [Types.SIGNING_SUCCESS]: state => Immutable.merge(state, {
    isSigning: false, isLogged: true, error: false, message: '',
  }),

  [Types.SIGNING_FAILURE]: (state, { error }) => Immutable
    .merge(state, { isSigning: false, error: true, message: error }),

  [Types.SIGNOUT]: (state) => {
    localStorage.removeItem('@:accessToken');
    localStorage.removeItem('@:usuario');
    return Immutable.merge(state, INITIAL_STATE);
  },
  [Types.SET_UNIDADES]: (state, { unidades }) => Immutable
    .merge(state, { unidades }),
  [Types.SET_UNIDADE_ATUAL]: (state, { unidadeId }) => {
    let unidades = Immutable.asMutable(state.unidades, { deep: true });

    unidades = unidades.map(unidade => ({ ...unidade, current: unidadeId === unidade.unidade.id }));

    return Immutable.merge(state, { unidades });
  },

  [Types.FETCH_USUARIOS_SUCCESS]: (state, { usuarios }) => Immutable
    .merge(state, { usuarios }),
  [Types.SET_USUARIO]: (state, { usuario, index }) => {
    const usuarios = Immutable.asMutable(state.usuarios, { deep: true });

    if ((index !== null || index !== undefined) && typeof index === 'number') {
      usuarios[index] = usuario;
      return Immutable.merge(state, { usuarios });
    }

    if (usuario && usuario.id) {
      const usuarioIndex = usuarios.findIndex(({ id }) => id === usuario.id);

      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = usuario;
      } else {
        usuarios.push(usuario);
      }
    }

    return Immutable.merge(state, { usuarios });
  },
});
