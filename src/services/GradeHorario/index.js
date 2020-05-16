import api from '../api';

export default class GradeHorarioService {
  static async gerarHorario(form) {
    const { data } = await api.post('/clin-agenda/gradehorarios/gerar', form);

    return data;
  }

  static async atualizarHorario(id, form) {
    const { data } = await api.put(`/clin-agenda/gradehorarios/atualizar/regras/${id}`, undefined, { params: { ...form } });

    return data;
  }

  static async pesquisarPeriodoSemanal({
    empresaUnidade, diasSemana, usuario, ...rest
  }) {
    const { data } = await api.get('/clin-agenda/gradehorarios/pesquisar/semana', {
      params: {
        empresaUnidade, diasSemana, usuario, ...rest,
      },
    });

    return data;
  }

  static async pesquisarDataEspecifica({
    empresaUnidade, usuario, dataFinal, dataInicial, ...rest
  }) {
    const { data } = await api.get('/clin-agenda/gradehorarios/pesquisar/especifico', {
      params: {
        empresaUnidade, dataFinal, dataInicial, usuario, ...rest,
      },
    });

    return data;
  }

  static async pesquisarRegras({
    empresaUnidade, usuario, data, hora,
  }) {
    const { data: responseData } = await api.get('/clin-agenda/gradehorarios/pesquisar/regras', {
      params: {
        empresaUnidade, usuario, data, hora,
      },
    });

    return responseData;
  }

  static async atualizarStatus(id) {
    const { data } = await api.put(`/clin-agenda/gradehorarios/atualizar/status/${id}`);

    return data;
  }
}
