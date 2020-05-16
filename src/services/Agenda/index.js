import api from '../api';


export default class AgendaService {
  static async saveHorarioAgenda(form) {
    const { data } = await api.post('/clin-agenda/agendas/salvar/', form);

    return data;
  }

  static async atualizarHorarioAgenda(form) {
    const { data } = await api.put('/clin-agenda/agendas/atualizar/', form);

    return data;
  }

  static async pesquisarHorariosAgenda({ empresaUnidade, usuario, data = undefined }) {
    const { data: responseData } = await api.get('/clin-agenda/agendas/horarios', { params: { empresaUnidade, usuario, data } });

    const horariosAgenda = responseData.reduce((arr, horario) => {
      if (horario.agenda && horario.agenda.grupoAgendamento) {
        const containsAgendamentoEstendido = arr
          .some(({ agenda }) => agenda
            && (agenda.grupoAgendamento === horario.agenda.grupoAgendamento));

        if (containsAgendamentoEstendido) {
          return arr;
        }

        const agendamentosAgrupados = responseData
          .filter(({ agenda }) => agenda
            && (agenda.grupoAgendamento === horario.agenda.grupoAgendamento));

        const { horaInicial, ...rest } = agendamentosAgrupados[0];
        const { horaFinal } = agendamentosAgrupados[agendamentosAgrupados.length - 1];
        rest.agenda.grupoAgendamentoLength = agendamentosAgrupados.length;

        return [...arr, { ...rest, horaInicial, horaFinal }];
      }

      return [...arr, horario];
    }, []);

    return { horariosAgenda, responseData };
  }

  static async pesquisarHorariosDisponíveis({
    empresaUnidade, convenio, evento, ...rest
  }) {
    const { data } = await api.get('/clin-agenda/agendas/horarios/disponiveis', {
      params: {
        empresaUnidade, convenio, evento, ...rest,
      },
    });

    return data;
  }

  static async pesquisarHorariosPaciente({
    empresaUnidade, paciente = undefined, nomePaciente, dataInicial = undefined, dataFinal = undefined,
  }) {
    const { data } = await api.get('/clin-agenda/agendas/horarios/pacientes', {
      params: {
        empresaUnidade, paciente, dataInicial, dataFinal, nomePaciente,
      },
    });

    return data;
  }

  static async pesquisarDisponibilidades({
    dataInicial, dataFinal, usuario, empresaUnidade,
  }) {
    const { data } = await api.get('/clin-agenda/agendas/disponibilidades', {
      params: {
        dataInicial, dataFinal, usuario, empresaUnidade,
      },
    });

    return data;
  }

  static async excluirAgendamento({
    empresaUnidade, data, hora, usuario,
  }) {
    const { data: responseData } = await api.delete('/clin-agenda/agendas/excluir', {
      params: {
        empresaUnidade, data, hora, usuario,
      },
    });

    return responseData;
  }
}
