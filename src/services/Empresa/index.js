import api from '../api';

export default class EmpresaService {
  static async save(empresaForm) {
    const { data } = await api.post('/clin-core/empresas/salvar', empresaForm);

    return data;
  }

  static async getAll() {
    const { data } = await api.get('/clin-core/empresas/pesquisar');

    return data;
  }

  static async getById(id) {
    const { data } = await api.get(`/clin-core/empresas/${id}`);

    return data;
  }
}
