import api from '../api';

export default class HorarioBloqueado {
  static async save(horarioBloqueadoForm) {
    const { data } = await api.post('/clin-agenda/horariosbloqueados/salvar', horarioBloqueadoForm);

    return data;
  }

  static async pesquisar({
    dataInicial, dataFinal, empresaUnidade, usuario, ativo = true,
  }) {
    const { data } = await api.get('/clin-agenda/horariosbloqueados/pesquisar', {
      params: {
        dataInicial,
        dataFinal,
        empresaUnidade,
        usuario,
        ativo,
      },
    });

    return data;
  }

  static async buscar({ horarioId: id, empresaUnidade }) {
    const { data } = await api.get(`/clin-agenda/horariosbloqueados/pesquisar/${id}`, { params: { empresaUnidade } });

    return data;
  }

  static async excluir(horarioId) {
    const { data } = await api.delete('/clin-agenda/horariosbloqueados/excluir', { params: { horarioBloqueado: horarioId } });

    return data;
  }
}
