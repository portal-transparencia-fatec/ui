import api from '../api';


export default class ServidoresService {
  static async getAll() {
    const { data } = await api.get('/servidores');
    return data;
  }
}
