import api from '../api';

export default class UsuarioService {
  static async login(username, password) {
    const { data: { usuario, accessToken } } = await api.post('/auth/login', { username, password });

    return { usuario, accessToken };
  }

  static async whoami() {
    const { data } = await api.get('/whoami');

    return data;
  }

  static async getAllRecepcao({ date, empresaUnidade, usuarioLogado }) {
    const { data } = await api.get(`/clin-core/usuarios/pesquisar/recepcao?data=${date}&empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}`);
    return data;
  }

  static async getAll() {
    const { data } = await api.get('/clin-core/usuarios/pesquisar');

    return data;
  }

  static async getById(userId) {
    const { data } = await api.get(`/clin-core/usuarios/pesquisar/${userId}`);

    return data;
  }

  static async search(
    ativo = true, medico = undefined, empresaUnidade = undefined, chave = undefined,
  ) {
    const { data } = await api.get('/clin-core/usuarios/pesquisar/medicos', {
      params: {
        ativo, medico, empresaUnidade, chave,
      },
    });

    return data;
  }

  static async save(usuario) {
    const { data } = await api.post('/clin-core/usuarios/salvar', usuario);

    return data;
  }

  static async atualizarStatus(id) {
    const { data } = await api.put(`/clin-core/usuarios/atualizar/status/${id}`);

    return data;
  }

  static async forgotPassword(email) {
    const { data } = await api.post('/clin-notify/forgotpassword/', email, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return data;
  }

  static async validaToken(token) {
    const { data } = await api.get(`/clin-notify/forgotpassword/verify/${token}`);

    return data;
  }

  static async resetPassword(form) {
    const { data } = await api.post('/clin-notify/forgotpassword/reset/', form, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return data;
  }
}
