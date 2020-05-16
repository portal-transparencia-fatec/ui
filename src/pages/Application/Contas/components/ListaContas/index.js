/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-no-duplicate-props */
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { compose } from 'redux';
import { connect } from 'react-redux';

import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import {
  mdiBankTransferIn,
  mdiCached,
  mdiVectorSelection,
} from '@mdi/js';

import {
  formataDinheiro,
} from '../../../../../libs/utils';
import 'react-vertical-timeline-component/style.min.css';
import NotificationActions from '../../../../../store/ducks/notifier';
import Material from './styles';
import '../../../../../assets/css/Dropzone.css';
import LabelClin from '../../../../../components/LabelClin';
import ModalSelect from '../../../../../components/ModalSelect';
import FinanceiroService from '../../../../../services/Financeiro';

class ListaContas extends Component {
  state = {
    contas: [],
    ativo: true,
    contaSelecionada: '',
    open: false,
    lancamentosSelecionados: [],
    searchFilterInput: '',
  }

  componentDidUpdate(prevProps, prevState) {
    const { contaSelecionada, ativo } = this.state;
    const { conta } = this.props;

    if (contaSelecionada && prevState.contaSelecionada !== contaSelecionada) {
      this.handleSubmitTransferencia();
    }

    if (conta !== prevProps.conta) {
      this.handleClearLancamentosConta();
      this.fetchContas(ativo);
    }
  }

  handleSubmitTransferencia = async () => {
    const {
      contaSelecionada: idConta,
      lancamentosSelecionados: lancamentos,
      contas,
      ativo,
    } = this.state;
    const { unidade, notify, onCompleteUpdate } = this.props;

    const conta = contas.filter(conta => conta.id === idConta).find(Boolean);
    try {
      await FinanceiroService.saveTransferirLancamento({
        lancamentos,
        idConta,
        empresaUnidade: unidade.id,
      });

      await Promise.all([
        onCompleteUpdate(),
        this.fetchContas(ativo),
      ]);

      this.setState({ lancamentosSelecionados: [], contaSelecionada: '' });
      notify((lancamentos.length > 1 ? `${lancamentos.length} lançamentos transferidos para ${conta.descricao}` : `${lancamentos.length} lançamento transferido para ${conta.descricao}`), { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Houve um problema ao transferir os lançamentos', { variant: 'error' });
      }
    }
  }

  handleTransferLancamentos = () => {
    const { lancamentosSelecionados } = this.state;
    if (!isEmpty(lancamentosSelecionados)) {
      this.setState({ open: true });
    }
  }

  onSelectConta = (conta, optionSelect) => {
    optionSelect({ id: conta.id });
  }

  filterContas = (conta) => {
    const { searchFilterInput } = this.state;
    const { conta: contaSelecionada } = this.props;

    if (contaSelecionada.id === conta.id) {
      return false;
    }

    if (!String(searchFilterInput).trim()) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(conta.descricao)) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(conta.saldo)) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(conta.status)) {
      return true;
    }

    return false;
  }

  sanitizationLancamento = async (lancamentoId) => {
    let { lancamentosSelecionados } = this.state;

    if (lancamentosSelecionados.includes(lancamentoId)) {
      lancamentosSelecionados = lancamentosSelecionados.filter(lancamento => lancamento !== lancamentoId);
    } else {
      lancamentosSelecionados.push(lancamentoId);
    }
    this.setState({ lancamentosSelecionados });
  }

  handleChangeFilter = () => {
    const { ativo } = this.state;
    this.fetchContas(!ativo);
    this.setState({ ativo: !ativo });
  }

  fetchContas = async (ativo) => {
    const { notify, unidade } = this.props;
    try {
      const contas = (await FinanceiroService.searchContas({
        empresaUnidade: unidade.id,
        ativo,
      })).map(conta => ({ ...conta, status: conta.ativo ? 'ATIVA' : 'DESABILITADA' }));

      this.setState({ contas });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'error' });
      } else {
        notify('Ocorreu um erro ao buscar as contas.', { variant: 'error' });
      }
    }
  }

  handleSelectAll = async () => {
    const { conta: { lancamentos } } = this.props;
    const { lancamentosSelecionados } = this.state;
    this.setState({ lancamentosSelecionados: [...lancamentosSelecionados, ...lancamentos.map(({ id }) => id).filter(id => !lancamentosSelecionados.includes(id))] });
  }

  handleClearLancamentosConta = () => {
    this.setState({ lancamentosSelecionados: [] });
  }


  renderLancamentos = () => {
    const {
      conta: { lancamentos },
      classes,
    } = this.props;
    const { lancamentosSelecionados } = this.state;

    return lancamentos.map(lancamento => (
      <div
        style={{ margin: 5 }}
      >
        <VerticalTimelineElement
          contentStyle={
            lancamentosSelecionados.includes(lancamento.id)
              ? { backgroundColor: '#e1ecf4', color: '#0077cc', cursor: 'pointer' }
              : { cursor: 'pointer' }
          }
          className="vertical-timeline-element--work"
          position={(!lancamento.entrada ? 'right' : 'left')}
          date={<strong className={classes.tableCell} style={{ color: '#666', margin: 10 }}>{moment(lancamento.data).format('DD/MM/YYYY [às] HH[h]mm')}</strong>}
          iconStyle={
            lancamentosSelecionados.includes(lancamento.id)
              ? { color: '#0077cc', backgroundColor: '#e1ecf4', cursor: 'pointer' }
              : (lancamento.entrada ? { color: '#61bd4f', backgroundColor: '#C6D880', cursor: 'pointer' } : { color: '#FBC2C4', backgroundColor: '#eb2f37' })
            }
          icon={<AttachMoneyIcon />}
          iconOnClick={() => this.sanitizationLancamento(lancamento.id)}
        >
          <h4
            className="vertical-timeline-element-title"
            style={{
              justifyContent: 'center',
              alignItems: 'stretch',
              alignSelf: 'center',
            }}
            onClick={() => this.sanitizationLancamento(lancamento.id)}
          >
            <center style={{ float: 'center' }}>{`${(lancamento.descricao).toUpperCase()}`}</center>
            <center><strong style={(lancamento.entrada ? { color: '#61bd4f' } : { color: '#ff0000' })}>{formataDinheiro(lancamento.valor)}</strong></center>
          </h4>
        </VerticalTimelineElement>
      </div>
    ));
  }

  render() {
    const {
      classes,
      conta,
      openModalContas,
    } = this.props;

    const {
      contas, lancamentosSelecionados, ativo, open, contaSelecionada, searchFilterInput,
    } = this.state;
    return (
      <Fragment>
        {openModalContas === true && conta && (
        <Grid
          container
          style={{
            margin: '4px',
            justifyContent: 'center',
            alignItems: 'stretch',
            alignSelf: 'center',
          }}
        >

          <Grid item sm={12} md={12} lg={12}>
            <Grid container spacing={2} direction="row" sm={12} md={12} lg={12} className={classes.paper}>
              {!isEmpty(conta.lancamentos) ? (
                <Fragment>
                  {!isEmpty(lancamentosSelecionados)
                    ? (
                      <Grid item sm={12} md={12} lg={12}>
                        <Grid item sm={12} md={12} lg={12} className={classes.paper} style={{ backgroundColor: 'transparent', minHeight: 100, maxHeight: 180 }}>
                          <Grid item sm={12} md={12} lg={12} style={{ margin: 8 }}>
                            <LabelClin
                              text="CANCELAR"
                              icon={mdiCached}
                              iconSize="20px"
                              bgColor="#eb2f37"
                              textColor="#fff"
                              onClick={this.handleClearLancamentosConta}
                            />
                          </Grid>

                          <Grid item sm={12} md={12} lg={12} style={{ margin: 8 }}>
                            <LabelClin
                              text="SELECIONAR TODOS"
                              icon={mdiVectorSelection}
                              iconSize="20px"
                              bgColor="#eb2f37"
                              textColor="#fff"
                              onClick={this.handleSelectAll}
                            />
                          </Grid>
                          <Grid item sm={12} md={12} lg={12} style={{ margin: 8 }}>
                            <LabelClin
                              text="TRANSFERIR LANÇAMENTO(S)"
                              icon={mdiBankTransferIn}
                              iconSize="20px"
                              bgColor="#eb2f37"
                              textColor="#fff"
                              onClick={() => this.handleTransferLancamentos()}
                            />
                          </Grid>

                          <Grid item sm={12} md={12} lg={12} style={{ display: 'none', zIndex: 2 }}>
                            <ModalSelect
                              open={open}
                              inputFilterDisabled
                              onClose={() => this.setState({ open: false })}
                              label="Contas"
                              empty="Lista de contas vazia..."
                              value={contaSelecionada}
                              options={contas.filter(this.filterContas).map(values => ({
                                id: values.id,
                                label: values.descricao,
                              }))}
                              onChange={contaSelecionada => this.setState({ contaSelecionada })}
                              textfieldProps={{
                                fullWidth: true,
                              }}
                            >
                              {(options, value, filter, onSelect) => (
                                <Fragment>
                                  <Grid container direction="row" item sm={12} md={12} lg={12}>
                                    <Grid item sm={12} md={12} lg={8}>
                                      <TextField
                                        placeholder="Procurar..."
                                        type="search"
                                        margin="normal"
                                        fullWidth
                                        value={searchFilterInput}
                                        onChange={event => this.setState({ searchFilterInput: event.target.value })}
                                      />
                                    </Grid>
                                    <Grid item sm={12} md={12} lg={2} />
                                    <Grid container item sm={4} md={4} lg={2} justify="center" alignItems="center">
                                      <FormGroup row>
                                        <FormControlLabel
                                          control={(
                                            <Switch
                                              checked={ativo}
                                              name="ativo"
                                              onChange={this.handleChangeFilter}
                                              color="primary"
                                              value="bool"
                                            />
                                        )}
                                          label={ativo ? 'Ativo' : 'Inativo'}
                                        />
                                      </FormGroup>
                                    </Grid>
                                  </Grid>
                                  <List dense style={{ width: '100%' }}>
                                    {contas.filter(this.filterContas).map((values, index) => (
                                      <Fragment>
                                        <ListItem
                                          key={values.id}
                                          role={undefined}
                                          dense
                                          button
                                          style={{ width: '100%' }}
                                          onClick={() => this.onSelectConta(values, onSelect)}
                                        >
                                          <ListItemText
                                            disableTypography
                                            primary={<Typography type="body2" style={{ fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>{values.descricao}</Typography>}
                                            secondary={<Typography type="body2" className={values.saldo >= 0 ? classes.cellSaldoPositivo : classes.cellSaldoNegativo} style={{ textAlign: 'center' }}>{formataDinheiro(values.saldo)}</Typography>}
                                          />
                                        </ListItem>
                                      </Fragment>
                                    ))}
                                    {!contas.filter(this.filterContas).length && (
                                    <Fragment>
                                      <ListItemText
                                        disableTypography
                                        primary={<Typography type="body2" style={{ color: '#999', padding: '16px 0', textAlign: 'center' }}>Nenhum resultado encontrado...</Typography>}
                                      />
                                    </Fragment>
                                    )}

                                  </List>
                                </Fragment>
                              )}
                            </ModalSelect>
                          </Grid>
                        </Grid>
                      </Grid>
                    )
                    : (
                      <Typography
                        className={classes.label}
                        component="p"
                        variant="body1"
                        align="center"
                      >
                        Clique sobre o(s) lançamento(s) para visualizar as opções disponíveis
                      </Typography>
                    )}

                  <Grid item sm={12} md={12} lg={12} className={classes.paper} style={{ backgroundColor: '#e1e1e1', marginTop: !isEmpty(lancamentosSelecionados) && '4vw' }}>
                    <VerticalTimeline>
                      {this.renderLancamentos()}
                    </VerticalTimeline>
                  </Grid>
                </Fragment>
              ) : (
                <Grid container sm={12} md={12} lg={12} direction="row" className={classes.paper} style={{ backgroundColor: '#e1e1e1', minHeight: '87vh' }}>
                  <Grid
                    item
                    sm={12}
                    md={12}
                    lg={12}
                    style={{
                      margin: 5,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      fullWidth
                      component="h2"
                      variant="body1"
                      align="center"
                      style={{
                        color: '#0662a1',
                        fontWeight: 900,
                      }}
                    >
                      NENHUM LANÇAMENTO FOI REALIZADO NESTA CONTA.
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        )}
      </Fragment>
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
)(ListaContas);
