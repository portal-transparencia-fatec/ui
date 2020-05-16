import api from '../api';

export default class CidadeService {
  static async getByUf(uf) {
    const { data } = await api.get(`/clin-core/cidades/${uf}`);

    return data;
  }
}
