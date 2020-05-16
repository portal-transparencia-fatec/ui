import axios from 'axios';
import { apiNexoData as api, authNexoData as auth, nexoDataURL as baseURL } from '../api';

export default class NexoDataService {
  // auth
  static async getValidacao() {
    const { data } = await api.get('/auth/validacao');
    return data;
  }

  // prescricao


  static async iniciarPrescricao(form) {
    const { data } = await api.post('/prescricao/iniciar', form);
    return data;
  }

  static async getPDFPrescricao(id) {
    const { data } = await api.post(`/prescricao/${id}/pdf2`);
    return data;
  }

  static async fecharPrescricao(form) {
    const { data } = await axios({
      method: 'POST',
      url: `${baseURL}/prescricao/fechar`,
      auth,
      data: form,
    });
    return data;
  }


  static async consultarPrescricoesPaciente({ id, idMedico, numeroPrescricoes }) {
    const { data } = await api.get('/paciente/prescricoes', {
      params: {
        id, idMedico, numeroPrescricoes,
      },
    });
    return data;
  }

  static async saveMedico(form) {
    const { data } = await api.post('/medico/insere', form);
    return data;
  }

  static async savePaciente(form) {
    const { data } = await api.post('/paciente/inserir', form);
    return data;
  }

  static async removerPrescricaoPaciente({ id }) {
    const { data } = await axios({
      method: 'DELETE',
      url: `${baseURL}/prescricao`,
      params: { id },
      auth,
    });
    return data;
  }

  static async searchPaciente({ buscaPor, idMedico, limit = 1 }) {
    const { data } = await axios({
      method: 'GET',
      url: `${baseURL}/paciente/pesquisa`,
      params: { buscaPor, idMedico, limit },
      auth,
    });
    return data;
  }
}
