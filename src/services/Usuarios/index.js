import api from '../api';


export default class UsuariosService {
  static async salvar(form) {
    const { data } = await api.post('/usuarios', form);
    return data;
  }
}
