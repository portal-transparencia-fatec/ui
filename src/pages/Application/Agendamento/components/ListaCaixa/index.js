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
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import withStyles from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';
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
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import NoteIcon from '@material-ui/icons/Note';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import Slide from '@material-ui/core/Slide';
import { VerticalTimelineElement } from 'react-vertical-timeline-component';
import { debounce, isEmpty } from 'lodash';
import {
  mdiCheckboxMultipleMarkedCircleOutline,
  mdiTransferUp,
  mdiGestureTap,
  mdiFile,
  mdiCached,
  mdiVectorSelection,
  mdiEmailOutline,
} from '@mdi/js';
import printJS from 'print-js';
import { PDFExport } from '@progress/kendo-react-pdf';
import TransferirSaldo from './TransferirSaldo';
import LancamentoManual from './LancamentoManual';
import {
  emailValidator,
  formataDinheiro,
} from '../../../../../libs/utils';
import {
  InputFormatDinheiro,
} from '../../../../../components/InputFormat';
import 'react-vertical-timeline-component/style.min.css';
import NotificationActions from '../../../../../store/ducks/notifier';
import FinanceiroService from '../../../../../services/Financeiro';
import UsuarioService from '../../../../../services/Usuario';
import GenericFileService from '../../../../../services/GenericFile';
import Material from './styles';
import '../../../../../assets/css/Dropzone.css';
import ModalSelect from '../../../../../components/ModalSelect';
import LabelClin from '../../../../../components/LabelClin';

const bucketFileS3 = process.env.REACT_APP_V2_S3_FILES;
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);


class ListaCaixa extends Component {
  constructor(props) {
    super(props);
    this.handleChangeSaldoInicial = debounce(this.handleChangeSaldoInicial, 500);
  }

  state = {
    email: '',
    modalSendEmail: false,
    logo: '',
    loadingPDF: false,
    lancamentosSelecionados: [],
    lancamentoSelecionado: null,
    dialogDeleteLancamento: false,
    conta: '',
    formaPagamento: {
      DINHEIRO: <AttachMoneyIcon />,
      CONVENIO: <LocalHospitalIcon />,
      CARTAO_CREDITO: <CreditCardIcon />,
      CARTAO_DEBITO: <CreditCardIcon />,
      CHEQUE: <NoteIcon />,
    },
    showMoreLancamentos: [],
    saldoInicialDinheiro: 0,
    saldoDinheiro: 0,
    drawerLancamentoManual: false,
    drawerTransferencia: false,
    contas: [],
    usuariosRecepcao: [],
    option: {
      DINHEIRO: 'DINHEIRO',
      CONVENIO: 'CONVÊNIO',
      CARTAO_CREDITO: 'CARTÃO DE CRÉDITO',
      CARTAO_DEBITO: 'CARTÃO DE DÉBITO',
      CHEQUE: 'CHEQUE',
    },
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const {
      lancamentoSelecionado,
    } = this.state;
    const {
      onOpenCaixaRecepcao,
      caixaRecepcao: {
        id, lancamentos, saldoInicialDinheiro, saldoDinheiro, contaFechamento,
      }, dataCaixaRecepcao,
    } = this.props;


    if (dataCaixaRecepcao && dataCaixaRecepcao !== prevProps.dataCaixaRecepcao) {
      this.fetchUsersRecepcao(dataCaixaRecepcao);
    }

    if (lancamentos && prevProps.lancamentos !== lancamentos) {
      if (lancamentos.length && !prevState.showMoreLancamentos.length && !this.state.showMoreLancamentos.length) {
        const showMoreLancamentos = lancamentos.map(lancamento => lancamento.id);
        if (lancamentoSelecionado === null) {
          this.setState({ showMoreLancamentos });
        }
      }
    }

    if (id !== prevProps.caixaRecepcao.id) {
      await onOpenCaixaRecepcao();
      await this.fetchLogoEmpresa();
      this.fetchContas();
      this.setState({
        lancamentosSelecionados: [], saldoInicialDinheiro, saldoDinheiro, conta: contaFechamento ? contaFechamento.id : null,
      });
    }
  }

  fetchUsersRecepcao = async (dataCaixaRecepcao) => {
    const { notify, unidade } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    try {
      const usuariosRecepcao = await UsuarioService.getAllRecepcao({
        date: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
      });
      this.setState({ usuariosRecepcao });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar finalizar o caixa.', { variant: 'error' });
      }
    }
  }

  fetchContas = async () => {
    const { notify, unidade } = this.props;
    try {
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
    }
  }

  fetchLogoEmpresa = async () => {
    const { unidade } = this.props;
    try {
      let blob = await GenericFileService.downloadFile({
        bucketFileS3,
        filename: 'file',
        key: `logos/empresa/${unidade.id}`,
      });

      blob = new Blob([blob], { type: 'image/png' });
      this.setState({ logo: window.URL.createObjectURL(blob) });
    } catch (err) {
      console.log(err);
    }
  }

  handleCaixaFinalizar = async () => {
    const {
      notify, unidade, onOpenCaixaRecepcao, onCompleteUpdate, onFetchCaixaRecepcao, dataCaixaRecepcao,
    } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    try {
      await FinanceiroService.finalizarCaixa({
        date: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
      });
      await onOpenCaixaRecepcao();
      onFetchCaixaRecepcao();
      onCompleteUpdate();
      notify('Caixa finalizado com sucesso.', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar finalizar o caixa.', { variant: 'error' });
      }
    }
  }

  handleChangeSaldoInicial = async (saldo) => {
    const {
      notify, unidade, dataCaixaRecepcao, onCompleteUpdate, caixaRecepcao: { saldoInicialDinheiro },
    } = this.props;
    try {
      await this.setState({ saldoInicialDinheiro: saldo || 0 });
      if (saldoInicialDinheiro !== this.state.saldoInicialDinheiro) {
        await FinanceiroService.atualizarCaixaRecepcao({
          form: {
            data: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
            empresaUnidade: unidade.id,
            saldoInicialDinheiro: this.state.saldoInicialDinheiro,
          },
        });
        onCompleteUpdate();
      }
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar realizar o fechamento', { variant: 'error' });
      }
    }
  }

  renderDescricao = lancamento => (
    <Grid item sm={12} md={12} lg={12} alignItems="center" style={{ margin: 5 }}>
      <Typography
        fullWidth
        align="center"
        style={{ color: 'rgba(0, 0, 0, 0.87)', fontSize: '0.9em', fontWeight: 'bold' }}
      >
        {`${String(lancamento.descricao).toUpperCase()}`}
      </Typography>
    </Grid>
  )

  renderAgendamentos = (lancamento) => {
    const { classes } = this.props;
    const { showMoreLancamentos } = this.state;
    if (lancamento && showMoreLancamentos.includes(lancamento.id)) {
      return (
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell align="center" colspan={4} className={classes.tableCellHorarios}>AGENDAMENTOS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableCell} align="center">Médico</TableCell>
              <TableCell className={classes.tableCell} align="center">Evento</TableCell>
              <TableCell className={classes.tableCell} align="center">Horário</TableCell>
              <TableCell className={classes.tableCell} align="center">Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lancamento.agendas.map(({ agenda, id }) => (
              <TableRow>
                <TableCell className={classes.tableCell} align="center">{agenda.id.usuario.nome}</TableCell>
                <TableCell className={classes.tableCell} align="center">{agenda.evento.descricao}</TableCell>
                <TableCell className={classes.tableCell} align="center">{`${moment(agenda.id.data).format('DD/MM/YYYY')} às ${moment(agenda.id.hora, 'HH:mm:ss').format('HH:mm')}`}</TableCell>
                <TableCell className={classes.tableCell} align="center">{formataDinheiro(Number(agenda.evento.valorPadrao))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
  }

  renderFormaPagamento = (option) => {
    const { formaPagamento } = this.state;
    return (formaPagamento[option]);
  }

  handleHiddenAgendamentos = ({ id }) => {
    const showMoreLancamentos = [...this.state.showMoreLancamentos];
    if (showMoreLancamentos.includes(id)) {
      this.setState({ showMoreLancamentos: showMoreLancamentos.filter(lancamentoId => lancamentoId !== id) });
    }
  }

  handleShowAgendamentos = async ({ id }) => {
    const showMoreLancamentos = [...this.state.showMoreLancamentos];
    if (!showMoreLancamentos.includes(id)) {
      this.setState({ showMoreLancamentos: [...this.state.showMoreLancamentos, id] });
    }
  };

  handleDelete = (lancamentoSelecionado) => {
    this.setState({ dialogDeleteLancamento: true, lancamentoSelecionado });
  }

  maskFormaPagamento = (formaPagamento) => {
    const { option } = this.state;
    return option[formaPagamento];
  }

  maskTipoLancamento = (tipoLancamento) => {
    tipoLancamento = tipoLancamento.replace('_', ' ').toUpperCase();
    return tipoLancamento;
  }

  handleRemoveLancamento = async (lancamentoSelecionado) => {
    const { onRemoveLancamento } = this.props;
    const { lancamentosSelecionados } = this.state;
    try {
      if (lancamentosSelecionados.includes(lancamentoSelecionado.id)) {
        this.sanitizationLancamento(lancamentoSelecionado.id);
      }
      onRemoveLancamento(lancamentoSelecionado);
      this.setState({ dialogDeleteLancamento: false });
    } catch (err) {
      console.log(err);
    }
  }

  handleContaFechamento = async (contaFechamento) => {
    const {
      notify, unidade, dataCaixaRecepcao, onCompleteUpdate,
    } = this.props;
    const { saldoInicialDinheiro } = this.state;
    if (contaFechamento) {
      await FinanceiroService.atualizarCaixaRecepcao({
        form: {
          contaFechamento,
          data: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
          empresaUnidade: unidade.id,
          saldoInicialDinheiro,
        },
      });
      onCompleteUpdate();
    } else {
      notify('Não é possível desmarcar a opção.', { variant: 'warning' });
    }
  }

  handlePrintPdf = async () => {
    try {
      await this.setState({ loadingPDF: true });
      kendo.drawing.drawDOM(this.printReciboComponent.rootElForPDF, {
        multiPage: true,
        allPages: true,
        avoidLinks: true,
        repeatHeaders: true,
        paperSize: 'A4',
        margin: {
          top: '2cm',
          left: '1cm',
          right: '1cm',
          bottom: '2cm',
        },
        scale: 0.8,
        keepTogether: 'print',
        template: $('#page-template').html(),
      }).then((group) => {
        this.setState({ loadingPDF: false });
        return kendo.drawing.exportPDF(group);
      }).then((dataUri) => {
        fetch(dataUri)
          .then(res => res.blob())
          .then(blob => printJS(window.URL.createObjectURL(blob)));
      });
    } catch (err) {
      console.log(err);
    }
  }

  handleSendPDF = async () => {
    const { notify } = this.props;
    const { email } = this.state;
    try {
      const recibo = new FormData();
      await this.setState({ loadingPDF: true });
      kendo.drawing.drawDOM(this.printReciboComponent.rootElForPDF, {
        allPages: true,
        avoidLinks: true,
        repeatHeaders: true,
        paperSize: 'A4',
        margin: {
          top: '2cm',
          left: '1cm',
          right: '1cm',
          bottom: '2cm',
        },
        scale: 0.8,
        keepTogether: 'print',
        template: $('#page-template').html(),
      }).then((group) => {
        this.setState({ loadingPDF: false });
        return kendo.drawing.exportPDF(group);
      }).then((dataUri) => {
        fetch(dataUri)
          .then(res => res.blob())
          .then(async (blob) => {
            const file = new Blob([blob], { type: 'application/pdf' });
            await recibo.append('file', file, 'recibo.pdf');
            this.sendPDF(recibo, email);
            this.setState({ lancamentosSelecionados: [] });
          });
      });
    } catch (err) {
      notify('Ocorreu um erro ao gerar o recibo.', { variant: 'error' });
      console.log(err);
    }
  }

  sendPDF = async (file, destinatarios) => {
    const { unidade, notify } = this.props;
    try {
      notify('Enviando recibo, aguarde...', { variant: 'warning' });
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
    }
  }

  renderLancamentos = () => {
    const {
      classes,
      caixaRecepcao: { lancamentos },
    } = this.props;

    const {
      showMoreLancamentos, lancamentosSelecionados,
    } = this.state;

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
          date={<strong className={classes.tableCell} style={{ color: '#666', margin: 10 }}>{moment(lancamento.dataLancamento).format('HH[h]mm')}</strong>}
          iconStyle={
            lancamentosSelecionados.includes(lancamento.id)
              ? { color: '#0077cc', backgroundColor: '#e1ecf4', cursor: 'pointer' }
              : (lancamento.entrada ? { color: '#61bd4f', backgroundColor: '#C6D880', cursor: 'pointer' } : { color: '#FBC2C4', backgroundColor: '#eb2f37' })
          }
          iconOnClick={() => this.sanitizationLancamento(lancamento.id)}
          icon={this.renderFormaPagamento(lancamento.formaPagamento)}
        >
          <h4
            onDoubleClick={() => this.sanitizationLancamento(lancamento.id)}
            className="vertical-timeline-element-title"
            style={{
              justifyContent: 'center',
              alignItems: 'stretch',
              alignSelf: 'center',
            }}
          >
            <span style={{ float: 'right' }}>
              <Tooltip
                key={lancamento.id}
                title="Clique para excluir"
                placement="top"
                enterDelay={600}
                leaveDelay={100}
              >
                <IconButton
                  className={classes.tableRow}
                  onClick={() => this.handleDelete(lancamento)}
                >
                  <CloseIcon />
                </IconButton>

              </Tooltip>
            </span>
            <span style={{ float: 'left' }}>
              <Tooltip
                key={lancamento.id}
                title={(showMoreLancamentos.includes(lancamento.id) ? 'Clique para ver mais detalhes' : 'Clique para ocultar os detalhes')}
                placement="top"
                enterDelay={600}
                leaveDelay={100}
              >
                <IconButton
                  className={classes.tableRow}
                  onClick={() => (showMoreLancamentos.includes(lancamento.id) ? this.handleHiddenAgendamentos(lancamento) : this.handleShowAgendamentos(lancamento))}
                >
                  {lancamento.agendas.length ? (
                    <Fragment>
                      {(showMoreLancamentos.includes(lancamento.id) ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      ))}
                    </Fragment>
                  ) : (
                    null
                  )}
                </IconButton>
              </Tooltip>
            </span>
            <center style={{ float: 'center' }}>{`${this.maskTipoLancamento(lancamento.tipoLancamento)} |  ${this.maskFormaPagamento(lancamento.formaPagamento)}`}</center>
            <center><strong style={(lancamento.entrada ? { color: '#61bd4f' } : { color: '#ff0000' })}>{formataDinheiro(lancamento.valor)}</strong></center>
            {lancamento.agendas.length ? (this.renderAgendamentos(lancamento)) : (this.renderDescricao(lancamento))}
          </h4>
        </VerticalTimelineElement>
      </div>
    ));
  }

  renderPageTemplate = () => {
    const { classes } = this.props;
    const { logo } = this.state;
    return (
      <div className="page-template">
        <div className="header">
          <Grid container justify="center" direction="row" sm={12} md={12} lg={12}>
            <Grid container item justify="flex-start" alignItems="left" sm={12} md={12} lg={6}>
              <img src={logo} className={classes.logo} alt="logotipo" />
            </Grid>
            <Grid container item justify="flex-end" alignItems="center" sm={12} md={12} lg={6}>
              <div>{moment().format('dddd[, ] DD [de] MMMM [de] YYYY')}</div>
            </Grid>
          </Grid>
        </div>
        <div className="footer">
          <Grid container item justify="center" alignItems="center" className={classes.footer}>
            #:pageNum# / #:totalPages#
          </Grid>
        </div>
      </div>
    );
  }

  renderLancamentosRecibo = () => {
    const {
      caixaRecepcao: { lancamentos: lancamentosCaixaRecepcao },
      classes,
    } = this.props;

    const {
      lancamentosSelecionados,
    } = this.state;

    const lancamentos = lancamentosCaixaRecepcao.filter(lancamento => lancamentosSelecionados.includes(lancamento.id));

    return lancamentos.map(lancamento => (
      <print>
        <div style={{ margin: '20px 0' }}>
          <VerticalTimelineElement
            animate
            contentStyle={{ marginLeft: '-0.01 vw' }}
            contentArrowStyle={{ display: 'none' }}
            contentStyle={{
              marginLeft: 0,
              backgroundColor: '#fff',
              color: '#666',
              border: '1px solid #d1d1d1',
              borderRadius: 5,
            }}
            iconStyle={{ display: 'none' }}
            className="vertical-timeline-element--work"
            position={(!lancamento.entrada ? 'right' : 'left')}
            date={<strong className={classes.tableCell} style={{ color: '#666', margin: 10 }}>{moment(lancamento.dataLancamento).format('HH[h]mm')}</strong>}
          >
            <h4
              className="vertical-timeline-element-title"
              style={{
                justifyContent: 'center',
                alignItems: 'stretch',
                alignSelf: 'center',
              }}
            >
              <center style={{ float: 'center' }}>{`${this.maskTipoLancamento(lancamento.tipoLancamento)} |  ${this.maskFormaPagamento(lancamento.formaPagamento)}`}</center>
              <center><strong style={(lancamento.entrada ? { color: '#61bd4f' } : { color: '#ff0000' })}>{formataDinheiro(lancamento.valor)}</strong></center>
              {lancamento.agendas.length ? (this.renderAgendamentos(lancamento)) : (this.renderDescricao(lancamento))}
            </h4>
          </VerticalTimelineElement>
        </div>
      </print>
    ));
  }

  sanitizationLancamento = async (lancamentoId) => {
    let { lancamentosSelecionados } = this.state;

    if (lancamentosSelecionados.includes(lancamentoId)) {
      lancamentosSelecionados = lancamentosSelecionados.filter(lancamento => lancamento !== lancamentoId);
      await this.setState({ lancamentosSelecionados });
    } else {
      lancamentosSelecionados.push(lancamentoId);
      await this.setState({ lancamentosSelecionados });
    }
  }

  handleClearLancamentosConta = () => {
    this.setState({ lancamentosSelecionados: [] });
  }

  handleSelectAll = async () => {
    const { caixaRecepcao: { lancamentos } } = this.props;
    const { lancamentosSelecionados } = this.state;
    this.setState({ lancamentosSelecionados: [...lancamentosSelecionados, ...lancamentos.map(({ id }) => id).filter(id => !lancamentosSelecionados.includes(id))] });
  }

  renderAssinatura = () => {
    const { classes } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    return (
      <print>
        <Grid item container justify="flex-end" alignItems="right" sm={12} md={12} lg={12} style={{ paddingTop: '10vh' }}>
          <Grid item container justify="flex-start" alignItems="left" sm={12} md={12} lg={12} style={{ paddingTop: '10vh' }}>
            <strong className={classes.assinatura}>
              {`Atendente: ${usuarioLogado.nome.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}`}
            </strong>
          </Grid>
          <strong className={classes.assinatura} style={{ borderTop: '2px solid rgba(0, 0, 0, 0.87)' }}>
            Assinatura
          </strong>
        </Grid>
      </print>
    );
  }

  render() {
    const {
      classes, dataCaixaRecepcao, caixaRecepcao, openTabCaixaRecepcao, onCompleteUpdate,
    } = this.props;

    const {
      email, modalSendEmail, loadingPDF, lancamentosSelecionados, usuariosRecepcao, saldoInicialDinheiro, conta, contas, drawerLancamentoManual, drawerTransferencia, lancamentoSelecionado, saldoDinheiro, dialogDeleteLancamento,
    } = this.state;

    return (
      <Fragment>
        <Dialog
          open={modalSendEmail}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => this.setState({ modalSendEmail: false, email: '' })}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="form-dialog-title">ENVIAR RECIBO POR-EMAIL</DialogTitle>
          <DialogContent>
            <DialogContentText>
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
              onClick={() => {
                this.handleSendPDF();
                this.setState({ modalSendEmail: false, email: '' });
              }}
              color="primary"
            >
              Enviar
            </Button>
            <Button onClick={() => this.setState({ modalSendEmail: false })} color="secondary">
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
        {openTabCaixaRecepcao === true && caixaRecepcao && (
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
              <Dialog
                open={dialogDeleteLancamento}
                onClose={() => this.setState({ dialogDeleteLancamento: false })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">Excluir lançamento?</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                  Deseja realmente excluir este lançamento?
                  &nbsp;
                    <strong>Esta operação é irreversível</strong>
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => this.setState({ dialogDeleteLancamento: false })} color="default">
                    CANCELAR
                  </Button>
                  <Button onClick={() => this.handleRemoveLancamento(lancamentoSelecionado)} color="secondary" autoFocus>
                    CONCORDAR
                  </Button>
                </DialogActions>
              </Dialog>

              <TransferirSaldo
                usuarios={usuariosRecepcao}
                onComplete={onCompleteUpdate}
                caixaRecepcao={caixaRecepcao}
                dataCaixaRecepcao={dataCaixaRecepcao}
                open={drawerTransferencia}
                handleClose={() => this.setState({ drawerTransferencia: false })}
              />

              <LancamentoManual
                usuarios={usuariosRecepcao}
                onComplete={onCompleteUpdate}
                caixaRecepcao={caixaRecepcao}
                dataCaixaRecepcao={dataCaixaRecepcao}
                open={drawerLancamentoManual}
                handleClose={() => this.setState({ drawerLancamentoManual: false })}
              />

              {!isEmpty(lancamentosSelecionados) ? (
                <Grid container spacing={1} direction="row" sm={12} md={12} lg={12} className={classes.paper}>
                  <Grid item sm={12} md={12} lg={12}>
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
                        text="GERAR RECIBO IMPRESSO"
                        icon={mdiFile}
                        iconSize="20px"
                        bgColor="#eb2f37"
                        textColor="#fff"
                        onClick={this.handlePrintPdf}
                      />
                    </Grid>
                    <Grid item sm={12} md={12} lg={12} style={{ margin: 8 }}>
                      <LabelClin
                        text="ENVIAR RECIBO POR E-MAIL"
                        icon={mdiEmailOutline}
                        iconSize="20px"
                        bgColor="#eb2f37"
                        textColor="#fff"
                        onClick={() => this.setState({ modalSendEmail: true })}
                      />
                    </Grid>
                  </Grid>
                </Grid>

              ) : (
                <Fragment>
                  <Grid container spacing={1} direction="row" sm={12} md={12} lg={12} className={classes.paper} style={{ marginTop: !isEmpty(lancamentosSelecionados) && '2vw' }}>
                    <Grid item sm={12} md={12} lg={6}>
                      <Grid
                        item
                        sm={12}
                        md={12}
                        lg={12}
                        className={classes.paper}
                        style={{
                          backgroundColor: '#0662a1', minHeight: 300, maxHeight: 300, paddingTop: '2%',
                        }}
                      >
                        <Grid container sm={12} md={12} lg={12} direction="row" justify="center" alignItems="center">
                          <Grid item sm={12} md={12} lg={12} alignItems="center" style={{ margin: 5, fontWeight: 900 }}>
                            <Typography
                              fullWidth
                              component="h2"
                              variant="body1"
                              align="center"
                              style={{ color: '#e1e1e1' }}
                            >
                              CAIXA RECEPÇÃO
                              <br />
                              <strong>{moment(dataCaixaRecepcao).format('DD/MM/YYYY')}</strong>
                            </Typography>
                          </Grid>

                          <Grid item sm={12} md={12} lg={6} alignItems="center">
                            <Grid item sm={12} md={12} lg={12} style={{ margin: 5 }} alignItems="center">
                              <h4 style={{
                                margin: 0, fontWeight: 400, textAlign: 'center', color: '#e1e1e1',
                              }}
                              >
                                SALDO DISPONÍVEL
                              </h4>
                              {/*
                            */}

                              <h2 style={{ margin: 0, textAlign: 'center', color: '#fff' }}>
                                {formataDinheiro(caixaRecepcao.saldo)}
                              </h2>

                            </Grid>
                          </Grid>

                          <Grid item sm={12} md={12} lg={6} alignItems="center">
                            <Grid item sm={12} md={12} lg={12} style={{ margin: 5 }} alignItems="center">
                              <h4 style={{
                                margin: 0, fontWeight: 400, textAlign: 'center', color: '#e1e1e1',
                              }}
                              >
                                DINHEIRO EM CAIXA
                              </h4>
                              <h2 style={{ margin: 0, textAlign: 'center', color: '#fff' }}>
                                {formataDinheiro(saldoDinheiro)}
                              </h2>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item sm={12} md={3} lg={12} style={{ margin: 8 }}>
                          {caixaRecepcao.finalizado ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              label="CONTA*"
                              InputLabelProps={{
                                className: classes.label,
                              }}
                              value={
                                  `${String(caixaRecepcao.contaFechamento.descricao).toUpperCase()} - | SALDO: ${formataDinheiro(caixaRecepcao.contaFechamento.saldo)}`
                                }
                              inputProps={{
                                style: {
                                  fontWeight: 900, color: '#fff', textAlign: 'left',
                                },
                                readOnly: true,
                              }}
                            />
                          ) : (
                            <ModalSelect
                              id="select-conta"
                              label="CONTA*"
                              InputLabelProps={{
                                className: classes.label,
                              }}
                              empty="Nenhuma conta encontrada..."
                              value={conta}
                              options={contas.map((item, index) => ({
                                id: item.id,
                                label: `${String(item.descricao).toUpperCase()}`,
                                subLabel: `SALDO: ${formataDinheiro(item.saldo)}`,
                              }))}
                              autoCompleteAsync
                              onChange={this.handleContaFechamento}
                              textfieldProps={{
                                variant: 'outlined',
                                fullWidth: true,
                                style: { color: '#fff' },
                              }}
                              inputProps={{
                                style: { color: '#fff', fontWeight: 900 },
                              }}
                            />
                          )}
                        </Grid>

                        <Grid item sm={12} md={12} lg={12} style={{ margin: 8 }}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="SALDO INICIAL*"
                            InputLabelProps={{
                              className: classes.label,
                            }}
                            value={saldoInicialDinheiro}
                            inputProps={{
                              style: {
                                fontSize: '1.5em', fontWeight: 'bold', color: '#fff', textAlign: 'center',
                              },
                              readOnly: caixaRecepcao.finalizado,
                            }}
                            onChange={({ target }) => this.handleChangeSaldoInicial(target.value)}
                            InputProps={{
                              inputComponent: InputFormatDinheiro,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item sm={12} md={12} lg={6}>
                      <Grid item sm={12} md={12} lg={12} className={classes.paper} style={{ backgroundColor: '#0662a1', minHeight: 300, maxHeight: 300 }}>
                        <Grid item sm={12} md={12} lg={12} style={{ margin: 15 }}>
                          <LabelClin
                            text="FINALIZAR CAIXA"
                            icon={mdiCheckboxMultipleMarkedCircleOutline}
                            iconSize="20px"
                            bgColor={caixaRecepcao.finalizado ? '#e1e1e1' : '#eb2f37'}
                            textColor={caixaRecepcao.finalizado ? '#666' : '#fff'}
                            onClick={() => !caixaRecepcao.finalizado && this.handleCaixaFinalizar()}
                          />
                        </Grid>

                        <Grid item sm={12} md={12} lg={12} style={{ margin: 15 }}>
                          <LabelClin
                            text="TRANSFERIR"
                            icon={mdiTransferUp}
                            iconSize="20px"
                            bgColor={caixaRecepcao.finalizado ? '#e1e1e1' : saldoDinheiro > 0 ? '#eb2f37' : '#e1e1e1'}
                            textColor={caixaRecepcao.finalizado ? '#666' : saldoDinheiro > 0 ? '#fff' : '#666'}
                            onClick={() => !caixaRecepcao.finalizado && saldoDinheiro > 0 && this.setState({ drawerTransferencia: true })}
                          />
                        </Grid>

                        <Grid item sm={12} md={12} lg={12} style={{ margin: 15 }}>
                          <LabelClin
                            text="LANÇAMENTO MANUAL"
                            icon={mdiGestureTap}
                            iconSize="20px"
                            bgColor={caixaRecepcao.finalizado ? '#e1e1e1' : '#eb2f37'}
                            textColor={caixaRecepcao.finalizado ? '#666' : '#fff'}
                            onClick={() => !caixaRecepcao.finalizado && this.setState({ drawerLancamentoManual: true })}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  {!isEmpty(caixaRecepcao.lancamentos) && (
                    <Grid container spacing={1} direction="row" sm={12} md={12} lg={12} className={classes.paper}>
                      <Grid item sm={12} md={12} lg={12}>
                        <Typography
                          className={classes.labelOptions}
                          component="p"
                          variant="body1"
                          align="center"
                        >
                          Clique duas vezes sobre o(s) lançamento(s) para visualizar as opções disponíveis
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Fragment>
              )}
              {caixaRecepcao.lancamentos.length ? (
                <Grid item sm={12} md={12} lg={12} style={{ marginTop: !isEmpty(lancamentosSelecionados) && '4vw' }}>
                  <Grid item sm={12} md={12} lg={12} className={classes.paper} style={{ backgroundColor: '#e1e1e1' }}>
                    {this.renderLancamentos()}
                  </Grid>

                  <Grid item sm={12} md={12} lg={12} className={classes.paper} style={{ marginTop: '100vw', display: loadingPDF ? 'block' : 'none' }}>
                    <PDFExport
                      ref={(component) => {
                        this.printReciboComponent = component;
                      }}
                    >
                      {this.renderLancamentosRecibo()}
                      {this.renderAssinatura()}
                    </PDFExport>
                  </Grid>

                  <Grid style={{ display: 'none' }}>
                    <Grid id="page-template">{this.renderPageTemplate()}</Grid>
                  </Grid>
                </Grid>
              ) : (
                <Grid container sm={12} md={12} lg={12} direction="row" className={classes.paper} style={{ backgroundColor: '#e1e1e1', minHeight: '60vh' }}>
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
                      {caixaRecepcao.finalizado ? 'NENHUM LANÇAMENTO FOI REALIZADO NESTE DIA.' : 'NENHUM LANÇAMENTO REALIZADO ATÉ O MOMENTO!'}
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
)(ListaCaixa);
