import api from '../api';

export default class EstadoService {
  static async all() {
    const { data } = await api.get('/clin-core/estados/pesquisar');

    return data;
  }

  static async getByUf(uf) {
    const { data } = await api.get(`/clin-core/estados/${uf}`);

    return data;
  }
}
