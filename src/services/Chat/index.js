import { apiV2Chat as api } from '../api';

export default class ChatService {
  static async buscarUsuarios() {
    const { data } = await api.get('/usuarios');

    return data;
  }

  static async buscarConversas() {
    const { data } = await api.get('/conversas');

    return data;
  }

  static async buscarMensagens(conversaId, page = 1, perPage = 50) {
    const { data } = await api.get(`/mensagens/conversa/${conversaId}`, {
      params: {
        page,
        perPage,
      },
    });

    return data;
  }

  static async uploadAnexoTemporario(conversaId, file) {
    const formData = new FormData();

    formData.append('file', file, file.name);

    const { data } = await api.post('/anexo/temporario', formData, { params: { conversaId } });

    return data;
  }

  static async excluirAnexoTemporario(anexo) {
    const { data } = await api.delete(`/anexo/temporario/${anexo.caminho}`);

    return data;
  }

  static async downloadAnexo(anexo) {
    const { data } = await api.get(`/anexo/${anexo.caminho}`, { responseType: 'blob' });

    return data;
  }
}
