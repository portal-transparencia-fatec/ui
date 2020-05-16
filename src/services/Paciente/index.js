import api from '../api';

export default class PacienteService {
  static async save(pacienteForm) {
    const { data } = await api.post('/clin-core/pacientes/salvar', pacienteForm);

    return data;
  }

  static async getById(pacienteId) {
    const { data } = await api.get(`/clin-core/pacientes/pesquisar/${pacienteId}`);

    return data;
  }

  static async getAll(chave = undefined) {
    const { data } = await api.get('/clin-core/pacientes/pesquisar', { params: { chave } });

    return data;
  }

  static async getAllByDay({ date, empresaUnidade }) {
    const { data } = await api.get(`/clin-core/pacientes/dia?data=${date}&empresaUnidade=${empresaUnidade}`);
    return data;
  }

  static async getByConvenio(convenio, nomePaciente = undefined, ativo = true) {
    const { data } = await api.get('/clin-core/pacientes/pesquisar/convenio', { params: { convenio, nome: nomePaciente, ativo } });

    return data;
  }
}
