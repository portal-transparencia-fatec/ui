import api from '../api';

export default class DashboardService {
  static async getTabelaFaltas({ date, empresaUnidade }) {
    const { data } = await api.get(`/clin-core/dashboard/faltas/tabela?data=${date}&empresaUnidade=${empresaUnidade}`);
    return { data };
  }

  static async getChartFaltas({ date, empresaUnidade }) {
    const { data } = await api.get(`/clin-core/dashboard/faltas?data=${date}&empresaUnidade=${empresaUnidade}`);
    return { data };
  }

  static async getTabelaNaoConfirmados({ date, empresaUnidade }) {
    const { data } = await api.get(`/clin-core/dashboard/naoconfirmados/tabela?data=${date}&empresaUnidade=${empresaUnidade}`);
    return { data };
  }

  static async getChartNaoConfirmados({ date, empresaUnidade }) {
    const { data } = await api.get(`/clin-core/dashboard/naoconfirmados?data=${date}&empresaUnidade=${empresaUnidade}`);
    return { data };
  }


  // static async tabelaFaltas({ date, empresaUnidade }) {
  //   const { data } = await api.get(`/clin-core/dashboard/faltas/tabela?data=${date}&empresaUnidade=${empresaUnidade}`);
  //   return { data };
  // }
}
