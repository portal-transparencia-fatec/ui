/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import ModalSelect from '../../../../../../components/ModalSelect';
import NotificationActions from '../../../../../../store/ducks/notifier';
import Material, { Divider } from './styles';
import {
  InputFormatDinheiro,
} from '../../../../../../components/InputFormat';
import {
  formataDinheiro,
} from '../../../../../../libs/utils';
import FinanceiroService from '../../../../../../services/Financeiro';

class TransferirSaldo extends Component {
  state = {
    isSubmitting: false,
    value: '',
    usuario: '',
    displayLabel: '',
    selectedIndex: null,
  }

  componentDidUpdate= async (prevProps, prevState) => {
    const { usuario } = this.state;
    const { usuarios } = this.props;
    if (usuario && usuario !== prevState.usuario) {
      const { nome } = usuarios.find(({ id }) => id === usuario);
      this.setState({ displayLabel: String(nome).toLowerCase() });
    }
  }

  searchByEntidade = async (username, selectedIndex) => {
    const { usuarios } = this.props;
    if (selectedIndex !== this.state.selectedIndex) {
      const usuario = usuarios.find(({ nome }) => nome === username);
      this.setState({ usuario: usuario.id, selectedIndex });
    } else {
      this.setState({ selectedIndex: null, usuario: '' });
    }
  }

  resetForm =() => {
    this.setState({
      value: '',
      usuario: '',
      displayLabel: '',
      selectedIndex: null,
    });
  }

  handleSubmitTransferencia = async () => {
    const { usuario, value } = this.state;
    const {
      handleClose, onComplete, dataCaixaRecepcao, unidade, notify,
    } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));

    try {
      this.setState({ isSubmitting: true });
      await FinanceiroService.saveTranferencia({
        date: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
        usuarioRecebedor: usuario,
        valor: value,
      });
      onComplete();
      handleClose();
      notify('Transferência realizada com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response.data) {
        notify(err.response.data, { variant: 'error' });
      } else {
        notify('Ocorreu um erro realizar a transferência.', { variant: 'error' });
      }
    } finally {
      this.resetForm();
      this.setState({ isSubmitting: false });
    }
  }

  renderTransferenciasRecentes = () => {
    const {
      caixaRecepcao: { lancamentos },
    } = this.props;

    const { selectedIndex } = this.state;

    return lancamentos.map((lancamento, index) => {
      if (lancamento.tipoLancamento === 'TRANSFERENCIA') {
        const entidade = lancamento.entrada ? lancamento.descricao.substr(43) : lancamento.descricao.substr(38);
        return (
          <TableRow
            onClick={() => this.searchByEntidade(entidade, index)}
            style={(selectedIndex !== null && index === selectedIndex ? { backgroundColor: 'rgba(0, 0, 0, 0.18)', cursor: 'pointer' } : { cursor: 'pointer' })}
          >
            <TableCell align="left">
              <strong style={{ padding: 4 }}>
                {entidade}
                {' '}
                -
                {' '}
                {lancamento.formaPagamento}
              </strong>
              <br />
              <o style={{ padding: 4, color: '#757575' }}>
                {lancamento.entrada
                  ? 'Recebido'
                  : 'Transferido'
                }

                {' '}
                {formataDinheiro(lancamento.valor)}
                {' '}
                em
                {' '}
                {moment(lancamento.dataLancamento).format('DD/MM/YYYY [às ]HH[h]mm')}
              </o>
            </TableCell>
          </TableRow>
        );
      }
    });
  }

  render() {
    const {
      open,
      classes,
      usuarios,
      handleClose,
      caixaRecepcao: { lancamentos, saldoDinheiro },

    } = this.props;
    const {
      displayLabel, value, usuario, openModalDelete, isSubmitting,
    } = this.state;

    let transferenciasRecentes = false;

    return (
      <Drawer
        classes={{ paper: classes.drawer }}
        anchor="bottom"
        open={open}
        onClose={handleClose}
      >
        <Grid container className={classes.drawerContent}>
          <Grid container item sm={12} md={12} lg={12} justify="flex-end">
            <IconButton>
              <CloseIcon color="inherit" onClick={handleClose} />
            </IconButton>
          </Grid>
          <Grid container spacing={2} item sm={12} md={4} lg={4}>
            <Grid container item sm={12} md={12} lg={12} direction="row" wrap="nowrap" alignItems="center">
              <ModalSelect
                id="select-usuarios"
                label="CAIXA RECEPÇÃO"
                InputLabelProps={{
                  className: classes.label,
                }}
                empty="Nenhum usuário encontrado..."
                value={usuario}
                options={usuarios.map(usuario => ({
                  id: usuario.id,
                  label: usuario.nome,
                }))}
                autoCompleteAsync
                onChange={usuario => this.setState({ usuario })}
                textfieldProps={{
                  variant: 'outlined',
                  fullWidth: true,
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton>
                          <CalendarIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                inputProps={{
                  style: { color: '#666', fontWeight: 900, textAlign: 'center' },
                }}
              />
            </Grid>

            <Grid container item sm={12} md={12} lg={12} direction="row" wrap="nowrap" alignItems="center">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" style={{ backgroundColor: '#f6f7f8' }}>
                      {lancamentos.map((lancamento) => {
                        if (lancamento.tipoLancamento === 'TRANSFERENCIA') {
                          transferenciasRecentes = true;
                        }
                      })
                      }
                      {(transferenciasRecentes ? 'RECENTES' : 'NENHUMA TRANSFERÊNCIA RECENTE')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.renderTransferenciasRecentes()}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
          <Grid container item sm={12} md={8} lg={8} justify="space-evenly">
            <Divider />
            <Grid container item sm={12} md={5} lg={8} style={!usuario ? { visibility: 'hidden' } : { visibility: 'visible', maxHeight: 400 }}>
              <Grid item sm={12} md={12} lg={12} style={{ margin: 5 }}>
                <Typography
                  className={classes.textInfoAside}
                  component="p"
                  variant="h5"
                  align="center"
                >
                  <strong>Quanto </strong>
                  {'você quer enviar para'}
                  {' '}
                  <o style={{ textTransform: 'capitalize' }}>
                    {displayLabel}
                    ?
                  </o>

                </Typography>
              </Grid>

              <Grid item sm={12} md={12} lg={12} style={{ margin: 5 }}>
                <Typography
                  style={{ color: '#757575' }}
                  component="p"
                  variant="body1"
                  align="center"
                >
                    Saldo disponível:
                  <strong style={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                    {' '}
                    {formataDinheiro(saldoDinheiro)}
                  </strong>
                </Typography>
              </Grid>

              <Grid item sm={12} md={12} lg={12} style={{ margin: 5 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="VALOR*"
                  value={value}
                  onChange={({ target }) => this.setState({ value: target.value })}
                  InputProps={{
                    inputComponent: InputFormatDinheiro,
                  }}
                />
              </Grid>

              <Grid item sm={12} md={12} lg={12} style={{ margin: 5 }}>
                <Button
                  fullWidth
                  onClick={() => this.handleSubmitTransferencia()}
                  variant="contained"
                  size="medium"
                  color="secondary"
                  type="submit"
                  autofocus
                  disabled={isSubmitting || !value || value > saldoDinheiro}
                >
                  {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Enviar'}
                </Button>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
        <Dialog
          open={openModalDelete}
          onClose={() => this.setState({ openModalDelete: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Excluir agendamento?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Deseja realmente excluir este agendamento?
              &nbsp;
              <strong>Esta operação é irreversível</strong>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="default" autoFocus>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                this.setState({ openModalDelete: false });
                this.handleClickDeleteAgendamento();
              }}
              color="secondary"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
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
)(TransferirSaldo);
