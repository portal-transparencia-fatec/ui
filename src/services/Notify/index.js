import api from '../api';

export default class NotifyAgendamentos {
  static async notifyMeusAgendamentos({ medico, empresaUnidade, date }) {
    const { data } = await api.get('/clin-notify/notify/agendamentos', {
      params: { medico, empresaUnidade, data: date },
    });
    return data;
  }
}
