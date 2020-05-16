import api from '../api';

export default class ProdoctorService {
  static async buscarUsuariosPorUnidade(unidade, empresa) {
    const { data } = await api.get('/clin-prodoctor/prodoctor/usuarios', { params: { unidade, empresa } });

    return data;
  }
}
