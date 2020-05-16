import { apiConsultaCEP } from '../api';

export default class ConsultaCEP {
  static async consulta(cep) {
    const { data } = await apiConsultaCEP.get(`/endereco/consulta/${cep}`);

    if (data && data.cep) {
      return data;
    }

    return null;
  }
}
