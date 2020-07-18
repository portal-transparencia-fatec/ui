import api from '../api';


export default class ServidoresService {
  static async getAll(params) {
    const { data } = await api.get('/servidores', {
      params
    });
    return data;
  }

  static async getAllCargos() {
    const { data } = await api.get('/servidores/cargos/');
    return data;
  }  

  static async getAllRegimes() {
    const { data } = await api.get('/servidores/regimes/');
    return data;
  }  

  static async getAllSalariosByRgf(rgf) {
    const { data } = await api.get(`/servidores/grafico/salarios/${rgf}`);
    return data;
  }  

  static async getAllByNome(nome) {
    const { data } = await api.get(`/servidores/nome/${nome}`);
    return data;
  }

  static async getAllSalariosByRgfs(rgfs) {
    const { data } = await api.post(`/servidores/grafico/salarios/`, rgfs);
    return data;
  } 

  
}
