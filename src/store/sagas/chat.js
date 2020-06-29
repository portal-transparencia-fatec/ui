import {
  takeLatest, put, call, take, fork, select, all,
} from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

import ChatActions, { ChatTypes } from '../ducks/chat';
import Sockets from '../../services/api';
import ChatService from '../../services/api';

const { socketChat } = Sockets;

/**
 * Atualiza os estados do Redux de acordo
 * com os eventos/dados recebidos via WS
 * do Chat
 */
function defaultSocketEvents(chat) {
  /**
   * Cria um canal no redux-saga para disparar
   * actions assíncronas no redux de acordo
   * com os dados recebidos via WS
   */
  return eventChannel((emitter) => {
    chat.socket.on('connect', () => {
      /**
       * Emite action de chat conectado (online)
       */
      emitter(ChatActions.connectSuccess());
    });
    chat.socket.on('disconnect', () => {
      /**
       * Emite action de chat desconectado (offline)
       */
      emitter(ChatActions.disconnectSuccess());
    });
    chat.socket.on('usuario_conectado', (usuarioId) => {
      /**
       * Emite action de usuário online
       */
      emitter(ChatActions.usuarioOnline(Number(usuarioId)));
    });
    chat.socket.on('usuario_desconectado', (usuarioId) => {
      /**
       * Emite action de usuário offline
       */
      emitter(ChatActions.usuarioOffline(Number(usuarioId)));
    });
    return () => {};
  });
}

/**
 * Se inscreve no canal criado do WS
 */
function* defaultSubscriptionEvents(chat) {
  const channel = yield call(defaultSocketEvents, chat);
  /**
   * Loop infinito para escutar as actions
   * do canal criado no redux-saga
   */
  for (; ;) {
    /**
     * Captura a action disparada
     */
    const action = yield take(channel);
    /**
     * Envia a action para a store do redux
     */
    yield put(action);
  }
}

/**
 * Cadastra as conversas do usuário nos eventos do WS
 * e envia as atualizações das mensagens de cada conversa
 * através das actions disparadas dentro do canal criado no
 * redux-saga.
 */
function* conversasSocketEvents() {
  /**
   * Busca as conversas no store do redux
   */
  const { conversas } = yield select(state => (
    state && state.chat && state.chat.conversas ? state.chat : []
  ));

  return eventChannel((emitter) => {
    /**
     * Verifica se está conectado
     */
    if (socketChat.socket.connected) {
      /**
       * Cadastra as conversas nos eventos WS
       */
      conversas.forEach((conversa) => {
        socketChat.socket.on(`conversa.${conversa.id}.atualiza_mensagens`, (mensagem) => {
          /**
           * Emite as mensagens atualizadas de cada conversa
           * através das actions
           */
          emitter(ChatActions.receberMensagem(mensagem));
        });
      });
    }

    return () => {};
  });
}

/**
 * Se inscreve no canal de conversa criado
 */
function* conversasSubscriptionEvents() {
  const channel = yield call(conversasSocketEvents);
  for (; ;) {
    const action = yield take(channel);
    yield put(action);
  }
}

/**
 * Realiza a conexão no chat (online)
 */
function* connect() {
  const { id, unidades } = JSON.parse(localStorage.getItem('@:usuario'));
  if (unidades && unidades.length) {
    const [{ unidade }] = unidades;

    /**
     * Configura a conexão
     */
    socketChat.setupConnection(id, unidade.empresa_id);

    try {
      if (socketChat.socket.disconnected) {
        yield call([socketChat, 'connect']);
      }
      /**
       * Se inscreve nos eventos padrões de forma assíncrona
       */
      yield fork(defaultSubscriptionEvents, socketChat);

      /**
       * Atualiza a store do redux que o usuário está conectado
       */
      yield put(ChatActions.connectSuccess());
    } catch (err) {
      console.log('WebSocket V2Chat ERROR: ', err);
      socketChat.socket.disconnect();
      yield put(ChatActions.connectFailure('Não foi possível se conectar...'));
    }
  }
}

/**
 * Se disconecta do chat (offline)
 */
function* disconnect() {
  try {
    socketChat.socket.disconnect();
    yield put(ChatActions.disconnectSuccess());
  } catch (err) {
    yield put(ChatActions.disconnectFailure('Erro ao desconectar'));
  }
}

/**
 * Carrega os dados do chat
 */
function* loadData() {
  try {
    const [usuarios, conversas] = yield all([
      call([ChatService, 'buscarUsuarios']),
      call([ChatService, 'buscarConversas']),
    ]);

    /**
     * Atualiza a store do redux com os dados buscados
     */
    yield put(ChatActions.setConversas(conversas));
    yield put(ChatActions.setUsuarios(usuarios));

    /**
     * Se inscreve nos eventos de conversa de forma assíncrona
     */
    yield fork(conversasSubscriptionEvents);
  } catch (err) {
    console.log(err);
    yield put(ChatActions.loadDataFailure(err.response.data.err));
  }
}

/**
 * Escuta as actions disparadas dos componentes
 */
export default function* root() {
  yield takeLatest(ChatTypes.CONNECT, connect);
  yield takeLatest(ChatTypes.DISCONNECT, disconnect);
  yield takeLatest(ChatTypes.LOAD_DATA, loadData);
}
