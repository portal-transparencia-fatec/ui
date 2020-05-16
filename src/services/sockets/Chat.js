import io from 'socket.io-client';

class Chat {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.socket = null;
    this.empresaId = null;
  }

  setupConnection(usuarioId, empresaId) {
    this.empresaId = empresaId;
    this.socket = io(
      this.baseURL,
      {
        autoConnect: false,
        path: '/ws-v2-chat',
        query: {
          accessToken: localStorage.getItem('@clin:accessToken'),
          empresaId,
          usuarioId,
        },
        transports: ['websocket'],
      },
    );
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket.on('error', reject);
      this.socket.on('connect_error', reject);
      this.socket.on('connect', resolve);
      this.socket.open();
    });
  }

  enviar(mensagem) {
    return new Promise((resolve, reject) => {
      this.socket.emit(`mensagem.${this.empresaId}`, mensagem, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  }
}

export default Chat;
