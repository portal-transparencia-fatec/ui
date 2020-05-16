/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-compare-neg-zero */
/* eslint-disable react/prefer-stateless-function */
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import { compose } from 'redux';
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import uuid from 'uuid/v1';
import Menu from '@material-ui/core/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { isEmpty } from 'lodash';
import MenuItem from '@material-ui/core/MenuItem';
import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import NoteIcon from '@material-ui/icons/Note';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import Icon from '@mdi/react';
import {
  mdiEyePlus,
} from '@mdi/js';
import LoadingIndicator from '../../../../../../components/LoadingIndicator';
import ModalSelect from '../../../../../../components/ModalSelect';
import {
  InputFormatDinheiro,
  InputFormatNaturalNumber,
} from '../../../../../../components/InputFormat';
import Material from './styles';
import NotificationActions from '../../../../../../store/ducks/notifier';
import Tabs from './Tabs';
import {
  formataDinheiro,
} from '../../../../../../libs/utils';
import FinanceiroService from '../../../../../../services/Financeiro';

const iconSize = '30px';
const InitialActiveTab = 'DINHEIRO';
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

class FormaPagamento extends Component {
  state={
    editarAnchorEl: null,
    openDialogParcelas: false,
    formaPagamentoOptions: {
      DINHEIRO: 'DINHEIRO',
      CONVÊNIO: 'CONVENIO',
      CRÉDITO: 'CARTAO_CREDITO',
      DÉBITO: 'CARTAO_DEBITO',
      CHEQUE: 'CHEQUE',
    },
    labelFormaPagamentoOptions: {
      DINHEIRO: 'DINHEIRO',
      CONVENIO: 'CONVÊNIO',
      CARTAO_CREDITO: 'CRÉDITO',
      CARTAO_DEBITO: 'DÉBITO',
      CHEQUE: 'CHEQUE',
    },
    formaPagamentoCondicoes: {
      CRÉDITO: 'CARTAO_CREDITO',
      CHEQUE: 'CHEQUE',
    },
    condicoesPagamento: [],
    condicaoActive: null,
    activeTab: InitialActiveTab,
    formaPagamento: [],
    parcelaOptions: {
      parcelas: [],
      totalParcelas: null,
      qtdParcelasDisponiveis: [],
    },
    parcelaSelectOptions: false,
    valorRecebido: '',
    parcelaOption: null,
    payments: [],
    paymentsParcelas: [],
    value: '',
    total: 0,
    totalPayments: 0,
    loading: false,
    isSubmitting: false,
    prevGuiaAgendamentos: {
      agendamentos: [],
      totalConvenio: 0,
      totalPagar: 0,
      total: 0,
    },
  }

  componentDidMount = async () => {
    const { guiaAgendamentos, onComplete } = this.props;
    const {
      payments, total, totalPayments, formaPagamentoCondicoes, paymentsParcelas,
    } = this.state;
    this.setState({ prevGuiaAgendamentos: guiaAgendamentos });

    onComplete(payments, total, totalPayments, paymentsParcelas);

    await Promise.all(
      Object.keys(formaPagamentoCondicoes).map(async (option) => {
        await this.fetchCondicoesPagamento(option);
      }),
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      paymentsParcelas, condicaoActive, payments, total, totalPayments, value, activeTab, formaPagamento, parcelaOption,
    } = this.state;
    const { onComplete } = this.props;
    if (payments !== prevState.payments) {
      onComplete(payments, total, totalPayments, paymentsParcelas);
    }

    if (activeTab !== prevState.activeTab) {
      this.setState({ formaPagamento: [] });
    }

    if (parcelaOption && parcelaOption !== prevState.parcelaOption) {
      this.generateParcelas();
    }

    if (value !== prevState.value && parcelaOption && (formaPagamento[0].qtdParcelasDisponiveis)) {
      const parcelaOptions = {
        parcelas: [],
        totalParcelas: null,
        qtdParcelasDisponiveis: this.state.parcelaOptions.qtdParcelasDisponiveis,
      };
      this.setState({ parcelaOptions, parcelaOption: null });
    }

    if (formaPagamento.length && formaPagamento !== prevState.formaPagamento) {
      const parcelaOptions = { parcelas: [], totalParcelas: null, qtdParcelasDisponiveis: [] };
      for (let id = 1; id <= formaPagamento[0].qtdParcelasDisponiveis; id += 1) {
        parcelaOptions.qtdParcelasDisponiveis.push({
          id,
          value: id,
        });
      }
      this.setState({ parcelaOptions });
    }

    if (condicaoActive !== prevState.condicaoActive) {
      if (condicaoActive) {
        this.setState({ parcelaOption: null });
        this.fetchCondicaoPagamento(condicaoActive);
      } else {
        this.setState({ formaPagamento: [] });
      }
    }
  }

  fetchCondicoesPagamento = async (option) => {
    const { unidade, notify } = this.props;
    const { formaPagamentoOptions } = this.state;
    try {
      const data = await FinanceiroService.searchCondicaoPagamento({
        ativo: true,
        formaPagamento: formaPagamentoOptions[option],
        empresaUnidade: unidade.id,
      });

      data.map(async (condicaoPagamento) => {
        await this.setState({ condicoesPagamento: [...this.state.condicoesPagamento, condicaoPagamento] });
      });
    } catch (err) {
      console.log(err);
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível buscar as informações referentes à condição de pagamento.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }


  generateParcelas = async () => {
    const { unidade, notify } = this.props;
    const {
      value, parcelaOption, formaPagamento, parcelaOptions: { qtdParcelasDisponiveis },
    } = this.state;
    try {
      const { totalParcelas, parcelas } = await FinanceiroService.gerarParcelas({
        valor: value,
        qtdParcelas: parcelaOption,
        empresaUnidade: unidade.id,
        condicaoPagamento: formaPagamento[0].id,
      });

      const parcelaOptions = { parcelas: [], qtdParcelasDisponiveis, totalParcelas };

      parcelas.map(({ valor, data }, index) => {
        parcelaOptions.parcelas.push({
          id: index + 1,
          valor,
          data,
        });
      });
      this.setState({ parcelaOptions, openDialogParcelas: true });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível gerar as parcelas referentes à condição de pagamento selecionada.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }

  fetchCondicaoPagamento = async (condicaoId) => {
    const { notify } = this.props;
    try {
      const formaPagamento = await FinanceiroService.searchByIdCondicaoPagamento(condicaoId);
      this.setState({ formaPagamento: [formaPagamento] });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível buscar as informações referentes à condição de pagamento.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }

  handleDeletePayment = async (payment, index) => {
    let { payments, paymentsParcelas, total } = this.state;
    payments = payments.filter((item, i) => i !== index);

    if (payment.parcelas) {
      paymentsParcelas = paymentsParcelas.filter(({ uuid }) => uuid !== payment.uuid);
    }

    total -= payment.valorEventos;
    this.setState({ payments, paymentsParcelas, total });
  }

  handleTab = (activeTab) => {
    const parcelaOptions = { parcelas: [], qtdParcelasDisponiveis: [], totalParcelas: null };
    this.setState({
      parcelaOption: null,
      parcelaOptions,
      activeTab,
      value: '',
      valorRecebido: '',
      condicaoActive: null,
    });
  }

  handleChangeDate = name => (date) => {
    this.setState({ [name]: date });
  }

  handleClickParcelaMenu = (event) => {
    this.setState({ editarAnchorEl: event.currentTarget, parcelaSelectOptions: true });
  }

  handleCloseParcelaMenu = () => {
    this.setState({ editarAnchorEl: null, parcelaSelectOptions: false });
  }

  handleSelectParcelaMenu = parcelaOption => () => {
    const { parcelaOptions: { qtdParcelasDisponiveis } } = this.state;
    if (parcelaOption !== this.state.parcelaOption) {
      this.setState({ parcelaOption });
    } else {
      const parcelaOptions = { parcelas: [], qtdParcelasDisponiveis, totalParcelas: null };
      this.setState({ parcelaOption: null, parcelaOptions });
    }
    this.handleCloseParcelaMenu();
  }

  renderFormaPagamentoIndisponivel = (formaPagamento) => {
    const { classes } = this.props;
    const { condicoesPagamento, activeTab, condicaoActive } = this.state;

    const condicoesPagamentoFilter = condicoesPagamento.filter(condicao => condicao.formaPagamento === formaPagamento);
    return (
      <Grid container spacing={2} justify="center" alignItems="center" direction="row" sm={12} md={12} lg={12}>

        <Grid item xs={12} sm={12} md={12} lg={12}>
          <ModalSelect
            label={`Condição de Pagamento para ${activeTab}`}
            empty="Nenhum resultado encontrado..."
            placeholderFilter="Filtrar condições..."
            value={condicaoActive}
            options={condicoesPagamentoFilter.map(condicao => ({ id: condicao.id, label: `${String(condicao.descricao).toUpperCase()} - juros: ${condicao.juros}% - Qtd. Parcelas: ${condicao.qtdParcelasDisponiveis} - Dias Entre Parcelas: ${condicao.diasEntreParcelas}` }))}
            onChange={condicaoActive => this.setState({ condicaoActive })}
            textfieldProps={{
              variant: 'outlined',
              fullWidth: true,
              textAlign: 'center',
            }}
            InputLabelProps={{
              style: { color: '#666', fontWeight: 900, textAlign: 'center' },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Typography
            className={classes.textInfoAside}
            component="p"
            variant="body1"
            align="center"
          >
            Selecione a condição de pagamento
            <br />
            que será aplicada neste lançamento.
          </Typography>
        </Grid>
      </Grid>
    );
  }

  handleChangeChequeNumero = (index, { target: { value: chequeNumero } }) => {
    const { parcelaOptions } = this.state;
    const { parcelas } = parcelaOptions;

    parcelaOptions.parcelas.splice(index, 1, { ...parcelas[index], chequeNumero });
    this.setState({ parcelaOptions });
  }

  handleChangeChequeBanco = (index, { target: { value: chequeBanco } }) => {
    const { parcelaOptions } = this.state;
    const { parcelas } = parcelaOptions;

    parcelaOptions.parcelas.splice(index, 1, { ...parcelas[index], chequeBanco });
    this.setState({ parcelaOptions });
  }


  isDisabled = () => {
    const { value, parcelaOptions: { parcelas }, parcelaOption, total, prevGuiaAgendamentos: { totalPagar } } = this.state;
    const chequeBanco = parcelas.filter(parcela => parcela.chequeBanco);
    const chequeNumero = parcelas.filter(parcela => parcela.chequeNumero);

    if (!value || !parcelaOption || value > totalPagar - total) {
      return true;
    }

    if (chequeBanco.length !== parcelaOption || chequeNumero.length !== parcelaOption) {
      return true;
    }
    return false;
  }

  sanitizationValue = async () => {
    const {
      condicaoActive, condicoesPagamento, formaPagamentoOptions, labelFormaPagamentoOptions, value, activeTab, valorRecebido, parcelaOptions: { parcelas, totalParcelas },
    } = this.state;
    let pagamentos;
    const troco = parseFloat((valorRecebido - value).toFixed(2));
    const valorEventos = parseFloat((value).toFixed(2));

    switch (activeTab) {
      case labelFormaPagamentoOptions.DINHEIRO:
        pagamentos = {
          formaPagamento: formaPagamentoOptions.DINHEIRO,
          troco,
          valorEventos,
          total: valorEventos,
          valorPago: parseFloat((valorRecebido).toFixed(2)),
        };
        break;
      case labelFormaPagamentoOptions.CARTAO_CREDITO:
        pagamentos = {
          formaPagamento: formaPagamentoOptions.CRÉDITO,
          total: totalParcelas,
          valorEventos,
          parcelas,
          uuid: uuid(),
        };
        break;
      case labelFormaPagamentoOptions.CARTAO_DEBITO:
        pagamentos = {
          formaPagamento: formaPagamentoOptions.DÉBITO,
          total: valorEventos,
          valorEventos,
          valorPago: valorEventos,
        };
        break;
      case labelFormaPagamentoOptions.CHEQUE:
        pagamentos = {
          formaPagamento: formaPagamentoOptions.CHEQUE,
          total: totalParcelas,
          valorEventos,
          parcelas,
          uuid: uuid(),
        };
        break;
      default:
        break;
    }
    const payments = [...this.state.payments];
    const paymentsParcelas = [...this.state.paymentsParcelas];

    payments.push(pagamentos);

    if (pagamentos.parcelas) {
      const { uuid, parcelas } = pagamentos;
      const condicaoPagamento = condicoesPagamento.filter(condicao => condicao.id === condicaoActive).find(Boolean);
      paymentsParcelas.push({ uuid, parcelas, condicaoPagamento });
    }


    const totalPayments = payments.reduce((context, { total }) => context + total, 0);
    const total = payments.reduce((context, { valorEventos }) => context + valorEventos, 0);

    this.setState({
      payments,
      paymentsParcelas,
      total,
      totalPayments,
      value: '',
      valorRecebido: '',
      parcelaOption: null,
      parcelaOptions: {
        parcelas: [],
        totalParcelas: null,
        qtdParcelasDisponiveis: this.state.parcelaOptions.qtdParcelasDisponiveis,
      },
    });
  }

  renderRowPayments = (payment, index) => {
    const { classes } = this.props;
    const { labelFormaPagamentoOptions, formaPagamentoOptions } = this.state;
    const { formaPagamento } = payment;
    if (formaPagamento === formaPagamentoOptions.DINHEIRO) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colspan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.DINHEIRO}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorPago))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Recebendo:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Troco:
            <br />
            <strong>{formataDinheiro(Number(payment.troco))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="right" colspan={6}>
            <IconButton
              className={classes.tableRow}
              onClick={() => this.handleDeletePayment(payment, index)}
            >
              <CloseIcon />
            </IconButton>
          </TableCell>
        </Fragment>
      );
    }


    if (formaPagamento === formaPagamentoOptions.CRÉDITO) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colspan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.CARTAO_CREDITO}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={4}>
            Total Parcelado:
            <br />
            <strong>
              {formataDinheiro(payment.total)}
            </strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="right" colspan={6}>
            <IconButton
              className={classes.tableRow}
              onClick={() => this.handleDeletePayment(payment, index)}
            >
              <CloseIcon />
            </IconButton>
          </TableCell>
        </Fragment>
      );
    }

    if (formaPagamento === formaPagamentoOptions.DÉBITO) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colspan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.CARTAO_DEBITO}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="right" colspan={10}>
            <IconButton
              className={classes.tableRow}
              onClick={() => this.handleDeletePayment(payment, index)}
            >
              <CloseIcon />
            </IconButton>
          </TableCell>
        </Fragment>
      );
    }

    if (formaPagamento === formaPagamentoOptions.CHEQUE) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colspan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.CHEQUE}</strong>
          </TableCell>

          <TableCell className={classes.tableCell} align="left" colspan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colspan={4}>
            Total Parcelado:
            <br />
            <strong>{formataDinheiro(payment.total)}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="right" colspan={6}>
            <IconButton
              className={classes.tableRow}
              onClick={() => this.handleDeletePayment(payment, index)}
            >
              <CloseIcon />
            </IconButton>
          </TableCell>
        </Fragment>
      );
    }
  }

  render() {
    const {
      paymentsParcelas, condicaoActive, condicoesPagamento, formaPagamentoOptions, labelFormaPagamentoOptions, totalPayments, openDialogParcelas, editarAnchorEl, parcelaSelectOptions, formaPagamento, activeTab, loading, parcelaOption, payments, isSubmitting, value, valorRecebido, prevGuiaAgendamentos, total, parcelaOptions,
    } = this.state;
    const { classes, guiaAgendamentos: { agendamentos, totalConvenio, totalPagar } } = this.props;
    const open = Boolean(editarAnchorEl);

    const condicoesPagamentoFilter = condicoesPagamento.filter(condicao => condicao.formaPagamento === formaPagamentoOptions[activeTab]);

    return (
      <Grid container spacing={2}>
        <Dialog
          maxWidth="70vw"
          maxHeight="90vw"
          open={openDialogParcelas}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => this.setState({ openDialogParcelas: false })}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title" />
          <DialogContent>
            <DialogContentText style={{
              minHeight: '50vh', maxHeight: '50vh', minWidth: '65vw', maxWidth: '65vw',
            }}
            >
              <List>
                <Fragment>
                  {activeTab === labelFormaPagamentoOptions.CARTAO_CREDITO ? (
                    <>
                      <ListItemText
                        disableTypography
                        primary={<Typography type="body2" style={{ fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>Parcelas</Typography>}
                      />
                      <ListItemText primary={(
                        <Grid container spacing={2} direction="row" alignItems="center" justify="center" style={{ textAlign: 'center', fontWeight: 900 }}>
                          <Grid item sm={12} md={12} lg={1} />
                          <Grid item sm={12} md={12} lg={5}>
                            DATA
                          </Grid>
                          <Grid item sm={12} md={12} lg={6}>
                            VALOR
                          </Grid>
                        </Grid>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <ListItemText
                        disableTypography
                        primary={<Typography type="body2" style={{ fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>Parcelas</Typography>}
                      />
                      <ListItemText primary={(
                        <Grid container spacing={2} direction="row" alignItems="center" justify="center" style={{ textAlign: 'center', fontWeight: 900 }}>
                          <Grid item sm={12} md={12} lg={3}>
                            DATA
                          </Grid>
                          <Grid item sm={12} md={12} lg={3}>
                            VALOR
                          </Grid>
                          <Grid item sm={12} md={12} lg={3}>
                            BANCO
                          </Grid>
                          <Grid item sm={12} md={12} lg={3}>
                            CHEQUE N°
                          </Grid>
                        </Grid>
                        )}
                      />
                    </>
                  )}
                  {parcelaOptions.parcelas.map(({
                    data, valor, chequeNumero, chequeBanco,
                  }, index) => (
                    <ListItem style={{
                      borderBottom: '1px solid rgba(0, 0, 0, 0.40)', width: '100%', alignItems: 'center', justifyContent: 'center',
                    }}
                    >
                      <ListItemIcon>
                        <strong className={classes.rowIndex}>{index + 1}</strong>
                      </ListItemIcon>
                      {activeTab === labelFormaPagamentoOptions.CARTAO_CREDITO ? (
                        <ListItemText primary={(
                          <Grid container spacing={2} direction="row" alignItems="center" justify="center" style={{ textAlign: 'center', fontWeight: 900 }}>
                            <Grid item sm={12} md={12} lg={6}>
                              {moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                            </Grid>
                            <Grid item sm={12} md={12} lg={6}>
                              {formataDinheiro(valor)}
                            </Grid>
                          </Grid>
                          )}
                        />
                      ) : (
                        <ListItemText primary={(
                          <Grid container spacing={2} direction="row" alignItems="center" justify="center" style={{ textAlign: 'center', fontWeight: 900 }}>
                            <Grid item sm={12} md={12} lg={3}>
                              {moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                            </Grid>
                            <Grid item sm={12} md={12} lg={3}>
                              {formataDinheiro(valor)}
                            </Grid>
                            <Grid item sm={12} md={12} lg={3}>
                              <TextField
                                fullWidth
                                variant="outlined"
                                label="Cheque n°"
                                value={chequeNumero}
                                onChange={event => this.handleChangeChequeNumero(index, event)}
                                InputProps={{
                                  inputComponent: InputFormatNaturalNumber,
                                }}
                              />
                            </Grid>
                            <Grid item sm={12} md={12} lg={3}>
                              <TextField
                                fullWidth
                                variant="outlined"
                                label="Banco"
                                value={chequeBanco}
                                onChange={event => this.handleChangeChequeBanco(index, event)}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton>
                                        <AccountBalanceIcon />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>
                          )}
                        />
                      )}
                    </ListItem>
                  ))}
                </Fragment>
              </List>

            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ openDialogParcelas: false })}
              color="default"
            >
              FECHAR
            </Button>
          </DialogActions>
        </Dialog>
        <LoadingIndicator loading={loading} />
        <Grid item sm={12} md={12} lg={7}>
          <Grid item sm={12} md={12} lg={12} className={classes.paper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                  <TableCell align="center" colspan={5}>AGENDAMENTOS</TableCell>
                </TableRow>
                <TableRow
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                >
                  <TableCell align="center" colSpan={1}>Médico</TableCell>
                  <TableCell align="center" colSpan={2}>Evento</TableCell>
                  <TableCell align="center" colSpan={1}>Horário</TableCell>
                  <TableCell align="center" colSpan={1}>Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agendamentos.map((agendamento, index) => (
                  <Fragment>
                    <TableRow
                      style={{
                        backgroundColor: !agendamento.particular ? '#f6f7f8' : null,
                      }}
                    >
                      <TableCell className={classes.tableCell} align="center" colSpan={1}>{agendamento.medico}</TableCell>
                      <TableCell className={classes.tableCell} align="center" colSpan={2}>{agendamento.evento}</TableCell>
                      <TableCell className={classes.tableCell} align="center" colSpan={1}>{`${moment(agendamento.id.data).format('DD/MM/YYYY')} às ${moment(agendamento.id.hora, 'HH:mm:ss').format('HH:mm')}h`}</TableCell>
                      <TableCell className={classes.tableCell} align="center" colSpan={1}>{formataDinheiro(Number(agendamento.valorAgendamento))}</TableCell>
                    </TableRow>
                    {index === agendamentos.length - 1 && (
                      <Fragment>
                        <TableRow>
                          <TableCell align="right" colspan={5}>
                            <Grid container sm={12} md={12} lg={12} direction="row" justify="center" alignItems="center" style={{ minHeight: 80 }}>
                              <Grid item sm={12} md={12} lg={9} className={classes.tableCell}>
                                <strong>_</strong>
                              </Grid>

                              <Grid item sm={12} md={12} lg={3} alignItems="right" className={classes.tableCell}>
                                <br />
                                {formataDinheiro(Number(totalConvenio + totalPagar))}
                                <br />
                                {formataDinheiro(Number(totalConvenio))}
                                <br />
                                <strong style={{
                                  borderTop: '2px solid rgba(0, 0, 0, 0.87)',
                                }}
                                >
                                  {formataDinheiro(Number(totalPagar))}
                                </strong>
                              </Grid>
                            </Grid>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>

        <Grid item sm={12} md={12} lg={5}>
          <Grid item sm={12} md={12} lg={12} className={classes.paper}>
            <Tabs
              activeTab={activeTab}
              onActiveTabItem={this.handleTab}
            >
              <div label={labelFormaPagamentoOptions.DINHEIRO} icon={<AttachMoneyIcon />}>
                <div className={classes.tab} style={{ minHeight: 250 }}>
                  <Grid container spacing={2} direction="row" item sm={12} md={12} lg={12}>
                    <Grid item sm={12} md={12} lg={12}>
                      <Typography
                        className={classes.textInfoAside}
                        component="p"
                        variant="body1"
                        align="center"
                      >
                        Forma de Pagamento:
                        <strong>{labelFormaPagamentoOptions.DINHEIRO}</strong>
                        <br />
                        Valor a Receber:
                        {' '}
                        <strong>{formataDinheiro(prevGuiaAgendamentos.totalPagar - total)}</strong>
                      </Typography>
                    </Grid>

                    <Grid item sm={12} md={12} lg={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Valor a Pagar*"
                        value={value}
                        onChange={({ target }) => this.setState({ value: target.value })}
                        InputProps={{
                          inputComponent: InputFormatDinheiro,
                        }}
                      />
                    </Grid>

                    <Grid item sm={12} md={12} lg={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Recebendo"
                        value={valorRecebido}
                        onChange={({ target }) => this.setState({ valorRecebido: target.value })}
                        InputProps={{
                          inputComponent: InputFormatDinheiro,
                        }}
                      />
                    </Grid>

                    { value && valorRecebido && (valorRecebido > value) ? (
                      <Grid item sm={12} md={12} lg={12}>
                        <Typography
                          component="p"
                          variant="body1"
                          align="center"
                        >
                          <strong>
                            Troco:
                            {' '}
                            {formataDinheiro(valorRecebido - value)}
                          </strong>
                        </Typography>
                      </Grid>
                    ) : (null)}

                    <Grid item sm={12} md={12} lg={12}>
                      <Button
                        fullWidth
                        onClick={() => this.sanitizationValue()}
                        variant="contained"
                        size="medium"
                        color="secondary"
                        type="submit"
                        disabled={
                          (!value ? (true) : (
                            value > valorRecebido ? (true) : (
                              !(value <= (prevGuiaAgendamentos.totalPagar - total))
                            )
                          ))
                        }
                      >
                        {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                      </Button>
                    </Grid>
                  </Grid>
                </div>
              </div>

              <div label={labelFormaPagamentoOptions.CARTAO_CREDITO} icon={<CreditCardIcon />}>
                <div className={classes.tab} style={{ minHeight: condicaoActive ? 350 : 200 }}>
                  {formaPagamento.length ? (
                    <Grid container spacing={2} direction="row" item sm={12} md={12} lg={12}>
                      <Grid item sm={12} md={12} lg={12}>
                        <Typography
                          className={classes.textInfoAside}
                          component="p"
                          variant="body1"
                          align="center"
                        >
                          Forma de Pagamento:
                          <strong>{labelFormaPagamentoOptions.CARTAO_CREDITO}</strong>
                          <br />
                          Valor a Receber:
                          {' '}
                          <strong>{formataDinheiro(prevGuiaAgendamentos.totalPagar - total)}</strong>
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={12} md={12} lg={12}>
                        <ModalSelect
                          label={`Condição de Pagamento para ${activeTab}`}
                          empty="Carregando..."
                          placeholderFilter="Filtrar condições..."
                          value={condicaoActive}
                          options={condicoesPagamentoFilter.map(condicao => ({ id: condicao.id, label: `${String(condicao.descricao).toUpperCase()} - juros: ${condicao.juros}% - Qtd. Parcelas: ${condicao.qtdParcelasDisponiveis} - Dias Entre Parcelas: ${condicao.diasEntreParcelas}` }))}
                          onChange={condicaoActive => this.setState({ condicaoActive })}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                            textAlign: 'center',
                          }}
                          InputLabelProps={{
                            style: { color: '#666', fontWeight: 900, textAlign: 'center' },
                          }}
                        />
                      </Grid>


                      <Grid item sm={12} md={12} lg={12}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Valor a Pagar*"
                          value={value}
                          onChange={({ target }) => this.setState({ value: target.value })}
                          InputProps={{
                            inputComponent: InputFormatDinheiro,
                          }}
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          disabled={!value}
                          aria-controls={open ? 'menu-list-grow' : undefined}
                          aria-haspopup="true"
                          onClick={this.handleClickParcelaMenu}
                          style={{ fontSize: '0.7vw' }}
                          color="primary"
                          variant="contained"
                        >
                          {parcelaOption ? `Parcelando em ${parcelaOption}x` : 'Selecionar Parcela'}
                        </Button>
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <TextField
                          fullWidth
                          value={`${parcelaOptions.totalParcelas ? formataDinheiro(parcelaOptions.totalParcelas) : ''}`}
                          label="Total:"
                          onClick={() => this.setState({ openDialogParcelas: true })}
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end" onClick={() => this.setState({ openDialogParcelas: true })}>
                                <Icon
                                  path={mdiEyePlus}
                                  size={iconSize}
                                  color="#818181"
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          fullWidth
                          onClick={() => this.sanitizationValue()}
                          variant="contained"
                          size="medium"
                          color="secondary"
                          type="submit"
                          disabled={
                            (value === 0 || value === undefined ? (true) : (
                              !!(!parcelaOption || value > prevGuiaAgendamentos.totalPagar - total)
                            ))
                          }
                        >
                          {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                        </Button>
                      </Grid>
                    </Grid>
                  ) : (
                    this.renderFormaPagamentoIndisponivel(formaPagamentoOptions.CRÉDITO)
                  )}
                </div>
              </div>

              <div label={labelFormaPagamentoOptions.CARTAO_DEBITO} icon={<CreditCardIcon />}>
                <div className={classes.tab} style={{ minHeight: 200 }}>
                  <Grid container spacing={2} direction="row" item sm={12} md={12} lg={12}>
                    <Grid item sm={12} md={12} lg={12}>
                      <Typography
                        className={classes.textInfoAside}
                        component="p"
                        variant="body1"
                        align="center"
                      >
                        Forma de Pagamento:
                        <strong>{labelFormaPagamentoOptions.CARTAO_DEBITO}</strong>
                        <br />
                        Valor a Receber:
                        {' '}
                        <strong>{formataDinheiro(prevGuiaAgendamentos.totalPagar - total)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item sm={12} md={12} lg={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Valor a Pagar*"
                        value={value}
                        onChange={({ target }) => this.setState({ value: target.value })}
                        InputProps={{
                          inputComponent: InputFormatDinheiro,
                        }}
                      />
                    </Grid>

                    <Grid item sm={12} md={12} lg={12}>
                      <Button
                        fullWidth
                        onClick={() => this.sanitizationValue()}
                        variant="contained"
                        size="medium"
                        color="secondary"
                        type="submit"
                        disabled={!value || value > prevGuiaAgendamentos.totalPagar - total}
                      >
                        {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                      </Button>
                    </Grid>
                  </Grid>
                </div>
              </div>

              <div label={labelFormaPagamentoOptions.CHEQUE} icon={<NoteIcon />}>
                <div className={classes.tab} style={{ minHeight: condicaoActive ? 400 : 200 }}>
                  {formaPagamento.length ? (
                    <Grid container spacing={2} direction="row" item sm={12} md={12} lg={12}>
                      <Grid item sm={12} md={12} lg={12}>
                        <Typography
                          className={classes.textInfoAside}
                          component="p"
                          variant="body1"
                          align="center"
                        >
                          Forma de Pagamento:
                          <strong>{labelFormaPagamentoOptions.CHEQUE}</strong>
                          <br />
                          Valor a Receber:
                          {' '}
                          <strong>{formataDinheiro(prevGuiaAgendamentos.totalPagar - total)}</strong>
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={12} md={12} lg={12}>
                        <ModalSelect
                          label={`Condição de Pagamento para ${activeTab}`}
                          empty="Carregando..."
                          placeholderFilter="Filtrar condições..."
                          value={condicaoActive}
                          options={condicoesPagamentoFilter.map(condicao => ({ id: condicao.id, label: `${String(condicao.descricao).toUpperCase()} - juros: ${condicao.juros}% - Qtd. Parcelas: ${condicao.qtdParcelasDisponiveis} - Dias Entre Parcelas: ${condicao.diasEntreParcelas}` }))}
                          onChange={condicaoActive => this.setState({ condicaoActive })}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                            textAlign: 'center',
                          }}
                          InputLabelProps={{
                            style: { color: '#666', fontWeight: 900, textAlign: 'center' },
                          }}
                        />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Valor a Pagar*"
                          value={value}
                          onChange={({ target }) => this.setState({ value: target.value })}
                          InputProps={{
                            inputComponent: InputFormatDinheiro,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          disabled={!value}
                          aria-controls={open ? 'menu-list-grow' : undefined}
                          aria-haspopup="true"
                          onClick={this.handleClickParcelaMenu}
                          style={{ fontSize: '0.7vw' }}
                          color="primary"
                          variant="contained"
                        >
                          {parcelaOption ? `Parcelando em ${parcelaOption}x` : 'Selecionar Parcela'}
                        </Button>
                      </Grid>
                      <Grid item sm={12} md={12} lg={12}>
                        <TextField
                          fullWidth
                          value={`${parcelaOptions.totalParcelas ? formataDinheiro(parcelaOptions.totalParcelas) : ''}`}
                          label="Total:"
                          variant="outlined"
                          onClick={() => this.setState({ openDialogParcelas: true })}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end" onClick={() => this.setState({ openDialogParcelas: true })}>
                                <Icon
                                  path={mdiEyePlus}
                                  size={iconSize}
                                  color="#818181"
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          fullWidth
                          onClick={() => this.sanitizationValue()}
                          variant="contained"
                          size="medium"
                          color="secondary"
                          type="submit"
                          disabled={this.isDisabled()}
                        >
                          {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                        </Button>
                      </Grid>
                    </Grid>
                  ) : (
                    this.renderFormaPagamentoIndisponivel(formaPagamentoOptions.CHEQUE)
                  )}
                </div>
              </div>
            </Tabs>
          </Grid>
        </Grid>
        {!isEmpty(payments) && (
          <Grid item sm={12} md={12} lg={12}>
            <Grid item sm={12} md={12} lg={12} className={classes.paper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                  >
                    <TableCell align="center" colspan={16}>FORMA(S) DE PAGAMENTO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment, index) => (
                    <Fragment>
                      <TableRow>
                        {this.renderRowPayments(payment, index)}
                      </TableRow>
                      {index === payments.length - 1 && (
                      <TableRow>
                        <TableCell align="right" style={{ fontSize: '0.8vw' }} colspan={14}><b>{`TOTAL: ${formataDinheiro(Number(totalPayments))}`}</b></TableCell>
                      </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        )}

        {!isEmpty(paymentsParcelas) && (
          <Grid item sm={12} md={12} lg={12}>
            <Grid item sm={12} md={12} lg={12} className={classes.paper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                  >
                    <TableCell align="center" colspan={12}>PARCELAS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentsParcelas.map(({ uuid, condicaoPagamento, parcelas }) => (
                    <Fragment>
                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell className={classes.tableCell} align="center" colspan={2}>
                          <Grid className={classes.rowIndex}>
                            <strong>
                              {payments.map((payment, index) => {
                                if (payment.uuid === uuid) {
                                  return index + 1;
                                }
                              })}
                            </strong>
                          </Grid>
                        </TableCell>
                        <TableCell align="center" colspan={6}>
                          <strong>
                            {`${labelFormaPagamentoOptions[condicaoPagamento.formaPagamento]} - ${String(condicaoPagamento.descricao).toUpperCase()}`}
                          </strong>
                        </TableCell>
                        <TableCell align="center" colspan={4} />
                      </TableRow>

                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell colspan={2} />
                        <TableCell align="center" colspan={2}><strong>DATA</strong></TableCell>
                        <TableCell align="center" colspan={2}><strong>VALOR</strong></TableCell>
                        <TableCell align="center" colspan={2}><strong>CHEQUE Nº</strong></TableCell>
                        <TableCell align="center" colspan={2}><strong>BANCO</strong></TableCell>
                      </TableRow>

                      <TableRow style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }} />
                      {parcelas.map((parcela, index) => (
                        <Fragment>
                          <TableRow>
                            <TableCell colspan={1} />
                            <TableCell className={classes.tableCell} align="center" colspan={1}>
                              <Grid className={[classes.rowItemIndex]}>
                                {`${parcela.id > 9 ? parcela.id : `0${parcela.id}`}ª`}
                              </Grid>
                            </TableCell>
                            <TableCell align="center" colspan={2}><strong>{`${moment(parcela.data, 'YYYY-MM-DD').format('DD/MM/YYYY')}`}</strong></TableCell>
                            <TableCell align="center" colspan={2}><strong>{`${formataDinheiro(parcela.valor)}`}</strong></TableCell>
                            <TableCell align="center" colspan={2}><strong>{parcela.chequeNumero || '-'}</strong></TableCell>
                            <TableCell align="center" colspan={2}><strong>{parcela.chequeBanco || '-'}</strong></TableCell>
                          </TableRow>
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        )}

        {!!parcelaSelectOptions && (
          <Menu
            id={`menu-${parcelaSelectOptions}`}
            anchorEl={editarAnchorEl}
            open={open}
            onClose={this.handleCloseParcelaMenu}
            PaperProps={{
              style: {
                maxHeight: 150,
                width: 100,
              },
            }}
          >
            {parcelaOptions.qtdParcelasDisponiveis.map(parcela => (
              <MenuItem style={{ justifyContent: 'center' }} selected={parcela.id === parcelaOption} key={`parcela-${parcela.id}`} button onClick={this.handleSelectParcelaMenu(parcela.id)}>{parcela.value > 9 ? parcela.value : `0${parcela.value}`}</MenuItem>
            ))}
          </Menu>
        )}
      </Grid>
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
  withStyles(Material, { withTheme: true }),
  withFormik({
    displayName: 'FormaPagamento',
    validateOnChange: false,
    validateOnBlur: false,
    mapPropsToValues: () => ({
      agendamentosGroup: [],
      showGuia: false,
    }),
  }),
)(FormaPagamento);
