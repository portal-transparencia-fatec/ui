/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable array-callback-return */
/* eslint-disable func-names */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import ToggleOffIcon from '@material-ui/icons/ToggleOff';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  formataDinheiro,
} from '../../../libs/utils';
import {
  InputFormatDinheiroNotNull,
} from '../../../components/InputFormat';
import FinanceiroService from '../../../services/Financeiro';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ListaContas from './components/ListaContas';

import NotificationActions from '../../../store/ducks/notifier';
import { Container } from '../../../styles/global';
import Material from './styles';


const InitialValues = {
  id: null,
  ativo: true,
  descricao: '',
  lancamentos: [],
  saldo: 0,
  saldoInicial: 0,
};


class Contas extends Component {
  state = {
    ativo: true,
    loading: false,
    values: InitialValues,
    contas: [],
    conta: null,
    isSubmitting: false,
    searchFilterInput: '',
    openModalContas: false,
  };

  componentDidMount() {
    const { ativo } = this.state;
    this.fetchContas(ativo);
  }

  componentDidUpdate(prevProps) {
    const { unidade } = this.props;
    const { ativo } = this.state;

    if (unidade !== prevProps.unidade) {
      this.fetchContas(ativo);
    }
  }

  fetchContas = async (ativo) => {
    const { notify, unidade } = this.props;
    try {
      const contas = (await FinanceiroService.searchContas({
        empresaUnidade: unidade.id,
        ativo,
      })).map(conta => ({ ...conta, status: conta.ativo ? 'ATIVA' : 'DESABILITADA' }));

      await this.setState({ contas });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'error' });
      } else {
        notify('Ocorreu um erro ao buscar as contas.', { variant: 'error' });
      }
    }
  }

  handleChange = name => ({ target: { value } }) => {
    const values = { ...this.state.values };
    values[name] = value;
    this.setState({ values });
  }

  handleChangeSelect = name => ({ target: { value } }) => {
    const values = { ...this.state.values };
    values[name] = !values[name];
    this.setState({ values });
  }

  handleChangeFilter = () => {
    const { ativo } = this.state;
    this.fetchContas(!ativo);
    this.setState({ ativo: !ativo });
  }

  handleToggleContaStatus = conta => async () => {
    const { notify, unidade } = this.props;
    const { ativo } = this.state;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    try {
      conta.ativo = !conta.ativo;
      await FinanceiroService.saveConta({
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
        form: {
          ...conta,
          empresaUnidade: unidade.id,
        },
      });
      this.fetchContas(ativo);
    } catch (err) {
      notify('Não foi possível alterar o status', { variant: 'error' });
    }
  }

  handleClickConta = async (event, conta) => {
    try {
      this.setState({ openModalContas: true, conta });
    } catch (error) {
      console.log(error);
    }
  }

  filterContas = (conta) => {
    const { searchFilterInput } = this.state;

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

  handleSubmit = async () => {
    const { unidade, notify } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    const {
      values: {
        id, ativo, descricao, saldoInicial,
      },
    } = this.state;
    let form;
    try {
      if (id) {
        form = {
          id,
          ativo,
          descricao,
          saldoInicial,
          empresaUnidade: unidade.id,
        };
      } else {
        form = {
          ativo,
          descricao,
          saldoInicial,
          empresaUnidade: unidade.id,
        };
      }

      await FinanceiroService.saveConta({
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
        form,
      });
      notify(`${id ? 'Conta atualizada com sucesso!' : 'Conta criada com sucesso!'}`, { variant: 'success', autoHideDuration: 5000 });
      this.fetchContas(this.state.ativo);
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi salvar a conta.', { variant: 'error', autoHideDuration: 5000 });
      }
    } finally {
      this.handleClose();
    }
  }

  handleEditAccount = (conta) => {
    this.setState({ values: conta });
    this.setState({ dialogNovaConta: true });
  }

  handleClose = () => {
    this.setState({ dialogNovaConta: false, values: InitialValues });
  }

  handleCompleteUpdate = async () => {
    const { ativo, conta: { id: idConta } } = this.state;
    const { notify } = this.props;

    try {
      await this.fetchContas(ativo);
      this.setState({ conta: this.state.contas.filter(conta => conta.id === idConta).find(Boolean) });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi atualizar a lista de contas.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }

  render() {
    const {
      classes,
    } = this.props;

    const {
      ativo,
      values,
      isSubmitting,
      openModalContas,
      contas,
      conta,
      dialogNovaConta,
      searchFilterInput,
      loading,
    } = this.state;

    return (
      <Grid container>
        <Container>
          <LoadingIndicator loading={loading} />
          <Grid container spacing={2}>
            <Dialog
              open={dialogNovaConta}
              onClose={() => this.handleClose()}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              {/* <DialogTitle align="center">

              </DialogTitle> */}
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  <Grid container item sm={12} md={12} lg={12} alignItems="center" justify="center">
                    <Grid item sm={12} md={12} lg={12}>
                      <Grid container item sm={12} md={12} lg={12} justify="flex-end">
                        <IconButton>
                          <CloseIcon color="inherit" onClick={() => this.handleClose()} />
                        </IconButton>
                      </Grid>
                      <Grid item sm={12} md={12} lg={12}>
                        <Typography
                          style={{
                            fontWeight: 900, fontSize: '1em', padding: 10, color: '#484848',
                          }}
                          align="center"
                          justify="center"
                        >
                          { values.id
                            ? 'EDITAR CONTA'
                            : 'NOVA CONTA'
                          }
                        </Typography>
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <Typography color="textSecondary">

                          { values.id
                            ? 'Modifique o formulário abaixo para editar uma conta.'
                            : 'Preencha o formulário abaixo para salvar uma nova conta.'
                          }
                        </Typography>
                      </Grid>

                      <Grid container spacing={2} direction="row" sm={12} md={12} lg={12}>
                        <Grid item xs={12} sm={12} md={12} lg={6}>
                          <TextField
                            name="descricao"
                            id="descricao"
                            label="DESCRIÇÃO"
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
                        <Grid item sm={12} md={12} lg={6} style={{ marginTop: 15 }}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="SALDO INICIAL"
                            value={values.saldoInicial}
                            onChange={this.handleChange('saldoInicial')}
                            InputProps={{
                              inputComponent: InputFormatDinheiroNotNull,
                            }}
                          />
                        </Grid>

                        {values.id && (
                        <Grid item sm={12} md={12} lg={12}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="SALDO"
                            value={values.saldo}
                            inputProps={{
                              style: {
                                fontSize: '1.2em', textAlign: 'center',
                              },
                              readOnly: true,
                            }}
                            InputProps={{
                              inputComponent: InputFormatDinheiroNotNull,
                            }}
                          />
                        </Grid>
                        )}

                        <Grid container item sm={12} md={12} lg={12} style={{ margin: 5 }} justify="center">
                          <FormControlLabel
                            control={(
                              <Switch
                                name="ativo"
                                onChange={this.handleChangeSelect('ativo')}
                                color="secondary"
                                value={values.ativo}
                                checked={values.ativo}
                              />
                            )}
                            label={values.ativo ? (
                              <>
                            CONTA ATIVA?
                                <strong> SIM</strong>
                              </>
                            ) : (
                              <>
                            CONTA ATIVA?
                                <strong> NÃO</strong>
                              </>
                            )}
                          />
                        </Grid>

                        <Grid item sm={12} md={12} lg={12}>
                          <Button
                            fullWidth
                            onClick={() => this.handleSubmit()}
                            variant="contained"
                            size="medium"
                            color="secondary"
                            type="submit"
                            disabled={isSubmitting || !values.descricao}
                          >
                            {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Salvar'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </DialogContentText>
              </DialogContent>
            </Dialog>

            <Grid item sm={12} md={6} lg={4}>
              <Paper
                className={classNames(classes.paper, classes.paperAside)}
                elevation={5}
              >
                <div className={classes.headerAside} />
                <Typography
                  className={classes.textInfoAside}
                  component="p"
                  variant="h5"
                  align="center"
                >
                    CONTAS
                </Typography>

                <Grid style={{ minHeight: 100 }} item sm={12} md={3} lg={12}>
                  <Button
                    fullWidth
                    onClick={() => this.setState({ dialogNovaConta: true })}
                    variant="contained"
                    size="medium"
                    color="secondary"
                    type="submit"
                    autofocus
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Nova conta'}
                  </Button>
                </Grid>

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
                {contas.length ? (
                  <Grid item sm={12} md={12} lg={12}>
                    <Table className={classes.table}>
                      <TableHead>
                        <TableRow>
                          <TableCell align="left" colSpan={5} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contas.filter(this.filterContas).map((conta, index) => (
                          <Fragment>
                            <Tooltip
                              title="Clique para selecionar / Clique duas vezes para editar"
                              placement="top"
                              enterDelay={600}
                              leaveDelay={100}
                            >
                              <TableRow
                                className={classes.tableRow}
                                hover
                                colSpan={5}
                                onDoubleClick={() => this.handleEditAccount(conta, index)}
                                onClick={event => this.handleClickConta(event, conta)}
                                style={{ backgroundColor: conta === this.state.conta ? 'rgba(0, 0, 0, 0.07)' : null }}
                              >
                                <TableCell align="left" className={classes.tableCell} colSpan={2}>{String(conta.descricao).toUpperCase()}</TableCell>
                                <TableCell align="right" className={classes.tableCell} colSpan={1} className={classNames({ [classes.inactive]: !conta.ativo })}>
                                  <Chip
                                    style={{ width: 100 }}
                                    deleteIcon={<ToggleOffIcon />}
                                    label={conta.ativo ? 'ATIVA' : 'DESABILITADA'}
                                    color={conta.ativo ? 'primary' : 'secondary'}
                                    onClick={this.handleToggleContaStatus(conta, index)}
                                    clickable
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center" colSpan={2} className={[classes.tableCell, conta.saldo >= 0 ? classes.cellSaldoPositivo : classes.cellSaldoNegativo]}>{formataDinheiro(conta.saldo)}</TableCell>
                              </TableRow>
                            </Tooltip>
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                ) : (
                  <Typography
                    className={classes.labelUndefined}
                    component="p"
                    variant="body1"
                    align="center"
                  >
                    Nenhum resultado encontrado...
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item sm={12} md={6} lg={8}>
              <Paper className={classNames(classes.paper, classes.paperHorarios)} elevation={5}>
                <ListaContas
                  conta={conta}
                  contas={contas}
                  openModalContas={openModalContas}
                  onCompleteUpdate={this.handleCompleteUpdate}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
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
)(Contas);
