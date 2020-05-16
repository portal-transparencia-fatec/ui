import api from '../api';

export default class EventoService {
  static async saveGrupoEvento(formGrupoEvento) {
    const { data } = await api.post('/clin-agenda/gruposeventos/salvar', formGrupoEvento);

    return data;
  }

  static async saveEvento(formEvento) {
    const { data } = await api.post('/clin-agenda/eventos/salvar', formEvento);

    return data;
  }

  static async getGrupoEventos(ativo = true, chave = undefined) {
    const { data } = await api.get('/clin-agenda/gruposeventos/pesquisar', { params: { ativo, chave } });

    return data;
  }

  static async getEventos(ativo = true, chave = undefined) {
    const { data } = await api.get('/clin-agenda/eventos/pesquisar', { params: { ativo, chave } });

    return data;
  }

  static async saveConvenioEvento(form) {
    const { data } = await api.post('/clin-agenda/convenioseventos/salvar', form);

    return data;
  }

  static async deleteConvenioEvento(eventoId, convenioId) {
    const { data } = await api.delete('/clin-agenda/convenioseventos/excluir', { params: { evento: eventoId, convenio: convenioId } });

    return data;
  }

  static async getConveniosEventos(evento) {
    const { data } = await api.get('/clin-agenda/convenioseventos/pesquisar', { params: { evento } });

    return data;
  }

  static async atualizarStatusEvento(id) {
    const { data } = await api.put(`/clin-agenda/eventos/atualizar/status/${id}`);

    return data;
  }

  static async atualizarStatusGrupo(id) {
    const { data } = await api.put(`/clin-agenda/gruposeventos/atualizar/status/${id}`);

    return data;
  }
}
