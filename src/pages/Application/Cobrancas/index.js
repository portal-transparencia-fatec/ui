/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable react/destructuring-assignment */
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import {
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { isEmpty } from 'lodash';
import { DatePicker, TimePicker } from '@material-ui/pickers';
import Chip from '@material-ui/core/Chip';
import {
  mdiCached,
  mdiTimerSand,
  mdiPackageDown,
  mdiUndoVariant,
  mdiCheckOutline,
  mdiCreditCardRefund,
} from '@mdi/js';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ToggleOffIcon from '@material-ui/icons/ToggleOff';
import Dialog from '@material-ui/core/Dialog';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { withFormik } from 'formik';
import UsuarioService from '../../../services/Usuario';
import ModalSelect from '../../../components/ModalSelect';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NotificationActions from '../../../store/ducks/notifier';
import { Container } from '../../../styles/global';
import Material from './styles';
import ConvenioService from '../../../services/Convenio';
import {
  InputmaskDateTimePicker,
  InputFormatDinheiro,
} from '../../../components/InputFormat';
import FinanceiroService from '../../../services/Financeiro';
import LabelClin from '../../../components/LabelClin';
import {
  formataDinheiro,
} from '../../../libs/utils';

const InitialValuesPesquisar = {
  ativo: true,
  dataAgendamentoFinal: null,
  dataAgendamentoInicial: null,
  dataCadastroFinal: null,
  dataCadastroInicial: null,
  dataPagamentoFinal: null,
  dataPagamentoInicial: null,
  descricao: '',
  horaAgendamentoFinal: null,
  horaAgendamentoInicial: null,
  nomePacienteAgendamento: '',
  pago: false,
  usuarioAgendamento: '',
  valorFinal: null,
  valorInicial: null,
  isSubmitting: false,
};

const InitialValuesCobranca = {
  ativo: true,
  dataVencimento: null,
  conta: '',
  isSubmitting: false,
};

class Cobrancas extends Component {
  state = {
    pagamentosSelecionados: [],
    conta: '',
    modalContas: false,
    status: {
      PAGO: 0,
      ABERTO: 1,
      AGUARDANDO_PAGAMENTO: 2,
    },
    openModalConvenios: false,
    convenio: null,
    convenios: [],
    planos: [],
    plano: null,
    contas: [],
    agendaMedicos: [],
    valuesPesquisar: InitialValuesPesquisar,
    valuesCobranca: InitialValuesCobranca,
    cobrancas: [],
    isSubmitting: false,
    loading: false,
    anchorElMenu: null,
    anchorElMenuPagamento: null,
    cobrancaSelecionada: null,
    pagamentoSelecionado: null,
    dialogPagar: false,
    dialogCobranca: false,
    dialogPagamentos: false,
  }

  componentDidMount() {
    this.fetchConvenios();
    this.fetchContas();
    this.fetchMedicos();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { unidade } = this.props;
    const { valuesCobranca, conta, pagamentoSelecionado } = this.state;

    if (unidade !== prevProps.unidade) {
      this.setState({ valuesPesquisar: { ...this.state.valuesPesquisar, usuarioAgendamento: '' }, valuesCobranca: InitialValuesCobranca, cobrancas: [] });
      this.fetchContas();
      this.fetchMedicos();
    }

    if (prevState.valuesCobranca.valorPago !== valuesCobranca.valorPago && valuesCobranca.valorRestante && (valuesCobranca.valorPago >= valuesCobranca.valorRestante)) {
      this.setState({ valuesCobranca: { ...valuesCobranca, pagamentoParcial: true } });
    }
    if (conta && prevState.conta !== conta) {
      await this.setState({ conta: '' });
      this.handleBaixarPagamentoCobranca(pagamentoSelecionado, conta)();
    }
  }

  fetchConvenios = async () => {
    const { notify } = this.props;
    try {
      const convenios = await ConvenioService.getAll(undefined, true);

      this.setState({
        convenios: convenios
          .map(conv => ({
            ...conv,
            filtroPlanos: conv.planos.map(({ nome }) => nome).join(', '),
          })),
        planos: convenios
          .map(({ id, nome, planos }) => planos
            .map(plano => ({
              id: plano.id, nome: plano.nome, idConvenio: id, nomeConvenio: nome,
            })))
          .reduce((previous, next) => [...previous, ...next]),
      });
    } catch (err) {
      notify('Erro ao buscar convênios', { variant: 'error' });
    }
  }

  fetchMedicos = async () => {
    const { notify, unidade } = this.props;

    if (!unidade.id) {
      return;
    }

    try {
      this.setState({ loading: true });
      const agendaMedicos = await UsuarioService.search(true, true, unidade.id);
      await this.setState({ agendaMedicos });
    } catch (err) {
      notify('Erro ao buscar lista de médicos', { variant: 'error' });
    } finally {
      this.setState({ loading: false });
    }
  }

  fetchContas = async () => {
    const { notify, unidade } = this.props;
    try {
      this.setState({ loading: true });
      const contas = await FinanceiroService.searchContas({
        ativo: true,
        empresaUnidade: unidade.id,
      });

      this.setState({ contas });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'error' });
      } else {
        notify('Ocorreu um erro ao buscar contas', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  onSelectPlanoConvenio = async (planoSelect) => {
    let { valuesPesquisar, plano } = this.state;
    const { setFieldValue } = this.props;
    valuesPesquisar = { ...valuesPesquisar };
    const { idConvenio, id } = planoSelect;

    try {
      setFieldValue('planos', []);
      this.setState({ plano: null, convenio: null });
      if (plano !== planoSelect) {
        valuesPesquisar.convenio = idConvenio;
        valuesPesquisar.plano = id;
        this.setState({ valuesPesquisar, plano: planoSelect });
        setFieldValue('planos', [id]);
      }
    } catch (err) {
      console.log(err);
    }
  }

  handleChange = (stateName, name) => ({ target: { value } }) => {
    let values = this.state[stateName];
    values = { ...values };
    values[name] = value;
    this.setState({ [stateName]: values });
  }

  handleChangeModal = (stateName, name) => (value) => {
    let values = this.state[stateName];
    values = { ...values };
    values[name] = value;
    this.setState({ [stateName]: values });
  }

  handleChangeSelect = (stateName, name) => () => {
    let values = this.state[stateName];
    values = { ...values };
    values[name] = !values[name];
    this.setState({ [stateName]: values });
  }

  handleChangeDate = (stateName, name) => (date) => {
    let values = this.state[stateName];
    values = { ...values };
    values[name] = date;
    this.setState({ [stateName]: values });
  }

  handleSubmitPesquisar= async (stateName, name) => {
    const values = this.state[stateName];
    const { convenio, status } = this.state;
    const { notify, unidade } = this.props;
    try {
      this.setState({ loading: true });
      this.handleChangeSelect(stateName, name)();
      const formPesquisarCobrancas = {
        ...values,
        plano: convenio ? undefined : values.plano,
        convenio: convenio || values.convenio,
        dataAgendamentoFinal: values.dataAgendamentoFinal ? moment(values.dataAgendamentoFinal, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        dataAgendamentoInicial: values.dataAgendamentoInicial ? moment(values.dataAgendamentoInicial, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        dataCadastroFinal: values.dataCadastroFinal ? moment(values.dataCadastroFinal, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        dataCadastroInicial: values.dataCadastroInicial ? moment(values.dataCadastroInicial, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        dataPagamentoFinal: values.dataPagamentoFinal ? moment(values.dataPagamentoFinal, 'DD/MM/YYYY').format('YYYY-MM-DD [23]:[59]') : undefined,
        dataPagamentoInicial: values.dataPagamentoInicial ? moment(values.dataPagamentoInicial, 'DD/MM/YYYY').format('YYYY-MM-DD [00]:[00]') : undefined,
        horaAgendamentoFinal: values.horaAgendamentoFinal ? moment(values.horaAgendamentoFinal).format('HH:mm') : undefined,
        horaAgendamentoInicial: values.horaAgendamentoInicial ? moment(values.horaAgendamentoInicial).format('HH:mm') : undefined,
        descricao: values.descricao ? values.descricao : undefined,
        nomePacienteAgendamento: values.nomePacienteAgendamento ? values.nomePacienteAgendamento : undefined,
        usuarioAgendamento: values.usuarioAgendamento ? values.usuarioAgendamento : undefined,
        valorFinal: values.valorFinal ? values.valorFinal : undefined,
        valorInicial: values.valorInicial ? values.valorInicial : undefined,
        empresaUnidade: unidade.id,
      };

      let cobrancas = await FinanceiroService
        .searchCobrancas(formPesquisarCobrancas);

      cobrancas = cobrancas.map(cobranca => ({
        ...cobranca,
        status: status[cobranca.situacao],
      }));

      this.setState({ cobrancas }, () => {
        if (!cobrancas.length) {
          notify('Nenhum resultado encontrado...', { variant: 'warning' });
        }
      });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar realizar a pesquisa.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
      this.handleChangeSelect(stateName, name)();
    }
  }


  handleSubmitPagamento = async (stateName, name) => {
    const { valuesCobranca, cobrancas, status } = this.state;
    const cobranca = { ...this.state[stateName], valorTroco: (valuesCobranca.valorPago > valuesCobranca.valorRestante ? valuesCobranca.valorPago - valuesCobranca.valorRestante : 0) };
    const { notify, unidade } = this.props;
    try {
      cobranca.pago = !cobranca.pago;
      this.setState({ loading: true });
      this.handleChangeSelect(stateName, name)();
      const values = await FinanceiroService
        .pagarCobranca({
          empresaUnidade: unidade.id,
          form: {
            empresaUnidade: unidade.id,
            id: cobranca.id,
            pago: valuesCobranca.pagamentoParcial,
            observacoes: valuesCobranca.observacoes || undefined,
            valor: cobranca.valor,
            descricao: cobranca.descricao,
            dataVencimento: cobranca.dataVencimento,
            valorPago: cobranca.valorPago,
            valorTroco: cobranca.valorTroco,
            conta: cobranca.conta,
          },
        });


      cobrancas[cobranca.index] = { ...values, status: status[values.situacao] };
      this.setState({ cobrancas, valuesCobranca: InitialValuesCobranca });
      this.handleClose();

      notify('Cobrança paga com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar realizar a pesquisa.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSubmitCobrancaPagamento= async (stateName, name) => {
    const cobranca = { ...this.state[stateName] };
    const { notify, unidade } = this.props;
    try {
      this.setState({ loading: true });
      this.handleChangeSelect(stateName, name)();
      await FinanceiroService
        .saveCobranca({
          empresaUnidade: unidade.id,
          form: {
            empresaUnidade: unidade.id,
            pago: false,
            ativo: cobranca.ativo,
            valor: cobranca.valor,
            descricao: cobranca.descricao,
            dataVencimento: moment(cobranca.dataVencimento).format('YYYY-MM-DD'),
          },
        });

      this.setState({ valuesCobranca: InitialValuesCobranca });
      this.handleClose();

      notify('Cobrança gerada com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar gerar a cobrança.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  renderSituacao = (situacao) => {
    if (situacao === 'PAGO') {
      return (
        <>
          <LabelClin
            text="PAGO"
            icon={mdiCheckOutline}
            iconSize="20px"
            bgColor="#adebad"
            textColor="#2eb82e"
          />
        </>
      );
    }

    if (situacao === 'AGUARDANDO_PAGAMENTO') {
      return (
        <>
          <LabelClin
            text="AGUARDANDO PAGAMENTO"
            icon={mdiCheckOutline}
            iconSize="20px"
            bgColor="#7dc2f5"
            textColor="#0077cc"
          />
        </>
      );
    }

    return (
      <>
        <LabelClin
          text="AGUARDANDO"
          icon={mdiTimerSand}
          iconSize="20px"
          bgColor="#ffbb99"
          textColor="#ff5500"
        />
      </>
    );
  }


  renderSituacaoPagamento = (situacao) => {
    if (situacao === 'PAGO') {
      return (
        <>
          <LabelClin
            text="PAGO"
            icon={mdiCheckOutline}
            iconSize="20px"
            bgColor="#adebad"
            textColor="#2eb82e"
          />
        </>
      );
    }
    if (situacao === 'ESTORNADO') {
      return (
        <>
          <LabelClin
            text="ESTORNADO"
            icon={mdiCreditCardRefund}
            iconSize="20px"
            bgColor="#e1e1e1"
            textColor="#757575"
          />
        </>
      );
    }
    return (
      <>
        <LabelClin
          text="AGUARDANDO BAIXA"
          icon={mdiTimerSand}
          iconSize="20px"
          bgColor="#ffbb99"
          textColor="#ff5500"
        />
      </>
    );
  }

  handleClickCobrancaMenu = (cobrancaSelecionada, index) => (event) => {
    this.setState({
      cobrancaSelecionada: {
        ...cobrancaSelecionada, index, pagamentoParcial: false, observacoes: '',
      },
      anchorElMenu: event.currentTarget,
    });
  }

  handleClickPagamentoMenu = (pagamentoSelecionado, index) => (event) => {
    this.setState({
      pagamentoSelecionado: { ...pagamentoSelecionado, index },
      anchorElMenuPagamento: event.currentTarget,
    });
  }

  handleCloseCobrancaMenu = () => {
    this.setState({
      pagamentosSelecionados: [],
      cobrancaSelecionada: null,
      anchorElMenu: null,
    });
  }

  handleClosePagamentoMenu = () => {
    this.setState({
      pagamentoSelecionado: null,
      anchorElMenuPagamento: null,
    });
  }

  handlePagarCobranca = valuesCobranca => async () => {
    this.setState({ valuesCobranca: { ...valuesCobranca, valorPago: '' }, dialogPagar: true });
    this.handleCloseCobrancaMenu();
  }

  handleBaixarPagamentoCobranca = ({ id: idPagamento }, idConta) => async () => {
    const { unidade: { id: empresaUnidade }, notify } = this.props;
    const { cobrancas, status, cobrancaSelecionada: { id, index } } = this.state;
    try {
      this.setState({ loading: true });
      const values = await FinanceiroService
        .baixarPagamentoCobranca({
          id,
          idConta,
          idPagamento,
          empresaUnidade,
        });

      cobrancas[index] = { ...values, status: status[values.situacao] };
      this.setState({ cobrancas });
      this.handleClose();
      notify('Pagamento baixado com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar realizar a baixa.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
      this.handleClosePagamentoMenu();
      this.handleCloseCobrancaMenu();
    }
  }


  handleEstornarPagamentoCobrancas = idPagamentos => async () => {
    const { unidade: { id: empresaUnidade }, notify } = this.props;
    const {
      cobrancas, status, cobrancaSelecionada: { id, index }, pagamentosSelecionados,
    } = this.state;
    try {
      this.setState({ loading: true });
      const values = await FinanceiroService
        .estornarPagamentoCobranca({
          id,
          idPagamentos,
          empresaUnidade,
        });

      idPagamentos.map((pagamento) => {
        if (pagamentosSelecionados.includes(pagamento)) {
          this.sanitizationPagamento(pagamento);
        }
      });

      cobrancas[index] = { ...values, status: status[values.situacao] };
      this.setState({ cobrancas });
      this.handleClose();
      notify('Pagamento estornado com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar realizar o estorno.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
      this.handleClosePagamentoMenu();
      this.handleCloseCobrancaMenu();
    }
  }


  handleRemoveCobranca = ({ id, index }) => async () => {
    const { unidade, notify } = this.props;
    let { cobrancas } = this.state;
    try {
      this.setState({ loading: true });
      await FinanceiroService
        .excluirCobranca({
          id,
          empresaUnidade: unidade.id,
        });

      cobrancas = cobrancas.filter((item, i) => i !== index);
      this.setState({ cobrancas });

      notify('Cobrança excluída com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar remover a cobrança.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
      this.handleCloseCobrancaMenu();
    }
  }


  handleClickMenuItemChangeStatus = cobrancaSelecionada => () => {
    this.handleCloseCobrancaMenu();
  }

  handleToggleContaStatus = (cobranca, index) => async () => {
    const { notify, unidade } = this.props;
    const { cobrancas, status } = this.state;
    try {
      this.setState({ loading: true });
      cobranca.ativo = !cobranca.ativo;
      const values = await FinanceiroService.saveCobranca({
        empresaUnidade: unidade.id,
        form: {
          ...cobranca,
          empresaUnidade: unidade.id,
        },
      });
      cobrancas[index] = { ...values, status: status[values.situacao] };
      this.setState({ cobrancas });
    } catch (err) {
      notify('Não foi possível alterar o status.', { variant: 'error' });
    } finally {
      this.setState({ loading: false });
    }
  }


  handleClose = () => {
    this.setState({ dialogPagar: false, dialogCobranca: false, dialogPagamentos: false });
    // values: InitialValues
  }

  sanitizationPagamento = async (pagamentoId) => {
    let { pagamentosSelecionados } = this.state;

    if (pagamentosSelecionados.includes(pagamentoId)) {
      pagamentosSelecionados = pagamentosSelecionados.filter(lancamento => lancamento !== pagamentoId);
    } else {
      pagamentosSelecionados.push(pagamentoId);
    }
    this.setState({ pagamentosSelecionados });
  }

  render() {
    const { classes, values, setFieldValue } = this.props;
    const {
      conta,
      modalContas,
      openModalConvenios,
      convenio,
      convenios,
      planos,
      cobrancas,
      anchorElMenu,
      cobrancaSelecionada,
      valuesPesquisar,
      valuesCobranca,
      loading,
      dialogPagar,
      contas,
      agendaMedicos,
      dialogCobranca,

      pagamentosSelecionados,
      pagamentoSelecionado,
      anchorElMenuPagamento,
      dialogPagamentos,
    } = this.state;

    return (
      <Container>
        <LoadingIndicator loading={loading} />
        <Grid container spacing={2}>
          <Dialog
            open={dialogPagar}
            onClose={() => this.handleClose()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <Grid container item sm={12} md={12} lg={12} alignItems="center" justify="center">
                  <Grid item sm={12} md={12} lg={12}>
                    <Grid container item sm={12} md={12} lg={12} justify="flex-end">
                      <IconButton>
                        <CloseIcon color="inherit" onClick={() => this.handleClose()} />
                      </IconButton>
                    </Grid>

                    <Grid container spacing={2} direction="row" sm={12} md={12} lg={12}>
                      <Grid item sm={12} md={12} lg={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="VALOR DA COBRANÇA"
                          value={valuesCobranca.valorRestante}
                          inputProps={{
                            readOnly: true,
                          }}
                          InputProps={{
                            inputComponent: InputFormatDinheiro,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={12} lg={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Valor a Pagar*"
                          value={valuesCobranca.valorPago}
                          onChange={this.handleChange('valuesCobranca', 'valorPago')}
                          InputProps={{
                            inputComponent: InputFormatDinheiro,
                          }}
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={9}>
                        <ModalSelect
                          id="select-conta"
                          label="CONTA*"
                          empty="Nenhuma conta encontrada..."
                          value={valuesCobranca.conta}
                          options={contas.map(item => ({
                            id: item.id,
                            label: `${String(item.descricao).toUpperCase()}`,
                            subLabel: `SALDO: ${formataDinheiro(item.saldo)}`,
                          }))}
                          autoCompleteAsync
                          onChange={this.handleChangeModal('valuesCobranca', 'conta')}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                            // style: { color: '#fff' },
                          }}
                        />
                      </Grid>

                      <Grid item container alignItems="right" sm={12} md={2} lg={3}>
                        <FormControlLabel
                          control={(
                            <Switch
                              name="CobrancaPaga"
                              onChange={!(valuesCobranca.valorPago && valuesCobranca.valorRestante && (valuesCobranca.valorPago >= valuesCobranca.valorRestante)) && this.handleChangeSelect('valuesCobranca', 'pagamentoParcial')}
                              color="primary"
                              value={valuesCobranca.pagamentoParcial}
                              checked={valuesCobranca.pagamentoParcial}
                            />
                          )}
                          label="Cobrança Paga?"
                        />
                      </Grid>

                      { valuesCobranca.valorPago && valuesCobranca.valorRestante && (valuesCobranca.valorPago > valuesCobranca.valorRestante) ? (
                        <Grid item sm={12} md={12} lg={12}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="TROCO"
                            value={formataDinheiro(valuesCobranca.valorPago - valuesCobranca.valorRestante)}
                            inputProps={{
                              readOnly: true,
                            }}
                            InputProps={{
                              inputComponent: InputFormatDinheiro,
                            }}
                          />
                        </Grid>
                      ) : null }

                      <Grid item sm={12} md={12} lg={12}>
                        <TextField
                          name="observacoes"
                          id="observacoes"
                          label="Observações"
                          value={valuesCobranca.observacoes}
                          onChange={this.handleChange('valuesCobranca', 'observacoes')}
                          variant="outlined"
                          type="text"
                          multiline
                          fullWidth
                          rows="4"
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          fullWidth
                          onClick={() => this.handleSubmitPagamento('valuesCobranca', 'isSubmitting')}
                          variant="contained"
                          size="medium"
                          color="secondary"
                          type="submit"
                          disabled={valuesCobranca.isSubmitting || !valuesCobranca.conta || !valuesCobranca.valor || !valuesCobranca.valorPago}
                        >
                          {valuesCobranca.isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Pagar'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContentText>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogCobranca}
            onClose={() => this.handleClose()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <Grid container item sm={12} md={12} lg={12} alignItems="center" justify="center">
                  <Grid item sm={12} md={12} lg={12}>
                    <Grid container item sm={12} md={12} lg={12} justify="flex-end">
                      <IconButton>
                        <CloseIcon color="inherit" onClick={() => this.handleClose()} />
                      </IconButton>
                    </Grid>

                    <Grid container spacing={2} direction="row" sm={12} md={12} lg={12}>
                      <Grid item xs={12} sm={12} md={12} lg={9}>
                        <TextField
                          name="descricao"
                          id="descricao"
                          label="Descrição"
                          value={valuesCobranca.descricao}
                          onChange={this.handleChange('valuesCobranca', 'descricao')}
                          variant="outlined"
                          type="text"
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={1} />

                      <Grid item container justify="flex-end" alignItems="center" xs={12} sm={12} md={12} lg={2}>
                        <FormControlLabel
                          control={(
                            <Switch
                              name="ativo"
                              onChange={this.handleChangeSelect('valuesCobranca', 'ativo')}
                              color="primary"
                              value={valuesCobranca.ativo}
                              checked={valuesCobranca.ativo}
                            />
                            )}
                          label="Ativo"
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <DatePicker
                          invalidDateMessage="Data inválida"
                          cancelLabel="Cancelar"
                          clearLabel="Limpar"
                          todayLabel="Hoje"
                          clearable
                          allowKeyboardControl
                          ampm={false}
                          label="Data de Vencimento"
                          placeholder="Data de Vencimento"
                          value={valuesCobranca.dataVencimento}
                          onChange={this.handleChangeDate('valuesCobranca', 'dataVencimento')}
                          mask={InputmaskDateTimePicker}
                          format="DD/MM/YYYY"
                          fullWidth
                          inputVariant="outlined"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton>
                                  <CalendarIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Valor da cobrança"
                          value={valuesCobranca.valor}
                          onChange={this.handleChange('valuesCobranca', 'valor')}
                          InputProps={{
                            inputComponent: InputFormatDinheiro,
                          }}
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          fullWidth
                          onClick={() => this.handleSubmitCobrancaPagamento('valuesCobranca', 'isSubmitting')}
                          variant="contained"
                          size="medium"
                          color="secondary"
                          type="submit"
                          disabled={valuesCobranca.isSubmitting || !valuesCobranca.descricao || !valuesCobranca.dataVencimento || !valuesCobranca.valor}
                        >
                          {valuesCobranca.isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContentText>
            </DialogContent>
          </Dialog>

          <Dialog
            maxWidth="50vw"
            maxHeight="50vh"
            open={dialogPagamentos}
            onClose={() => this.handleClose()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText style={{ minHeight: '50vh', maxHeight: '50vh', minWidth: '50vw' }}>
                <Grid container item sm={12} md={12} lg={12} alignItems="center" justify="center">
                  <Grid item sm={12} md={12} lg={12}>
                    <Grid container item sm={12} md={12} lg={12} justify="flex-end">
                      <IconButton>
                        <CloseIcon color="inherit" onClick={() => this.handleClose()} />
                      </IconButton>
                    </Grid>

                    <Grid item sm={12} md={12} lg={12} style={{ display: 'none' }}>
                      <ModalSelect
                        open={modalContas}
                        onClose={() => this.setState({ modalContas: false })}
                        id="select-conta"
                        label="CONTA*"
                        empty="Nenhuma conta encontrada..."
                        value={conta}
                        options={contas.map(item => ({
                          id: item.id,
                          label: `${String(item.descricao).toUpperCase()}`,
                          subLabel: `SALDO: ${formataDinheiro(item.saldo)}`,
                        }))}
                        autoCompleteAsync
                        onChange={conta => this.setState({ conta })}
                        textfieldProps={{
                          variant: 'outlined',
                          fullWidth: true,
                        }}
                      />
                    </Grid>

                    <Grid container spacing={2} direction="row" sm={12} md={12} lg={12} style={{ marginTop: '2vh' }}>
                      <Table className={classes.table}>
                        <TableHead>
                          <TableRow style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                            <TableCell align="center" className={classes.cellPagamentos} colSpan={9}>{`PAGAMENTO(S) DE ${!isEmpty(cobrancaSelecionada) && String(cobrancaSelecionada.descricao).toUpperCase()}`}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Data do Pagamento</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Valor da Cobrança</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Valor Pago</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Troco</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={2}>Observações</TableCell>
                            <TableCell align="left" className={classes.tableCell} colSpan={2}>Status</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {!isEmpty(cobrancaSelecionada) ? (
                            <>
                              {cobrancaSelecionada.pagamentos.map((pagamento, index) => (
                                <Fragment>
                                  <Tooltip
                                    title={(pagamento.situacao !== 'ESTORNADO' && pagamento.situacao !== 'AGUARDANDO_BAIXA') && 'Clique duas vezes para selecionar o pagamento'}
                                    placement="center"
                                  >
                                    <TableRow
                                      style={pagamento.situacao !== 'ESTORNADO' && pagamento.situacao !== 'AGUARDANDO_BAIXA' ? pagamentosSelecionados.includes(pagamento.id) ? { color: '#0077cc', backgroundColor: '#e1ecf4', cursor: 'pointer' } : { cursor: 'pointer' } : {}}
                                      onDoubleClick={() => (pagamento.situacao !== 'ESTORNADO' && pagamento.situacao !== 'AGUARDANDO_BAIXA') && this.sanitizationPagamento(pagamento.id)}
                                    >
                                      <TableCell align="center" className={classes.tableCell} colSpan={1}>{pagamento.dataPagamento ? moment(pagamento.dataPagamento).format('DD/MM/YYYY [às] HH[h]mm') : '-'}</TableCell>
                                      <TableCell align="center" className={classes.tableCell} colSpan={1}>{formataDinheiro(pagamento.valor - pagamento.troco)}</TableCell>
                                      <TableCell align="center" className={classes.tableCell} colSpan={1}>{formataDinheiro(pagamento.valor)}</TableCell>
                                      <TableCell align="center" className={classes.tableCell} colSpan={1}>{formataDinheiro(pagamento.troco)}</TableCell>
                                      <TableCell align="center" className={classes.tableCell} colSpan={2}>{pagamento.observacoes || '-'}</TableCell>
                                      <TableCell align="center" className={classes.tableCell} colSpan={pagamento.situacao !== 'ESTORNADO' ? 2 : 3}>{this.renderSituacaoPagamento(pagamento.situacao)}</TableCell>
                                      {pagamento.situacao !== 'ESTORNADO' && (
                                        <TableCell align="right" className={classes.tableCell} colSpan={1}>
                                          <IconButton
                                            arial-label="Mais"
                                            aria-owns={anchorElMenuPagamento ? `menu-${pagamento.id}` : undefined}
                                            aria-haspopup="true"
                                            onClick={this.handleClickPagamentoMenu(pagamento, index)}
                                          >
                                            <MoreVertIcon />
                                          </IconButton>
                                        </TableCell>
                                      )}
                                    </TableRow>

                                  </Tooltip>
                                </Fragment>
                              ))}
                            </>
                          ) : null}
                        </TableBody>
                      </Table>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {!isEmpty(pagamentosSelecionados) && (
                <>
                  <LabelClin
                    text="CANCELAR"
                    icon={mdiCached}
                    iconSize="20px"
                    bgColor="#eb2f37"
                    textColor="#fff"
                    onClick={() => this.setState({ pagamentosSelecionados: [] })}
                  />
                  <LabelClin
                    text="ESTORNAR PAGAMENTO(S) SELECIONADO(S)"
                    icon={mdiUndoVariant}
                    iconSize="20px"
                    bgColor="#eb2f37"
                    textColor="#fff"
                    onClick={this.handleEstornarPagamentoCobrancas(pagamentosSelecionados)}
                  />
                </>
              )}
            </DialogActions>
          </Dialog>


          <Grid item sm={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" spacing={2} style={{ overflow: 'hidden' }}>
                <Grid item container direction="row" spacing={1} sm={12} md={12} lg={6} style={{ borderRight: '1px solid rgba(0, 0, 0, 0.17)' }}>
                  <Grid item xs={12} sm={12} md={12} lg={10}>
                    <TextField
                      name="descricao"
                      id="descricao"
                      label="Descrição"
                      value={valuesPesquisar.descricao}
                      onChange={this.handleChange('valuesPesquisar', 'descricao')}
                      variant="outlined"
                      type="text"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>

                  <Grid item container justify="flex-end" alignItems="center" xs={12} sm={12} md={12} lg={2}>
                    <FormControlLabel
                      control={(
                        <Switch
                          name="ativo"
                          onChange={this.handleChangeSelect('valuesPesquisar', 'ativo')}
                          color="primary"
                          value={valuesPesquisar.ativo}
                          checked={valuesPesquisar.ativo}
                        />
                        )}
                      label="Ativo"
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} md={12} lg={5}>
                    <TextField
                      name="valorPago"
                      id="valorPago"
                      label="Valor da cobrança (Início)"
                      value={valuesPesquisar.valorInicial}
                      onChange={this.handleChange('valuesPesquisar', 'valorInicial')}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        inputComponent: InputFormatDinheiro,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} md={12} lg={5}>
                    <TextField
                      name="valorPago"
                      id="valorPago"
                      label="Valor da cobrança (Fim)"
                      value={valuesPesquisar.valorFinal}
                      onChange={this.handleChange('valuesPesquisar', 'valorFinal')}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        inputComponent: InputFormatDinheiro,
                      }}
                    />
                  </Grid>

                  <Grid item container justify="flex-end" alignItems="center" xs={12} sm={12} md={12} lg={2}>
                    <FormControlLabel
                      control={(
                        <Switch
                          name="pago"
                          onChange={this.handleChangeSelect('valuesPesquisar', 'pago')}
                          color="primary"
                          value={valuesPesquisar.pago}
                          checked={valuesPesquisar.pago}
                        />
                        )}
                      label="Pago"
                    />
                  </Grid>
                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <DatePicker
                      invalidDateMessage="Data inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Data de cadastro (Início)"
                      placeholder="Data de cadastro (Início)"
                      value={valuesPesquisar.dataCadastroInicial}
                      onChange={this.handleChangeDate('valuesPesquisar', 'dataCadastroInicial')}
                      mask={InputmaskDateTimePicker}
                      format="DD/MM/YYYY"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <DatePicker
                      minDate={valuesPesquisar.dataCadastroInicial || undefined}
                      invalidDateMessage="Data inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Data de cadastro (Fim)"
                      placeholder="Data de cadastro (Fim)"
                      value={valuesPesquisar.dataCadastroFinal}
                      onChange={this.handleChangeDate('valuesPesquisar', 'dataCadastroFinal')}
                      mask={InputmaskDateTimePicker}
                      format="DD/MM/YYYY"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <DatePicker
                      invalidDateMessage="Data inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Data de pagamento (Início)"
                      placeholder="Data de pagamento (Início)"
                      value={valuesPesquisar.dataPagamentoInicial}
                      onChange={this.handleChangeDate('valuesPesquisar', 'dataPagamentoInicial')}
                      mask={InputmaskDateTimePicker}
                      format="DD/MM/YYYY"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <DatePicker
                      minDate={valuesPesquisar.dataPagamentoInicial || undefined}
                      invalidDateMessage="Data inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Data de pagamento (Fim)"
                      placeholder="Data de pagamento (Fim)"
                      value={valuesPesquisar.dataPagamentoFinal}
                      onChange={this.handleChangeDate('valuesPesquisar', 'dataPagamentoFinal')}
                      mask={InputmaskDateTimePicker}
                      format="DD/MM/YYYY"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      onClick={async () => {
                        await setFieldValue('planos', []);
                        this.setState({ valuesPesquisar: InitialValuesPesquisar, convenio: null });
                      }}
                      variant="contained"
                      size="medium"
                      color="secondary"
                      type="submit"
                      disabled={valuesPesquisar === InitialValuesPesquisar}
                    >
                     Limpar
                    </Button>
                  </Grid>
                </Grid>

                <Grid item container direction="row" spacing={1} sm={12} md={12} lg={6} style={{ paddingLeft: 15 }}>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <TextField
                      name="descricao"
                      id="descricao"
                      label="Nome do paciente"
                      value={valuesPesquisar.nomePacienteAgendamento}
                      onChange={this.handleChange('valuesPesquisar', 'nomePacienteAgendamento')}
                      variant="outlined"
                      type="text"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>

                  <Grid item sm={12} md={12} lg={6}>
                    {openModalConvenios ? (
                      <ModalSelect
                        open={openModalConvenios}
                        onOpen={() => this.setState({ openModalConvenios: true })}
                        onClose={() => this.setState({ openModalConvenios: false })}
                        label="Plano / Convênio"
                        multiple
                        empty="Carregando..."
                        placeholderFilter="Filtrar plano do convênio"
                        value={values.planos}
                        options={planos
                          .map(plano => ({ id: plano.id, label: plano.nome, subLabel: plano.nomeConvenio }))
                        }
                        onChange={value => setFieldValue('planos', value)}
                        textfieldProps={{
                          variant: 'outlined',
                          fullWidth: true,
                        }}
                      >
                        {(options, value, filter, onSelect) => (
                          convenios.filter(filter).map(conv => (
                            <ExpansionPanel key={conv.id}>
                              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography className={classes.heading}>{conv.nome}</Typography>
                              </ExpansionPanelSummary>
                              <ExpansionPanelDetails>
                                <List dense style={{ width: '100%' }}>

                                  {conv.planos.map((plano, index) => (
                                    <Fragment>
                                      {!index && (
                                        <ListItem
                                          onClick={() => {
                                            setFieldValue('planos', []);
                                            this.setState({ convenio: (convenio === conv.id ? null : conv.id) });
                                          }}
                                        >
                                          <Checkbox
                                            checked={convenio === conv.id}
                                            tabIndex={-1}
                                            color="primary"
                                            disableRipple
                                            style={{ float: 'left', width: '5%' }}
                                          />
                                          <ListItemText primary="SELECIONAR TODOS" />
                                        </ListItem>
                                      )}
                                      <ListItem
                                        key={plano.id}
                                        role={undefined}
                                        dense
                                        button
                                        style={{ width: '100%' }}
                                        onClick={() => this.onSelectPlanoConvenio(plano)}
                                      >
                                        <Checkbox
                                          checked={(convenio === conv.id ? true : value.some(val => (val === plano.id) || (val === val.label)))}
                                          tabIndex={-1}
                                          color="primary"
                                          disableRipple
                                        />
                                        <ListItemText primary={plano.nome} />
                                      </ListItem>
                                    </Fragment>
                                  ))}
                                </List>
                              </ExpansionPanelDetails>
                            </ExpansionPanel>
                          ))
                        )}
                      </ModalSelect>
                    ) : (
                      <TextField
                        onClick={() => {
                          this.setState({ openModalConvenios: true });
                        }}
                        label={
                          !convenio
                            ? (!isEmpty(values.planos)
                              ? `${convenios.find(conv => conv.id === valuesPesquisar.convenio).nome}`

                              : 'Plano / Convênio'
                            )
                            : `${convenios.find(conv => conv.id === convenio).nome}`
                        }
                        value={
                          !convenio
                            ? (!isEmpty(values.planos)
                              ? `${values.planos.map(plano => convenios.find(conv => conv.id === valuesPesquisar.convenio).planos.filter(({ id }) => id === plano).map(({ nome }) => nome).join(' - '))}`
                              : ''
                            )
                            : `${convenios.find(conv => conv.id === convenio).planos.map(({ nome }) => nome).join(' - ')}`
                        }
                        variant="outlined"
                        type="text"
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    )}

                  </Grid>

                  <Grid item sm={12} md={12} lg={6}>
                    <ModalSelect
                      id="select-usuarioAgendamento"
                      label="Médico"
                      empty="Lista de médicos vazia..."
                      value={valuesPesquisar.usuarioAgendamento}
                      options={agendaMedicos.map(medico => ({
                        id: medico.id,
                        label: medico.nome,
                      }))}
                      autoCompleteAsync
                      onChange={this.handleChangeModal('valuesPesquisar', 'usuarioAgendamento')}
                      textfieldProps={{
                        variant: 'outlined',
                        fullWidth: true,
                        // style: { color: '#fff' },
                      }}
                    />
                  </Grid>

                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <DatePicker
                      invalidDateMessage="Data inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Data do agendamento (Início)"
                      placeholder="Data do agendamento (Início)"
                      value={valuesPesquisar.dataAgendamentoInicial}
                      onChange={this.handleChangeDate('valuesPesquisar', 'dataAgendamentoInicial')}
                      mask={InputmaskDateTimePicker}
                      format="DD/MM/YYYY"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <DatePicker
                      minDate={valuesPesquisar.dataAgendamentoInicial || undefined}
                      invalidDateMessage="Data inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Data do agendamento (Fim)"
                      placeholder="Data do agendamento (Fim)"
                      value={valuesPesquisar.dataAgendamentoFinal}
                      onChange={this.handleChangeDate('valuesPesquisar', 'dataAgendamentoFinal')}
                      mask={InputmaskDateTimePicker}
                      format="DD/MM/YYYY"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>


                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <TimePicker
                      invalidDateMessage="Hora inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Horário do agendamento (Início)"
                      placeholder="Horário do agendamento (Início)"
                      value={valuesPesquisar.horaAgendamentoInicial}
                      onChange={this.handleChangeDate('valuesPesquisar', 'horaAgendamentoInicial')}
                      mask={InputmaskDateTimePicker}
                      format="HH:mm"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item container justify="center" alignItems="center" xs={12} sm={12} md={12} lg={6}>
                    <TimePicker
                      invalidDateMessage="Hora inválida"
                      cancelLabel="Cancelar"
                      clearLabel="Limpar"
                      todayLabel="Hoje"
                      clearable
                      allowKeyboardControl
                      ampm={false}
                      label="Horário do agendamento (Fim)"
                      placeholder="Horário do agendamento (Fim)"
                      value={valuesPesquisar.horaAgendamentoFinal}
                      onChange={this.handleChangeDate('valuesPesquisar', 'horaAgendamentoFinal')}
                      mask={InputmaskDateTimePicker}
                      format="HH:mm"
                      fullWidth
                      inputVariant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <CalendarIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      onClick={() => this.handleSubmitPesquisar('valuesPesquisar', 'isSubmitting')}
                      variant="contained"
                      size="medium"
                      color="secondary"
                      type="submit"
                      disabled={valuesPesquisar.isSubmitting}
                    >
                      {valuesPesquisar.isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Pesquisar'}
                    </Button>
                  </Grid>


                </Grid>

                <Grid item container direction="row" spacing={1} sm={12} md={12} lg={12}>

                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      onClick={() => this.setState({ dialogCobranca: true, valuesCobranca: InitialValuesCobranca })}
                      variant="contained"
                      size="medium"
                      color="secondary"
                      type="submit"
                    >
                      Nova cobrança
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>

          </Grid>

          <Grid item container alignItems="flex-start" sm={12} md={12} lg={12}>
            {!!cobrancas.length && (
              <Paper className={classes.paper}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" className={classes.cellDescricao}>Descrição</TableCell>
                      <TableCell align="center" className={classes.cellPagamento}>Data do Pagamento</TableCell>
                      <TableCell align="center" className={classes.cellVencimento}>Vencimento</TableCell>
                      <TableCell align="center" className={classes.cellValor}>Valor Total</TableCell>
                      <TableCell align="center" className={classes.cellValor}>Valor Pago</TableCell>
                      <TableCell align="center" className={classes.cellValor}>Valor Restante</TableCell>
                      <TableCell align="center" className={classes.cellStatus}>Status</TableCell>
                      <TableCell align="center" className={classes.cellToggle} />
                      <TableCell align="right" className={classes.cellMenu} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cobrancas.map((cobranca, index) => (
                      <Fragment>
                        <TableRow>
                          <TableCell align="left" className={classes.tableCell}>{cobranca.descricao}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{cobranca.dataPagamento ? moment(cobranca.dataPagamento).format('DD/MM/YYYY [às] HH[h]mm') : '-'}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{moment(cobranca.dataVencimento).format('DD/MM/YYYY')}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{formataDinheiro(cobranca.valor)}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{formataDinheiro(cobranca.valorPago)}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{formataDinheiro(cobranca.valorRestante)}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{this.renderSituacao(cobranca.situacao)}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>
                            <Chip
                              style={{ width: '100%' }}
                              deleteIcon={<ToggleOffIcon />}
                              label={cobranca.ativo ? 'ATIVA' : 'DESABILITADA'}
                              color={cobranca.ativo ? 'primary' : 'secondary'}
                              onClick={this.handleToggleContaStatus(cobranca, index)}
                              clickable
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right" className={classes.tableCell}>
                            <IconButton
                              arial-label="Mais"
                              aria-owns={anchorElMenu ? `menu-${cobranca.id}` : undefined}
                              aria-haspopup="true"
                              onClick={this.handleClickCobrancaMenu(cobranca, index)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Grid>
        </Grid>

        {!!pagamentoSelecionado && (
          <Menu
            id={`menu-${pagamentoSelecionado.id}`}
            anchorEl={anchorElMenuPagamento}
            open={!!anchorElMenuPagamento}
            onClose={this.handleClosePagamentoMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 180,
                justifyContent: 'center',
              },
            }}
          >
            {((cobrancaSelecionada.status === 0 || cobrancaSelecionada.status === 1) && pagamentoSelecionado.situacao !== 'AGUARDANDO_BAIXA') && (
              <MenuItem
                button
                onClick={this.handleEstornarPagamentoCobrancas([pagamentoSelecionado.id])}
              >
                <LabelClin
                  text="ESTORNAR"
                  icon={mdiUndoVariant}
                  iconSize="20px"
                  bgColor="#eb2f37"
                  textColor="#fff"
                />
              </MenuItem>
            )}

            {cobrancaSelecionada.status === 2 && (
              <MenuItem
                button
                onClick={() => this.setState({ modalContas: true })}
              >
                <LabelClin
                  text="BAIXAR"
                  icon={mdiPackageDown}
                  iconSize="20px"
                  bgColor="#f2d600"
                  textColor="#fcee81"
                />
              </MenuItem>
            )}
          </Menu>
        )}


        {!!cobrancaSelecionada && cobrancaSelecionada.ativo && (
          <Menu
            id={`menu-${cobrancaSelecionada.id}`}
            anchorEl={anchorElMenu}
            open={!!anchorElMenu}
            onClose={this.handleCloseCobrancaMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 180,
                justifyContent: 'center',
              },
            }}
          >

            {cobrancaSelecionada.status === 1 && (
            <MenuItem
              button
              onClick={this.handlePagarCobranca(cobrancaSelecionada)}
            >
              <LabelClin
                text="PAGAR"
                iconSize="20px"
                bgColor="#adebad"
                textColor="#2eb82e"
              />
            </MenuItem>
            )}
            {!isEmpty(cobrancaSelecionada.pagamentos) && (
            <MenuItem
              button
              onClick={() => this.setState({ dialogPagamentos: true })}
            >
              <LabelClin
                text="PAGAMENTOS"
                iconSize="20px"
                bgColor="#ff9f1a"
                textColor="#fff"
              />
            </MenuItem>
            )}

            {cobrancaSelecionada.status === 1 && (
              <MenuItem
                button
                onClick={this.handleRemoveCobranca(cobrancaSelecionada)}
              >
                <LabelClin
                  text="EXCLUIR"
                  iconSize="20px"
                  bgColor="#eb2f37"
                  textColor="#fff"
                />
              </MenuItem>
            )}
          </Menu>
        )}
      </Container>
    );
  }
}
const mapStateToProps = (state) => {
  const unidadeAtual = state.user.unidades.find(unid => unid.current);
  return {
    unidade: unidadeAtual.unidade || {},
    isChatOpen: state.chat.isVisible,
  };
};

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
  withStyles(Material),
  withFormik({
    displayName: 'Cobrancas',
    validateOnBlur: false,
    validateOnChange: false,
    mapPropsToValues: () => ({
      planos: [],
    }),
  }),
)(Cobrancas);
