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
import { isEmpty } from 'lodash';
import { DatePicker } from '@material-ui/pickers';
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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import CloseIcon from '@material-ui/icons/Close';
import { withFormik } from 'formik';
import ModalSelect from '../../../components/ModalSelect';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NotificationActions from '../../../store/ducks/notifier';
import { Container } from '../../../styles/global';
import Material from './styles';
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
  dataCadastroFinal: null,
  dataCadastroInicial: null,
  dataPagamentoFinal: null,
  dataPagamentoInicial: null,
  descricao: '',
  pago: false,
  valorFinal: null,
  valorInicial: null,
  isSubmitting: false,
};

const InitialValuesFatura = {
  ativo: true,
  dataVencimento: null,
  conta: '',
  isSubmitting: false,
};

class Faturas extends Component {
  state = {
    loading: false,
    pagamentosSelecionados: [],
    conta: '',
    modalContas: false,
    status: {
      PAGO: 0,
      ABERTO: 1,
      AGUARDANDO_PAGAMENTO: 2,
    },
    contas: [],
    valuesPesquisar: InitialValuesPesquisar,
    valuesFatura: InitialValuesFatura,
    faturas: [],
    isSubmitting: false,
    anchorElMenu: null,
    anchorElMenuPagamento: null,
    faturaSelecionada: null,
    pagamentoSelecionado: null,
    dialogPagar: false,
    dialogFatura: false,
    dialogPagamentos: false,
  }

  componentDidMount() {
    this.fetchContas();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { unidade } = this.props;
    const { valuesFatura, conta, pagamentoSelecionado } = this.state;

    if (unidade !== prevProps.unidade) {
      this.setState({ valuesPesquisar: { ...this.state.valuesPesquisar, usuarioAgendamento: '' }, valuesFatura: InitialValuesFatura, faturas: [] });
      this.fetchContas();
    }

    if (prevState.valuesFatura.valorPago !== valuesFatura.valorPago && valuesFatura.valorRestante && (valuesFatura.valorPago >= valuesFatura.valorRestante)) {
      this.setState({ valuesFatura: { ...valuesFatura, pagamentoParcial: true } });
    }
    if (conta && prevState.conta !== conta) {
      await this.setState({ conta: '' });
      this.handleBaixarPagamentoFatura(pagamentoSelecionado, conta)();
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
    const { status } = this.state;
    const { notify, unidade } = this.props;
    try {
      this.setState({ loading: true });
      this.handleChangeSelect(stateName, name)();
      const formPesquisarFaturas = {
        ...values,
        dataCadastroFinal: values.dataCadastroFinal ? moment(values.dataCadastroFinal, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        dataCadastroInicial: values.dataCadastroInicial ? moment(values.dataCadastroInicial, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        dataPagamentoFinal: values.dataPagamentoFinal ? moment(values.dataPagamentoFinal, 'DD/MM/YYYY').format('YYYY-MM-DD [23]:[59]') : undefined,
        dataPagamentoInicial: values.dataPagamentoInicial ? moment(values.dataPagamentoInicial, 'DD/MM/YYYY').format('YYYY-MM-DD [00]:[00]') : undefined,
        descricao: values.descricao ? values.descricao : undefined,
        valorFinal: values.valorFinal ? values.valorFinal : undefined,
        valorInicial: values.valorInicial ? values.valorInicial : undefined,
        empresaUnidade: unidade.id,
      };

      let faturas = await FinanceiroService
        .searchFaturas(formPesquisarFaturas);

      faturas = faturas.map(fatura => ({
        ...fatura,
        status: status[fatura.situacao],
      }));

      console.log(faturas);

      this.setState({ faturas }, () => {
        if (isEmpty(faturas)) {
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
    const { valuesFatura, faturas, status } = this.state;
    const fatura = { ...this.state[stateName], valorTroco: (valuesFatura.valorPago > valuesFatura.valorRestante ? valuesFatura.valorPago - valuesFatura.valorRestante : 0) };
    const { notify, unidade } = this.props;
    try {
      fatura.pago = !fatura.pago;
      this.setState({ loading: true });
      this.handleChangeSelect(stateName, name)();
      const values = await FinanceiroService
        .pagarFatura({
          empresaUnidade: unidade.id,
          form: {
            empresaUnidade: unidade.id,
            id: fatura.id,
            pago: valuesFatura.pagamentoParcial,
            observacoes: valuesFatura.observacoes || undefined,
            valor: fatura.valor,
            descricao: fatura.descricao,
            dataVencimento: fatura.dataVencimento,
            valorPago: fatura.valorPago,
            valorTroco: fatura.valorTroco,
            conta: fatura.conta,
          },
        });

      faturas[fatura.index] = { ...values, status: status[values.situacao] };
      this.setState({ faturas, valuesFatura: InitialValuesFatura });
      this.handleClose();

      notify('Fatura paga com sucesso.', { variant: 'success' });
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

  handleSubmitFaturaPagamento= async (stateName, name) => {
    const fatura = { ...this.state[stateName] };
    const { notify, unidade } = this.props;
    try {
      this.setState({ loading: true });
      this.handleChangeSelect(stateName, name)();
      await FinanceiroService
        .saveFatura({
          empresaUnidade: unidade.id,
          form: {
            empresaUnidade: unidade.id,
            pago: false,
            ativo: fatura.ativo,
            valor: fatura.valor,
            descricao: fatura.descricao,
            dataVencimento: moment(fatura.dataVencimento).format('YYYY-MM-DD'),
          },
        });

      this.setState({ valuesFatura: InitialValuesFatura });
      this.handleClose();

      notify('Fatura gerada com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar gerar a fatura.', { variant: 'error' });
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

  handleClickFaturaMenu = (faturaSelecionada, index) => (event) => {
    this.setState({
      faturaSelecionada: { ...faturaSelecionada, index, pagamentoParcial: false, observacoes: '' },
      anchorElMenu: event.currentTarget,
    });
  }

  handleClickPagamentoMenu = (pagamentoSelecionado, index) => (event) => {
    this.setState({
      pagamentoSelecionado: { ...pagamentoSelecionado, index },
      anchorElMenuPagamento: event.currentTarget,
    });
  }

  handleCloseFaturaMenu = () => {
    this.setState({
      pagamentosSelecionados: [],
      faturaSelecionada: null,
      anchorElMenu: null,
    });
  }

  handleClosePagamentoMenu = () => {
    this.setState({
      pagamentoSelecionado: null,
      anchorElMenuPagamento: null,
    });
  }

  handlePagarFatura = valuesFatura => async () => {
    this.setState({ valuesFatura: { ...valuesFatura, valorPago: '' }, dialogPagar: true });
    this.handleCloseFaturaMenu();
  }

  handleBaixarPagamentoFatura = ({ id: idPagamento }, idConta) => async () => {
    const { unidade: { id: empresaUnidade }, notify } = this.props;
    const { faturas, status, faturaSelecionada: { id, index } } = this.state;
    try {
      this.setState({ loading: true });
      const values = await FinanceiroService
        .baixarPagamentoFatura({
          id,
          idConta,
          idPagamento,
          empresaUnidade,
        });

      faturas[index] = { ...values, status: status[values.situacao] };
      this.setState({ faturas });
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
      this.handleCloseFaturaMenu();
    }
  }


  handleEstornarPagamentoFaturas = idPagamentos => async () => {
    const { unidade: { id: empresaUnidade }, notify } = this.props;
    const { faturas, status, faturaSelecionada: { id, index }, pagamentosSelecionados } = this.state;
    try {
      this.setState({ loading: true });
      const values = await FinanceiroService
        .estornarPagamentoFatura({
          id,
          idPagamentos,
          empresaUnidade,
        });

      idPagamentos.map((pagamento) => {
        if (pagamentosSelecionados.includes(pagamento)) {
          this.sanitizationPagamento(pagamento);
        }
      });

      faturas[index] = { ...values, status: status[values.situacao] };
      this.setState({ faturas });
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
      this.handleCloseFaturaMenu();
    }
  }


  handleRemoveFatura = ({ id, index }) => async () => {
    const { unidade, notify } = this.props;
    let { faturas } = this.state;
    try {
      this.setState({ loading: true });
      await FinanceiroService
        .excluirFatura({
          id,
          empresaUnidade: unidade.id,
        });

      faturas = faturas.filter((item, i) => i !== index);
      this.setState({ faturas });

      notify('Fatura excluída com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar remover a fatura.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
      this.handleCloseFaturaMenu();
    }
  }


  handleClickMenuItemChangeStatus = faturaSelecionada => () => {
    this.handleCloseFaturaMenu();
  }

  handleClose = () => {
    this.setState({ dialogPagar: false, dialogFatura: false, dialogPagamentos: false });
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
    const { classes } = this.props;
    const {
      conta,
      modalContas,
      faturas,
      anchorElMenu,
      faturaSelecionada,
      valuesPesquisar,
      valuesFatura,
      dialogPagar,
      contas,
      dialogFatura,

      loading,
      pagamentoSelecionado,
      pagamentosSelecionados,
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
                          label="VALOR DA FATURA"
                          value={valuesFatura.valorRestante}
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
                          value={valuesFatura.valorPago}
                          onChange={this.handleChange('valuesFatura', 'valorPago')}
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
                          value={valuesFatura.conta}
                          options={contas.map(item => ({
                            id: item.id,
                            label: `${String(item.descricao).toUpperCase()}`,
                            subLabel: `SALDO: ${formataDinheiro(item.saldo)}`,
                          }))}
                          autoCompleteAsync
                          onChange={this.handleChangeModal('valuesFatura', 'conta')}
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
                              name="FaturaPaga"
                              onChange={!(valuesFatura.valorPago && valuesFatura.valorRestante && (valuesFatura.valorPago >= valuesFatura.valorRestante)) && this.handleChangeSelect('valuesFatura', 'pagamentoParcial')}
                              color="primary"
                              value={valuesFatura.pagamentoParcial}
                              checked={valuesFatura.pagamentoParcial}
                            />
                          )}
                          label="Fatura Paga?"
                        />
                      </Grid>

                      { valuesFatura.valorPago && valuesFatura.valorRestante && (valuesFatura.valorPago > valuesFatura.valorRestante) ? (
                        <Grid item sm={12} md={12} lg={12}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="TROCO"
                            value={formataDinheiro(valuesFatura.valorPago - valuesFatura.valorRestante)}
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
                          value={valuesFatura.observacoes}
                          onChange={this.handleChange('valuesFatura', 'observacoes')}
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
                          onClick={() => this.handleSubmitPagamento('valuesFatura', 'isSubmitting')}
                          variant="contained"
                          size="medium"
                          color="secondary"
                          type="submit"
                          disabled={valuesFatura.isSubmitting || !valuesFatura.conta || !valuesFatura.valor || !valuesFatura.valorPago}
                        >
                          {valuesFatura.isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Pagar'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContentText>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogFatura}
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
                          value={valuesFatura.descricao}
                          onChange={this.handleChange('valuesFatura', 'descricao')}
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
                              onChange={this.handleChangeSelect('valuesFatura', 'ativo')}
                              color="primary"
                              value={valuesFatura.ativo}
                              checked={valuesFatura.ativo}
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
                          value={valuesFatura.dataVencimento}
                          onChange={this.handleChangeDate('valuesFatura', 'dataVencimento')}
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
                          label="Valor da fatura"
                          value={valuesFatura.valor}
                          onChange={this.handleChange('valuesFatura', 'valor')}
                          InputProps={{
                            inputComponent: InputFormatDinheiro,
                          }}
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          fullWidth
                          onClick={() => this.handleSubmitFaturaPagamento('valuesFatura', 'isSubmitting')}
                          variant="contained"
                          size="medium"
                          color="secondary"
                          type="submit"
                          disabled={valuesFatura.isSubmitting || !valuesFatura.descricao || !valuesFatura.dataVencimento || !valuesFatura.valor}
                        >
                          {valuesFatura.isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
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
                            <TableCell align="center" className={classes.cellPagamentos} colSpan={9}>{`PAGAMENTO(S) DE ${!isEmpty(faturaSelecionada) && String(faturaSelecionada.descricao).toUpperCase()}`}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Data do Pagamento</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Valor da Fatura</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Valor Pago</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1}>Troco</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={2}>Observações</TableCell>
                            <TableCell align="left" className={classes.tableCell} colSpan={2}>Status</TableCell>
                            <TableCell align="center" className={classes.tableCell} colSpan={1} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {!isEmpty(faturaSelecionada) ? (
                            <>
                              {faturaSelecionada.pagamentos.map((pagamento, index) => (
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
                    onClick={this.handleEstornarPagamentoFaturas(pagamentosSelecionados)}
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
                      label="Valor da fatura (Início)"
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
                      label="Valor da fatura (Fim)"
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

                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      onClick={async () => {
                        this.setState({ valuesPesquisar: InitialValuesPesquisar });
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

                <Grid item container direction="row" spacing={1} sm={12} md={12} lg={6} style={{ paddingLeft: 15, paddingTop: 30 }}>
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
                      onClick={() => this.setState({ dialogFatura: true, valuesFatura: InitialValuesFatura })}
                      variant="contained"
                      size="medium"
                      color="secondary"
                      type="submit"
                    >
                      Nova fatura
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>

          </Grid>

          <Grid item container alignItems="flex-start" sm={12} md={12} lg={12}>
            {!!faturas.length && (
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
                      <TableCell align="right" className={classes.cellMenu} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {faturas.map((fatura, index) => (
                      <Fragment>
                        <TableRow>
                          <TableCell align="left" className={classes.tableCell}>{fatura.descricao}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{fatura.dataPagamento ? moment(fatura.dataPagamento).format('DD/MM/YYYY [às] HH[h]mm') : '-'}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{moment(fatura.dataVencimento).format('DD/MM/YYYY')}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{formataDinheiro(fatura.valor)}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{formataDinheiro(fatura.valorPago)}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{formataDinheiro(fatura.valorRestante)}</TableCell>
                          <TableCell align="center" className={classes.tableCell}>{this.renderSituacao(fatura.situacao)}</TableCell>
                          <TableCell align="right" className={classes.tableCell}>
                            <IconButton
                              arial-label="Mais"
                              aria-owns={anchorElMenu ? `menu-${fatura.id}` : undefined}
                              aria-haspopup="true"
                              onClick={this.handleClickFaturaMenu(fatura, index)}
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
            {((faturaSelecionada.status === 0 || faturaSelecionada.status === 1) && pagamentoSelecionado.situacao !== 'AGUARDANDO_BAIXA') && (
              <MenuItem
                button
                onClick={this.handleEstornarPagamentoFaturas([pagamentoSelecionado.id])}
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

            {faturaSelecionada.status === 2 && (
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


        {!!faturaSelecionada && faturaSelecionada.ativo && (
          <Menu
            id={`menu-${faturaSelecionada.id}`}
            anchorEl={anchorElMenu}
            open={!!anchorElMenu}
            onClose={this.handleCloseFaturaMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 180,
                justifyContent: 'center',
              },
            }}
          >

            {faturaSelecionada.status === 1 && (
            <MenuItem
              button
              onClick={this.handlePagarFatura(faturaSelecionada)}
            >
              <LabelClin
                text="PAGAR"
                iconSize="20px"
                bgColor="#adebad"
                textColor="#2eb82e"
              />
            </MenuItem>
            )}
            {!isEmpty(faturaSelecionada.pagamentos) && (
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

            {faturaSelecionada.status === 1 && (
              <MenuItem
                button
                onClick={this.handleRemoveFatura(faturaSelecionada)}
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
    displayName: 'Faturas',
    validateOnBlur: false,
    validateOnChange: false,
    mapPropsToValues: () => ({}),
  }),
)(Faturas);
