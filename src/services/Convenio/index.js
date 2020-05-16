import api from '../api';

export default class ConvenioService {
  static async save(convenioForm) {
    const { data } = await api.post('/clin-core/convenios/salvar', convenioForm);

    return data;
  }

  static async getAll(chave = undefined, ativo = true) {
    const { data } = await api.get('/clin-core/convenios/pesquisar', { params: { chave, ativo } });

    return data;
  }

  static async getAllPlanos(chave = undefined, ativo = true) {
    const { data } = await api.get('/clin-core/convenios/pesquisar', { params: { chave, ativo } });

    return data
      .map(({ id, nome, planos }) => planos.map(plano => ({
        id: plano.id, nome: plano.nome, idConvenio: id, nomeConvenio: nome,
      })))
      .reduce((a, b) => [...a, ...b]);
  }

  static async getById(convenioId) {
    const { data } = await api.get(`/clin-core/convenios/pesquisar/${convenioId}`);

    return data;
  }

  static async atualizarStatus(id) {
    const { data } = await api.put(`/clin-core/convenios/atualizar/status/${id}`);

    return data;
  }
}
