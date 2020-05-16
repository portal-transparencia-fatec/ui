import io from 'socket.io-client';
import Chat from './sockets/Chat';

const wsAgenda = process.env.REACT_APP_V2_WS_AGENDA;
// const wsAgenda = 'http://localhost:7200/agenda';
const wsV2Chat = 'https://chat.v2saude.com.br/clin-chat';
const wsPainel = process.env.REACT_APP_V2_WS_PAINEL;
// const wsV2Chat = 'http://localhost:7700/clin-chat';
const accessToken = localStorage.getItem('@clin:accessToken');

const Sockets = {
  socketAgenda(unidadeId) {
    if (!unidadeId) return null;

    return io(
      wsAgenda,
      {
        autoConnect: false,
        path: '/ws-clin',
        query: {
          accessToken,
          unidadeId,
        },
        transports: ['websocket'],
      },
    );
  },

  socketPainel(unidadeId, empresaId, usuarioId) {
    if (!unidadeId || !empresaId || !usuarioId) return null;
    return io(
      wsPainel,
      {
        autoConnect: false,
        path: '/ws-clin',
        query: {
          accessToken,
          unidadeId,
          empresaId,
          usuarioId,
        },
        transports: ['websocket'],
      },
    );
  },

  socketChat: new Chat(wsV2Chat),
};

export default Sockets;
