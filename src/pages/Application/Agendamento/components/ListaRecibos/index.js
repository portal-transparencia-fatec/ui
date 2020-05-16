/* eslint-disable no-restricted-globals */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-no-duplicate-props */
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Iframe from 'react-iframe';
import withStyles from '@material-ui/core/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Slide from '@material-ui/core/Slide';
import PrintIcon from '@material-ui/icons/Print';
import EmailIcon from '@material-ui/icons/Email';
import IconButton from '@material-ui/core/IconButton';
import { isEmpty, orderBy } from 'lodash';
import printJS from 'print-js';
import SearchIcon from '@material-ui/icons/Search';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import {
  emailValidator,
} from '../../../../../libs/utils';
import 'react-vertical-timeline-component/style.min.css';
import NotificationActions from '../../../../../store/ducks/notifier';
import FinanceiroService from '../../../../../services/Financeiro';
import GenericFileService from '../../../../../services/GenericFile';
import Material from './styles';

const bucketFileS3 = process.env.REACT_APP_V2_S3_FILES;
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);


class ListaRecibos extends Component {
  state = {
    loading: false,
    recibos: [],
    modalRecibo: false,
    modalSendEmail: false,
    email: '',
    searchRecibos: '',
  }

  componentDidMount() {
    this.fetchRecibos();
  }

  componentDidUpdate = (prevProps, prevState) => {
    const { dataRecibo, openTabRecibos, unidade } = this.props;
    if ((openTabRecibos && dataRecibo !== prevProps.dataRecibo) || (unidade !== prevProps.unidade)) {
      this.fetchRecibos();
    }
  }


  fetchRecibos = async () => {
    const { unidade, dataRecibo } = this.props;
    const dataSelecionada = moment(dataRecibo, 'YYYY-MM-DD');

    try {
      this.setState({ loading: true });
      let data = await GenericFileService.listFiles({
        bucketFileS3,
        key: dataSelecionada.isValid() ? `recibos/${unidade.id}/${dataSelecionada.format('YYYY-MM-DD')}` : `recibos/${unidade.id}`,
      });

      const recibos = data.map(({ key, lastModified }) => {
        const path = key.split('/');
        path.pop();
        return ({
          key: path.join('/'),
          date: lastModified.substr(0, 19),
          horario: key.split('/')[3].split('-')[1].substr(0, 8),
          filename: key.split('/')[3],
        });
      });

      this.setState({
        recibos: orderBy(recibos, function(o) { return new moment(o.date); }, ['desc']),
      });
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleChangeSearch = async (event) => {
    await this.setState(({ searchRecibos: event.target.value }));
  }

  filterRecibos = (recibo) => {
    const { searchRecibos } = this.state;

    if (!String(searchRecibos).trim()) return true;

    if (new RegExp(searchRecibos, 'ig').test(recibo.filename.split('-')[0])) {
      return true;
    }

    if (new RegExp(searchRecibos, 'ig').test(recibo.horario)) {
      return true;
    }

    return false;
  }

  fetchRecibo = async ({ key, filename }, type = 'blobUrl') => {
    const { notify } = this.props;
    try {
      this.setState({ loading: true });
      let blob = await GenericFileService.downloadFile({
        bucketFileS3,
        filename,
        key,
      });
      blob = new Blob([blob], { type: 'application/pdf' });
      await this.setState({ recibo: type === 'blobUrl' ? window.URL.createObjectURL(blob) : blob });
    } catch (err) {
      console.log(err);
      notify('Ocorreu um erro ao buscar o recibo', { variant: 'error' });
    } finally {
      this.setState({ loading: false });
    }
  }

  sendPDF = async (file, destinatarios) => {
    const { unidade, notify } = this.props;
    try {
      notify('Enviando recibo, aguarde...', { variant: 'warning' });
      this.setState({ loading: true });
      await FinanceiroService.enviarRecibo({
        destinatarios,
        empresa: unidade.id,
        file,
      });
      notify('Recibo enviado com sucesso!', { variant: 'success' });
    } catch (err) {
      if (err && err.response.message) {
        notify(err.response.message, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar realizar o envio do recibo.', { variant: 'error' });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { classes, openTabRecibos, containerHeight } = this.props;
    const {
      recibos, searchRecibos, modalRecibo, modalSendEmail, email, recibo, loading,
    } = this.state;
    return (
      <Fragment>
        {<LoadingIndicator loading={loading} />}
        <Dialog
          maxWidth="90vw"
          maxHeight="95vw"
          open={modalRecibo}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => this.setState({ modalRecibo: false })}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title" />
          <DialogContent>
            <DialogContentText style={{ minHeight: '90vh', minWidth: '95vw' }}>
              {!!recibo && (
                <Iframe
                  url={recibo}
                  width="100%"
                  height={containerHeight}
                />
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ modalRecibo: false })}
              color="default"
            >
              FECHAR
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          maxWidth="50vw"
          open={modalSendEmail}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => this.setState({ modalSendEmail: false, email: '' })}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="form-dialog-title">ENVIAR RECIBO POR-EMAIL</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ minWidth: '50vw' }}>
              Nós estaremos enviando o recibo em alguns instantes.
            </DialogContentText>
            <TextField
              autoFocus
              value={email}
              onChange={({ target: { value: email } }) => {
                this.setState({ email });
              }}
              margin="dense"
              id="email"
              label="E-mail"
              type="email"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              disabled={!(emailValidator(email))}
              onClick={async () => {
                const file = new FormData();
                await file.append('file', recibo, 'recibo.pdf');
                this.sendPDF(file, email);
                this.setState({ modalSendEmail: false });
              }}
              color="primary"
            >
              Enviar
            </Button>
            <Button onClick={() => this.setState({ modalSendEmail: false, email: '' })} color="secondary">
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
        {!!openTabRecibos && (
          <Grid
            container
            style={{
              margin: '2px',
              justifyContent: 'center',
              alignItems: 'stretch',
              alignSelf: 'center',
            }}
          >
            <Grid item sm={12} md={12} lg={12}>
              {!isEmpty(recibos) ? (
                <Grid item sm={12} md={12} lg={12}>
                  <Grid item sm={12} md={12} lg={12}>
                    <TextField
                      label="Procurar..."
                      value={searchRecibos}
                      onChange={this.handleChangeSearch}
                      margin="normal"
                      type="search"
                      fullWidth
                    />
                  </Grid>
                  <Grid item sm={12} md={12} lg={12}>
                    <Table className={classes.table}>
                      <TableHead>
                        <TableRow style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                          <TableCell align="left" colSpan={1} className={classes.tableCellHorario}>HORÁRIO</TableCell>
                          <TableCell align="left" colSpan={1}>PACIENTE</TableCell>
                          <TableCell align="center" colSpan={1} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recibos.filter(this.filterRecibos).map(recibo => (
                          <Tooltip
                            title="Clique duas vezess para visualizar o recibo"
                            placement="center"
                          >
                            <TableRow
                              hover
                              className={classes.tableRow}
                              onDoubleClick={async () => {
                                await this.fetchRecibo(recibo);
                                this.setState({ modalRecibo: true });
                              }}
                            >
                              <TableCell align="left" colSpan={1} className={classes.tableCellHorario}>{recibo.horario}</TableCell>
                              <TableCell align="left" colSpan={1}>{recibo.filename.split('-')[0]}</TableCell>
                              <TableCell align="right" colSpan={1}>
                                <Grid container direction="row" alignItems="center" justify="flex-end">
                                  <IconButton
                                    onClick={async () => {
                                      await this.fetchRecibo(recibo);
                                      this.setState({ modalRecibo: true });
                                    }}
                                  >
                                    <SearchIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={async () => {
                                      await this.fetchRecibo(recibo);
                                      printJS(this.state.recibo);
                                    }}
                                  >
                                    <PrintIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={async () => {
                                      await this.fetchRecibo(recibo, 'blob');
                                      this.setState({ modalSendEmail: true });
                                    }}
                                  >
                                    <EmailIcon />
                                  </IconButton>
                                </Grid>
                              </TableCell>
                            </TableRow>

                          </Tooltip>
                        ))}
                        {!recibos.filter(this.filterRecibos).length && (
                        <TableRow hover style={{ height: '80vh' }}>
                          <TableCell align="center" colSpan={3}>
                            <Typography type="body2" style={{ color: '#999', padding: '16px 0', textAlign: 'center' }}>
                              Nenhum resultado encontrado...
                            </Typography>
                          </TableCell>
                        </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              ) : (
                <Grid container sm={12} md={12} lg={12} direction="row" className={classes.paper} style={{ backgroundColor: '#e1e1e1', minHeight: '89vh' }}>
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
                      {loading ? 'CARREGANDO...' : 'NENHUM RESULTADO ENCONTRADO'}
                    </Typography>
                  </Grid>
                </Grid>
              )}
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
)(ListaRecibos);
