import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import moment from 'moment';

const { Types, Creators } = createActions({
  toggleVisible: null,
  setVisible: ['visibility'],

  connect: null,
  connectSuccess: null,
  connectFailure: ['error'],

  disconnect: null,
  disconnectSuccess: null,
  disconnectFailure: ['error'],

  loadData: null,
  loadDataFailure: ['error'],

  setConversas: ['conversas'],

  setUsuarios: ['usuarios'],
  usuarioOnline: ['usuarioId'],
  usuarioOffline: ['usuarioId'],

  openCurrentChat: ['conversaId'],
  closeCurrentChat: null,

  atualizarMensagensVisualizadas: ['conversaId', 'mensagensVisualizadas'],
  atualizarMensagem: ['mensagem'],
  receberMensagem: ['mensagem'],
}, { prefix: 'chat/' });

export default Creators;
export const ChatTypes = Types;

const INITIAL_STATE = Immutable({
  isVisible: false,
  loading: false,
  isConnected: false,
  connecting: false,
  conversas: [],
  usuarios: {
    empresa: [],
    suporte: [],
  },
  error: false,
  message: '',
});

export const reducer = createReducer(INITIAL_STATE, {
  [Types.TOGGLE_VISIBLE]: state => Immutable.merge(state, { isVisible: !state.isVisible }),
  [Types.SET_VISIBLE]: (state, { visibility }) => Immutable
    .merge(state, { isVisible: Boolean(visibility) }),

  [Types.CONNECT_SUCCESS]: state => Immutable.merge(state, { isConnected: true }),
  [Types.CONNECT_FAILURE]: (state, { error }) => Immutable
    .merge(state, { error: !!error, message: error, isConnected: false }),

  [Types.DISCONNECT_SUCCESS]: state => Immutable.merge(state, INITIAL_STATE),
  [Types.DISCONNECT_FAILURE]: (state, { error }) => Immutable
    .merge(state, { error: !!error, message: error }),

  [Types.LOAD_DATA]: state => Immutable.merge(state, { loading: true }),
  [Types.LOAD_DATA_FAILURE]: (state, { error }) => Immutable
    .merge(
      state,
      {
        error: !!error,
        message: error,
        isConnected: false,
        loading: false,
      },
    ),

  [Types.SET_CONVERSAS]: (state, { conversas }) => Immutable
    .merge(state, {
      error: false, message: '', loading: false, conversas,
    }),

  [Types.SET_USUARIOS]: (state, { usuarios }) => Immutable
    .merge(state, { usuarios }),
  [Types.USUARIO_ONLINE]: (state, { usuarioId }) => {
    const usuarios = Immutable.asMutable(state.usuarios, { deep: true });

    const usuarioEmpresaIndex = usuarios.empresa.findIndex(usuario => usuario.id === usuarioId);
    const usuarioSuporteIndex = usuarios.suporte.findIndex(usuario => usuario.id === usuarioId);

    if (usuarioEmpresaIndex !== -1) {
      usuarios.empresa[usuarioEmpresaIndex].conectado = 1;
    }

    if (usuarioSuporteIndex !== -1) {
      usuarios.suporte[usuarioSuporteIndex].conectado = 1;
    }

    return Immutable.merge(state, { usuarios });
  },
  [Types.USUARIO_OFFLINE]: (state, { usuarioId }) => {
    const usuarios = Immutable.asMutable(state.usuarios, { deep: true });

    const usuarioEmpresaIndex = usuarios.empresa.findIndex(usuario => usuario.id === usuarioId);
    const usuarioSuporteIndex = usuarios.suporte.findIndex(usuario => usuario.id === usuarioId);

    if (usuarioEmpresaIndex !== -1) {
      usuarios.empresa[usuarioEmpresaIndex].conectado = 0;
    }

    if (usuarioSuporteIndex !== -1) {
      usuarios.suporte[usuarioSuporteIndex].conectado = 0;
    }

    return Immutable.merge(state, { usuarios });
  },

  [Types.OPEN_CURRENT_CHAT]: (state, { conversaId }) => {
    const conversas = Immutable.asMutable(state.conversas, { deep: true });
    const conversaIndex = conversas.findIndex(({ id }) => conversaId === id);

    if (conversaIndex !== -1) {
      const conversa = { ...conversas[conversaIndex] };
      conversa.current = true;
      conversas.splice(conversaIndex, 1, conversa);
    }

    return Immutable.merge(state, { conversas });
  },
  [Types.CLOSE_CURRENT_CHAT]: (state) => {
    const conversas = Immutable.asMutable(state.conversas, { deep: true });
    const conversaIndex = conversas.findIndex(conversa => conversa.current);

    if (conversaIndex !== -1) {
      const conversa = { ...conversas[conversaIndex] };
      conversa.current = false;
      conversas.splice(conversaIndex, 1, conversa);
    }

    return Immutable.merge(state, { conversas });
  },

  [Types.ATUALIZAR_MENSAGENS_VISUALIZADAS]: (state, { conversaId, mensagensVisualizadas }) => {
    const conversas = Immutable.asMutable(state.conversas, { deep: true });
    const conversaIndex = conversas.findIndex(({ id }) => conversaId === id);
    const formatDate = date => moment(date).format('YYYY-MM-DD HH:mm:ss');

    if (conversaIndex !== -1) {
      const mensagensAtualizadas = conversas[conversaIndex].mensagens.map((mensagem) => {
        const mensagemIndex = mensagensVisualizadas
          .findIndex(({ id, criadaEm, remetente }) => (id === mensagem.id)
            || (formatDate(criadaEm) === formatDate(mensagem.criadaEm)
              && remetente.id === mensagem.remetente.id));
        if (mensagemIndex !== -1) {
          return {
            ...mensagem,
            visualizadaEm: mensagensVisualizadas[mensagemIndex].visualizadaEm,
          };
        }
        return mensagem;
      });

      conversas[conversaIndex].mensagens = mensagensAtualizadas;
    }

    return Immutable.merge(state, { conversas });
  },
  [Types.ATUALIZAR_MENSAGEM]: (state, { mensagem }) => {
    const conversas = Immutable.asMutable(state.conversas, { deep: true });
    const conversaIndex = conversas.findIndex(({ id }) => mensagem.conversa_id === id);

    if (conversaIndex !== -1) {
      const mensagemIndex = conversas[conversaIndex]
        .mensagens.findIndex(({ enviadaEm }) => enviadaEm === mensagem.enviadaEm);

      if (mensagemIndex !== -1) {
        conversas[conversaIndex].mensagens[mensagemIndex] = mensagem;
      }
    }

    return Immutable.merge(state, { conversas });
  },
  [Types.RECEBER_MENSAGEM]: (state, { mensagem }) => {
    const conversas = Immutable.asMutable(state.conversas, { deep: true });
    const conversaIndex = conversas.findIndex(({ id }) => mensagem.conversa_id === id);

    if (conversaIndex !== -1) {
      conversas[conversaIndex].mensagens.unshift(mensagem);
    }

    return Immutable.merge(state, { conversas });
  },
});
