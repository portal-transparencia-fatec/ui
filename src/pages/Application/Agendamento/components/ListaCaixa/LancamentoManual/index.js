/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-case-declarations */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import Slide from '@material-ui/core/Slide';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import NoteIcon from '@material-ui/icons/Note';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import Paper from '@material-ui/core/Paper';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import Icon from '@mdi/react';
import {
  mdiEyePlus,
} from '@mdi/js';
import ModalSelect from '../../../../../../components/ModalSelect';
import NotificationActions from '../../../../../../store/ducks/notifier';
import Material from './styles';
import {
  InputFormatNaturalNumber,
  InputFormatDinheiro,
} from '../../../../../../components/InputFormat';
import {
  formataDinheiro,
} from '../../../../../../libs/utils';
import FinanceiroService from '../../../../../../services/Financeiro';
import TabPanel from '../../../../../../components/TabPanel';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const iconSize = '30px';
const InitialValues = {
  descricao: '',
  valor: '',
  valorPago: '',
  banco: '',
  dataPagamento: null,
  parcelaOption: null,
  numberCheque: null,
};

const InitialPagamentoOptions = [
  'DINHEIRO',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'CHEQUE',
];
const InitialTabValue = 0;

class LancamentoManual extends Component {
  state = {
    condicaoActive: null,
    condicoesPagamento: [],
    formaPagamentoCondicoes: {
      CRÉDITO: 'CARTAO_CREDITO',
      CHEQUE: 'CHEQUE',
    },

    editarAnchorEl: null,
    openDialogParcelas: false,
    formaPagamento: {},
    pagamentoOption: InitialPagamentoOptions,
    activeTab: InitialPagamentoOptions[InitialTabValue],
    formaPagamentoOptions: {
      DINHEIRO: 'DINHEIRO',
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
    values: InitialValues,
    isSubmitting: false,
    tabValue: InitialTabValue,
    entrada: true,
    gerarCobranca: false,
    parcelaOptions: {
      parcelas: [],
      totalParcelas: null,
      qtdParcelasDisponiveis: [],
    },
  }

  componentDidMount = async () => {
    const { formaPagamentoCondicoes } = this.state;

    await Promise.all(
      Object.keys(formaPagamentoCondicoes).map(async (option) => {
        await this.fetchCondicoesPagamento(option);
      }),
    );
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const {
      values: { parcelaOption, valor }, formaPagamento, activeTab, condicaoActive,
    } = this.state;

    const { open } = this.props;

    if (open && open !== prevProps.open) {
      this.setState({ condicaoActive: null });
    }

    if (activeTab !== prevState.activeTab) {
      this.setState({ formaPagamento: {} });
      // this.fetchCondicaoPagamento(activeTab);
    }

    if (parcelaOption && parcelaOption !== prevState.values.parcelaOption) {
      this.generateParcelas();
    }


    if (valor !== prevState.values.valor || condicaoActive !== prevState.condicaoActive) {
      if (condicaoActive) {
        this.setState({ values: { ...this.state.values, parcelaOption: null } });
        this.fetchCondicaoPagamento(condicaoActive);
      } else {
        this.setState({ formaPagamento: {} });
      }
    }

    if (!isEmpty(formaPagamento) && formaPagamento !== prevState.formaPagamento) {
      this.getQtdParcelasDisponiveis();
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

  getQtdParcelasDisponiveis = () => {
    const { formaPagamento: { qtdParcelasDisponiveis } } = this.state;
    const parcelaOptions = { parcelas: [], totalParcelas: null, qtdParcelasDisponiveis: [] };
    for (let id = 1; id <= qtdParcelasDisponiveis; id += 1) {
      parcelaOptions.qtdParcelasDisponiveis.push({
        id,
        value: id,
      });
    }
    this.setState({ parcelaOptions });
  }

  fetchCondicaoPagamento = async (condicaoId) => {
    const { notify } = this.props;
    try {
      const formaPagamento = await FinanceiroService.searchByIdCondicaoPagamento(condicaoId);
      this.setState({ formaPagamento });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível buscar as informações referentes à condição de pagamento.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }


  handleTabChange = (event, tabValue) => {
    const { pagamentoOption, labelFormaPagamentoOptions } = this.state;
    const activeTab = labelFormaPagamentoOptions[pagamentoOption[tabValue]];

    if (activeTab === labelFormaPagamentoOptions.CARTAO_CREDITO || activeTab === labelFormaPagamentoOptions.CHEQUE) {
      const parcelaOptions = {
        parcelas: [],
      };
      this.setState({ parcelaOptions });
    }
    this.setState({
      tabValue, activeTab, values: InitialValues, condicaoActive: null,
    });
  }

  handleChange = name => ({ target: { value } }) => {
    const values = { ...this.state.values };
    values[name] = value;
    this.setState({ values });
  }

  renderFormaPagamentoIndisponivel = (formaPagamento) => {
    const { classes } = this.props;
    const { condicoesPagamento, activeTab, condicaoActive } = this.state;

    const condicoesPagamentoFilter = condicoesPagamento.filter(condicao => condicao.formaPagamento === formaPagamento);
    return (
      <Grid container style={{ paddingTop: '5vh' }} spacing={2} justify="center" alignItems="center" direction="row" sm={12} md={12} lg={12}>
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
            Selecione a condição de pagamento que será aplicada neste lançamento.
          </Typography>
        </Grid>
      </Grid>
    );
  }

  handleClickParcelaMenu = (event) => {
    this.setState({ editarAnchorEl: event.currentTarget, parcelaSelectOptions: true });
  }

  handleCloseParcelaMenu = () => {
    this.setState({ editarAnchorEl: null, parcelaSelectOptions: false });
  }

  handleSelectParcelaMenu = parcelaOption => () => {
    const { values, parcelaOptions: { qtdParcelasDisponiveis } } = this.state;
    if (parcelaOption !== values.parcelaOption) {
      this.setState({ values: { ...values, parcelaOption } });
    } else {
      const parcelaOptions = { parcelas: [], qtdParcelasDisponiveis, totalParcelas: null };
      this.setState({ values: { ...values, parcelaOption: null }, parcelaOptions });
    }
    this.handleCloseParcelaMenu();
  }

  generateParcelas = async () => {
    const { unidade, notify } = this.props;
    const {
      values: { valor, parcelaOption }, formaPagamento, parcelaOptions: { qtdParcelasDisponiveis },
    } = this.state;
    try {
      const { totalParcelas, parcelas } = await FinanceiroService.gerarParcelas({
        valor,
        qtdParcelas: parcelaOption,
        empresaUnidade: unidade.id,
        condicaoPagamento: formaPagamento.id,
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

  handleSubmit = async (formaPagamento) => {
    const {
      labelFormaPagamentoOptions,
      activeTab,
      parcelaOptions: { parcelas },
      values: {
        valor, descricao,
      }, entrada, gerarCobranca,
    } = this.state;
    const {
      handleClose, notify, onComplete, dataCaixaRecepcao, unidade,
    } = this.props;

    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));

    let form = {
      data: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
      dataPagamento: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
      descricao,
      empresaUnidade: unidade.id,
      entrada,
      formaPagamento,
      gerarCobranca,
      valor,
      valorEventos: valor,
    };

    try {
      this.setState({ isSubmitting: true });
      if (activeTab === labelFormaPagamentoOptions.CHEQUE || activeTab === labelFormaPagamentoOptions.CARTAO_CREDITO) {
        form = {
          ...form,
          parcelas,
        };
      }

      await FinanceiroService.lancamentoManual({
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
        form,
      });

      onComplete();
      handleClose();
      notify('Lançamento realizado com sucesso.', { variant: 'success' });
    } catch (err) {
      notify('Ocorreu um erro ao tentar realizar o lançamento.', { variant: 'error' });
    } finally {
      this.setState({ isSubmitting: false, values: InitialValues });
    }
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
    const { isSubmitting, values, parcelaOptions: { parcelas } } = this.state;
    const chequeBanco = parcelas.filter(parcela => parcela.chequeBanco);
    const chequeNumero = parcelas.filter(parcela => parcela.chequeNumero);

    if (isSubmitting || !values.parcelaOption || !values.descricao || !values.valor) {
      return true;
    }
    if (chequeBanco.length !== values.parcelaOption || chequeNumero.length !== values.parcelaOption) {
      return true;
    }
    return false;
  }

  render() {
    const {
      open,
      classes,
      handleClose,
    } = this.props;
    const {
      condicoesPagamento, condicaoActive, formaPagamentoOptions, activeTab, labelFormaPagamentoOptions, parcelaSelectOptions, editarAnchorEl, openDialogParcelas, formaPagamento, entrada, tabValue, values, gerarCobranca, isSubmitting, parcelaOptions,
    } = this.state;

    const openSelectOptions = Boolean(editarAnchorEl);
    const condicoesPagamentoFilter = condicoesPagamento.filter(condicao => condicao.formaPagamento === formaPagamentoOptions[activeTab]);

    return (
      <Drawer
        classes={{ paper: classes.drawer }}
        anchor="bottom"
        open={open}
        onClose={handleClose}
      >
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
        <Grid container item sm={12} md={12} lg={12} alignItems="center" justify="center">
          <Grid item sm={12} md={12} lg={12} style={{ margin: 50 }}>
            <Paper className={classNames(classes.paper, classes.paperHorarios)} elevation={5}>
              <Grid container item sm={12} md={12} lg={12} justify="flex-end">
                <IconButton>
                  <CloseIcon color="inherit" onClick={handleClose} />
                </IconButton>
              </Grid>

              <Grid container item sm={12} md={12} lg={12} style={{ margin: 5 }} justify="center">
                <FormControlLabel
                  control={(
                    <Switch
                      name="gerarCobranca"
                      onChange={() => this.setState({ gerarCobranca: !gerarCobranca })}
                      color="secondary"
                      value={gerarCobranca}
                      checked={gerarCobranca}
                    />
                    )}
                  label={gerarCobranca ? (
                    <>
                      {`GERAR ${entrada ? 'COBRANÇA' : 'FATURA?'}?`}
                      <strong> SIM</strong>
                    </>
                  ) : (
                    <>
                      {`GERAR ${entrada ? 'COBRANÇA' : 'FATURA'}?`}
                      <strong> NÃO</strong>
                    </>
                  )}
                />
                <FormControlLabel
                  control={(
                    <Switch
                      name="entrada"
                      onChange={() => this.setState({ entrada: !entrada })}
                      color="secondary"
                      value={entrada}
                      checked={entrada}
                    />
                    )}
                  label={entrada ? (<><strong>ENTRADA</strong></>) : (<><strong>SAÍDA</strong></>)}
                />
              </Grid>

              <Grid item sm={12} md={6} lg={12}>
                <AppBar position="relative" className={classes.appbar}>
                  <Tabs
                    className={classes.tabs}
                    value={tabValue}
                    onChange={this.handleTabChange}
                  >
                    <Tab label={labelFormaPagamentoOptions.DINHEIRO} icon={<AttachMoneyIcon />} id="tab-dinheiro" />
                    <Tab label={labelFormaPagamentoOptions.CARTAO_CREDITO} icon={<CreditCardIcon />} id="tab-credito" />
                    <Tab label={labelFormaPagamentoOptions.CARTAO_DEBITO} icon={<CreditCardIcon />} id="tab-debito" />
                    <Tab label={labelFormaPagamentoOptions.CHEQUE} icon={<NoteIcon />} id="tab-cheque" />
                  </Tabs>
                </AppBar>
              </Grid>

              <TabPanel value={tabValue} className={classes.tabPanel} index={0}>
                <Grid container spacing={2} direction="row" sm={12} md={12} lg={12}>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <TextField
                      className={classes.textfield}
                      name="descricao"
                      id="descricao"
                      label="Descrição"
                      value={values.descricao}
                      onChange={this.handleChange('descricao')}
                      variant="outlined"
                      type="text"
                      multiline
                      fullWidth
                      rows="1"
                      margin="normal"
                    />
                  </Grid>

                  <Grid item sm={12} md={12} lg={12}>
                    <TextField
                      name="valorPago"
                      id="valorPago"
                      label="Valor Recebido"
                      value={values.valor}
                      onChange={this.handleChange('valor')}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        inputComponent: InputFormatDinheiro,
                      }}
                    />
                  </Grid>

                  <Grid item sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      onClick={() => this.handleSubmit(formaPagamentoOptions.DINHEIRO)}
                      variant="contained"
                      size="medium"
                      color="secondary"
                      type="submit"
                      disabled={isSubmitting || !values.descricao || !values.valor}
                    >
                      {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} className={classes.tabPanel} style={{ paddingTop: condicaoActive && '2vw' }} index={1}>
                {!isEmpty(formaPagamento) ? (
                  <Grid container spacing={2} direction="row" sm={12} md={12} lg={12}>
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
                      <TextField
                        className={classes.textfield}
                        name="descricao"
                        id="descricao"
                        label="Descrição"
                        value={values.descricao}
                        onChange={this.handleChange('descricao')}
                        variant="outlined"
                        type="text"
                        multiline
                        fullWidth
                        rows="1"
                        margin="normal"
                      />
                    </Grid>

                    <Grid item sm={12} md={12} lg={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Valor a Pagar*"
                        value={values.valor}
                        onChange={this.handleChange('valor')}
                        InputProps={{
                          inputComponent: InputFormatDinheiro,
                        }}
                      />
                    </Grid>

                    <Grid item container justify="center" alignItems="center" sm={12} md={12} lg={6}>
                      <Button
                        fullWidth
                        disabled={!values.valor}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClickParcelaMenu}
                        color="primary"
                        variant="contained"
                      >
                        {values.parcelaOption ? `Parcelando em ${values.parcelaOption}x` : 'Selecionar Parcela'}
                      </Button>
                    </Grid>

                    <Grid item sm={12} md={12} lg={6}>
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
                        onClick={() => this.handleSubmit(formaPagamentoOptions.CRÉDITO)}
                        variant="contained"
                        size="medium"
                        color="secondary"
                        type="submit"
                        disabled={isSubmitting || !values.parcelaOption || !values.descricao || !values.valor}
                      >
                        {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  this.renderFormaPagamentoIndisponivel(formaPagamentoOptions.CRÉDITO)
                )}
              </TabPanel>

              <TabPanel value={tabValue} className={classes.tabPanel} index={2}>
                <Grid container spacing={2} direction="row" sm={12} md={12} lg={12}>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <TextField
                      className={classes.textfield}
                      name="descricao"
                      id="descricao"
                      label="Descrição"
                      value={values.descricao}
                      onChange={this.handleChange('descricao')}
                      variant="outlined"
                      type="text"
                      multiline
                      fullWidth
                      rows="1"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item sm={12} md={12} lg={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Insira o valor desejado"
                      value={values.valor}
                      onChange={this.handleChange('valor')}
                      InputProps={{
                        inputComponent: InputFormatDinheiro,
                      }}
                    />
                  </Grid>
                  <Grid item sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      onClick={() => this.handleSubmit(formaPagamentoOptions.DÉBITO)}
                      variant="contained"
                      size="medium"
                      color="secondary"
                      type="submit"
                      disabled={isSubmitting || !values.valor || !values.descricao}
                    >
                      {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Adicionar'}
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} className={classes.tabPanel} style={{ paddingTop: condicaoActive && '2vw' }} index={3}>
                {!isEmpty(formaPagamento) ? (
                  <Grid container spacing={2} direction="row" sm={12} md={12} lg={12}>
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
                      <TextField
                        className={classes.textfield}
                        name="descricao"
                        id="descricao"
                        label="Descrição"
                        value={values.descricao}
                        onChange={this.handleChange('descricao')}
                        variant="outlined"
                        type="text"
                        multiline
                        fullWidth
                        rows="1"
                        margin="normal"
                      />
                    </Grid>
                    <Grid item sm={12} md={12} lg={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Insira o valor desejado"
                        value={values.valor}
                        onChange={this.handleChange('valor')}
                        InputProps={{
                          inputComponent: InputFormatDinheiro,
                        }}
                      />
                    </Grid>

                    <Grid item container justify="center" alignItems="center" sm={12} md={12} lg={6}>
                      <Button
                        fullWidth
                        disabled={!values.valor}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClickParcelaMenu}
                        color="primary"
                        variant="contained"
                      >
                        {values.parcelaOption ? `Parcelando em ${values.parcelaOption}x` : 'Selecionar Parcela'}
                      </Button>
                    </Grid>

                    <Grid sm={12} md={12} lg={6}>
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
                        onClick={() => this.handleSubmit(formaPagamentoOptions.CHEQUE)}
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
              </TabPanel>
            </Paper>
          </Grid>
          {!!parcelaSelectOptions && (
            <Menu
              id={`menu-${parcelaSelectOptions}`}
              anchorEl={editarAnchorEl}
              open={openSelectOptions}
              onClose={this.handleCloseParcelaMenu}
              PaperProps={{
                style: {
                  maxHeight: 150,
                  width: '40%',
                  marginLeft: '2.5%',
                },
              }}
            >
              {parcelaOptions.qtdParcelasDisponiveis.map(parcela => (
                <MenuItem style={{ justifyContent: 'center' }} selected={parcela.id === values.parcelaOption} key={`parcela-${parcela.id}`} button onClick={this.handleSelectParcelaMenu(parcela.id)}>{parcela.value > 9 ? parcela.value : `0${parcela.value}`}</MenuItem>
              ))}
            </Menu>
          )}
        </Grid>
      </Drawer>
    );
  }
}

const mapStateToProps = (state) => {
  const unidadeAtual = state.user.unidades.find(unid => unid.current);

  return {
    unidade: unidadeAtual.unidade || {},
  };
};

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Material),
)(LancamentoManual);
