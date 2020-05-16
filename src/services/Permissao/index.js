import api from '../api';

export default class PermissaoService {
  static async getAll() {
    const { data } = await api.get('/clin-core/permissoes/pesquisar');

    return data;
  }
}
