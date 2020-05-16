import api from '../api';

export default class NotificacaoService {
  static async getAll() {
    const { data } = await api.get('/clin-core/permissoes/notificacoes/pesquisar');

    return data;
  }
}
