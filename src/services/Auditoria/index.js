import api from '../api';

export default class AuditoriaService {
  static async getAllTables() {
    const { data } = await api.get('/clin-auditory/auditory/tabelas');

    return data;
  }

  static async getAllColumns(tabela) {
    const { data } = await api.get('/clin-auditory/auditory/tabelas/colunas', { params: { tabela } });
    return data;
  }

  static async getAll({
    tabela,
    empresaUnidade,
    dateStartOcorrencia,
    dateNowOcorrencia,
    dateStartAgendamento = undefined,
    dateNowAgendamento = undefined,
    paciente = undefined,
    agendaMedico = undefined,
    ocorrencia = undefined,
    pagina,
    limite = 50,
  }) {
    const { data } = await api.get(`/clin-auditory/auditory/tabelas/${tabela}`, {
      params: {
        empresaUnidade,
        limite,
        pagina,
        acao: ocorrencia,
        nomePaciente: paciente,
        medico: agendaMedico,
        dataInicial: dateStartOcorrencia,
        dataFinal: dateNowOcorrencia,
        dataAgendamentoInicial: dateStartAgendamento,
        dataAgendamentoFinal: dateNowAgendamento,
      },
    });
    return { ...data, resultados: JSON.parse(data.resultados) };
  }
}
