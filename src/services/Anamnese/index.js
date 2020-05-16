import api from '../api';

export default class AnamneseService {
  static async saveAnamneseEvolucao(form) {
    const { data } = await api.post('/clin-atendimento/anamneses/salvar', form);
    return data;
  }

  static async descartarAnamneseEvolucao({ id, grupoAnamneseEvolucao }) {
    const { data } = await api.delete('/clin-atendimento/anamneses/descartar', {
      data: {
        id,
        grupoAnamneseEvolucao,
      },
    });
    return data;
  }

  static async getAllAnamneses({ paciente, empresa }) {
    const { data } = await api.get(`/clin-atendimento/anamneses/listar?paciente=${paciente}&empresa=${empresa}`);
    return data;
  }

  static async getAllCid({ codigo }) {
    const { data } = await api.get(`/clin-atendimento/cid/listar?codigo=${codigo}&ativo=true&versao=10`);
    return data;
  }

  static async getCidById({ paciente, empresa }) {
    const { data } = await api.get(`/clin-atendimento/cid/listar/paciente/${paciente}?empresa=${empresa}`);
    return data;
  }
}
