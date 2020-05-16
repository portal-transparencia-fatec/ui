import api from '../api';

export default class FinanceiroService {
  // Faturas

  static async searchFaturas({
    empresaUnidade, ...rest
  }) {
    const { data } = await api.get('/clin-financeiro/faturas/pesquisar', {
      params: {
        empresaUnidade, ...rest,
      },
    });

    return data;
  }

  static async pagarFatura({
    empresaUnidade, form,
  }) {
    const { data } = await api.put(`/clin-financeiro/faturas/pagar?empresaUnidade=${empresaUnidade}`, form);
    return data;
  }

  static async estornarPagamentoFatura(form) {
    const { data } = await api.put('/clin-financeiro/faturas/estornar', form);
    return data;
  }

  static async baixarPagamentoFatura(form) {
    const { data } = await api.put('/clin-financeiro/faturas/baixar', form);
    return data;
  }

  static async saveFatura({
    empresaUnidade, form,
  }) {
    const { data } = await api.post(`/clin-financeiro/faturas/salvar?empresaUnidade=${empresaUnidade}`, form);
    return data;
  }

  static async excluirFatura({
    empresaUnidade, id,
  }) {
    const { data } = await api.delete(`/clin-financeiro/faturas/excluir/${id}?empresaUnidade=${empresaUnidade}`);
    return data;
  }

  // Conta Lançamento

  static async saveTransferirLancamento(form) {
    const { data } = await api.post('/clin-financeiro/contalancamentos/transferir', form);
    return data;
  }

  // Condições de pagamento

  static async searchCondicaoPagamento({
    formaPagamento, empresaUnidade, ativo, ...rest
  }) {
    const { data } = await api.get('/clin-financeiro/condicoespagamentos/pesquisar', {
      params: {
        formaPagamento, empresaUnidade, ativo, ...rest,
      },
    });

    return data;
  }

  static async searchByIdCondicaoPagamento(id) {
    const { data } = await api.get(`/clin-financeiro/condicoespagamentos/pesquisar/${id}`);
    return data;
  }

  static async saveCondicaoPagamento(form) {
    const { data } = await api.post('/clin-financeiro/condicoespagamentos/salvar', form);
    return data;
  }

  static async gerarParcelas({
    qtdParcelas, condicaoPagamento, valor, empresaUnidade, ...rest
  }) {
    const { data } = await api.get('/clin-financeiro/condicoespagamentos/gerar/parcelas', {
      params: {
        qtdParcelas, condicaoPagamento, valor, empresaUnidade, ...rest,
      },
    });

    return data;
  }
  // Cobranças

  static async searchCobrancas({
    empresaUnidade, ...rest
  }) {
    const { data } = await api.get('/clin-financeiro/cobrancas/pesquisar', {
      params: {
        empresaUnidade, ...rest,
      },
    });

    return data;
  }

  static async pagarCobranca({
    empresaUnidade, form,
  }) {
    const { data } = await api.put(`/clin-financeiro/cobrancas/pagar?empresaUnidade=${empresaUnidade}`, form);
    return data;
  }

  static async estornarPagamentoCobranca(form) {
    const { data } = await api.put('/clin-financeiro/cobrancas/estornar', form);
    return data;
  }

  static async baixarPagamentoCobranca(form) {
    const { data } = await api.put('/clin-financeiro/cobrancas/baixar', form);
    return data;
  }

  static async saveCobranca({
    empresaUnidade, form,
  }) {
    const { data } = await api.post(`/clin-financeiro/cobrancas/salvar?empresaUnidade=${empresaUnidade}`, form);
    return data;
  }

  static async excluirCobranca({
    empresaUnidade, id,
  }) {
    const { data } = await api.delete(`/clin-financeiro/cobrancas/excluir/${id}?empresaUnidade=${empresaUnidade}`);
    return data;
  }

  // Caixa Recepcao Controller
  static async buscaCaixaLancamento({ date, empresaUnidade, usuarioLogado }) {
    const { data } = await api.get(`/clin-financeiro/caixasrecepcao/pesquisar?data=${date}&empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}`);
    return data;
  }

  static async finalizarCaixa({ date, empresaUnidade, usuarioLogado }) {
    const { data } = await api.get(`/clin-financeiro/caixasrecepcao/finalizar?data=${date}&empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}`);
    return data;
  }

  static async getCaixasRecepcao({
    dataFinal, dataInicial, usuarioLogado, empresaUnidade,
  }) {
    const { data } = await api.get(`/clin-financeiro/caixasrecepcao/datas?dataFinal=${dataFinal}&dataInicial=${dataInicial}&empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}`);
    return data;
  }

  static async atualizarCaixaRecepcao({
    form,
  }) {
    const { data } = await api.post('/clin-financeiro/caixasrecepcao/atualizar', form);
    return data;
  }


  // Lancamentos


  static async enviarRecibo({
    file, destinatarios, empresa,
  }) {
    const { data } = await api.post('/clin-financeiro/caixarecepcaolancamentos/enviar/recibo', file, { params: { destinatarios, empresa } });
    return data;
  }


  static async gerarGuia(agendamentos) {
    const { data } = await api.post('/clin-financeiro/caixarecepcaolancamentos/gerar/conta', agendamentos);
    return data;
  }

  static async lancamentoManual({ empresaUnidade, usuarioLogado, form }) {
    const { data } = await api.post(`/clin-financeiro/caixarecepcaolancamentos/novo?empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}`, form);
    return data;
  }

  static async gerarFechamento({
    date, empresaUnidade, usuarioLogado, fechamento,
  }) {
    const { data } = await api.post(`/clin-financeiro/caixarecepcaolancamentos/fechar/conta?data=${date}&empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}`, fechamento);
    return data;
  }

  static async excluirLancamento({ id, lancamento }) {
    const { data } = await api.delete(`/clin-financeiro/caixarecepcaolancamentos/excluir/${lancamento}`, {
      data: id,
    });
    return data;
  }

  static async saveTranferencia({
    date, empresaUnidade, usuarioLogado, usuarioRecebedor, valor,
  }) {
    const { data } = await api.get(`/clin-financeiro/caixarecepcaolancamentos/transferir?data=${date}&empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}&usuarioRecebedor=${usuarioRecebedor}&valor=${valor}`);
    return data;
  }


  // Conta

  static async saveConta({
    empresaUnidade, usuarioLogado, form,
  }) {
    const { data } = await api.post(`/clin-financeiro/contas/salvar?empresaUnidade=${empresaUnidade}&usuarioLogado=${usuarioLogado}`, form);
    return data;
  }

  static async searchContas({ ativo, empresaUnidade }) {
    const { data } = await api.get(`/clin-financeiro/contas/pesquisar?ativo=${ativo}&empresaUnidade=${empresaUnidade}`);

    return data;
  }
}
