import api from '../api';

export default class EmpresaUnidadeService {
  static async save(empresaUnidadeForm) {
    const { data } = await api.post('/clin-core/empresas/unidades/salvar', empresaUnidadeForm);

    return data;
  }

  static async getAll() {
    const { data } = await api.get('/clin-core/empresas/unidades/pesquisar');

    return data;
  }

  static async getById(id) {
    const { data } = await api.get(`/clin-core/empresas/unidades/${id}`);

    return data;
  }
}
