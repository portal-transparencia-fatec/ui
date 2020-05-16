/* eslint-disable no-undef */
/* eslint-disable import/no-duplicates */
/* eslint-disable react/button-has-type */
/* eslint-disable consistent-return */
/* eslint-disable new-cap */
/* eslint-disable no-return-assign */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/order */
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { compose } from 'redux';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { PDFExport } from '@progress/kendo-react-pdf';
import { isEmpty } from 'lodash';
import LabelClin from '../../../../../components/LabelClin';
import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {
  mdiTimerSand,
  mdiCheckOutline,
  mdiAlertBoxOutline,
} from '@mdi/js';
import Iframe from 'react-iframe';
import FormaPagamento from './FormaPagamento';
import FinanceiroService from '../../../../../services/Financeiro';
import GenericFileService from '../../../../../services/GenericFile';
import NotificationActions from '../../../../../store/ducks/notifier';
import CircularProgress from '@material-ui/core/CircularProgress';
import Material from './styles';
import Slide from '@material-ui/core/Slide';
import '../../../../../assets/css/Dropzone.css';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import {
  emailValidator,
  formataDinheiro,
} from '../../../../../libs/utils';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import printJS from 'print-js';

const bucketFileS3 = process.env.REACT_APP_V2_S3_FILES;
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
class GerarGuia extends Component {
  state = {
    logo: '',
    loadingPDF: false,
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
    email: '',
    modalSendEmail: false,
    recibo: null,
    formasPagamentoTotal: 0,
    formasPagamentoTotalParcelado: 0,
    formasPagamento: [],
    paymentsParcelas: [],
    loading: false,
    guiaAgendamentos: null,
    guiaPDF: '',
    activeStep: 0,
    isPresentConvenio: null,
    steps: ['SELECIONAR AGENDAMENTOS', 'GERAR GUIA CONVÊNIO', 'FORMA(S) DE PAGAMENTO'],
    agendamentosGroup: [],
  }

  async componentDidMount() {
    await this.fetchLogoEmpresa();
  }

  componentDidUpdate= async (prevProps, prevState) => {
    const { activeStep, steps, agendamentosGroup } = this.state;
    const { agendamentos, setFieldValue } = this.props;
    if (activeStep === 1 && activeStep !== prevState.activeStep) {
      if (prevState.activeStep === 0) {
        this.setState({ isPresentConvenio: null });
      }
      setFieldValue('showGuia', false);
      this.fetchFaturamento(agendamentosGroup, prevState.activeStep);
    }
    if (agendamentos !== prevProps.agendamentos) {
      this.setState({ activeStep: 0, agendamentosGroup: [], isPresentConvenio: null });
      setFieldValue('agendamentosGroup', []);
    }

    if (activeStep !== prevState.activeStep && activeStep === steps.length) {
      this.printPDF();
    }
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


  fetchFaturamento = async (agendamentosGroup, prevActiveStep) => {
    const agendamentos = [];
    let isPresentConvenio = false;
    const { setFieldValue, notify } = this.props;
    try {
      agendamentosGroup.map(({ id }) => {
        const {
          data, hora, unidade, usuario,
        } = id;
        agendamentos.push({
          data,
          hora: moment(hora, 'HH:mm:ss').format('HH:mm'),
          unidade: unidade.id,
          usuario: usuario.id,
        });
      });
      const guiaAgendamentos = await FinanceiroService.gerarGuia(agendamentos);
      await this.setState({ guiaAgendamentos });
      guiaAgendamentos.agendamentos.map(({ particular }) => {
        if (!particular) {
          isPresentConvenio = !particular;
        }
      });

      if (isPresentConvenio) {
        setFieldValue('showGuia', true);
      } else if (prevActiveStep === 0) {
        this.handleNext();
        this.setState({ isPresentConvenio });
      }
    } catch (err) {
      if (err && err.response.data) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao abrir conta.', { variant: 'warning' });
      }
    }
  }


  handleNext = () => {
    const { activeStep, agendamentosGroup } = this.state;
    const { setFieldValue } = this.props;
    if (activeStep <= 3) {
      this.setState({ activeStep: activeStep + 1 });
      if (agendamentosGroup && agendamentosGroup.length) {
        setFieldValue('agendamentosGroup', agendamentosGroup);
      }
    }
  }

  handleBack = async () => {
    const { activeStep } = this.state;
    const { values: { agendamentosGroup } } = this.props;
    if (activeStep > 0) {
      this.setState({ activeStep: activeStep - 1 }, () => {
        if (this.state.activeStep === 0) {
          this.setState({ agendamentosGroup });
        }
        if (this.state.activeStep === 1) {
          this.fetchFaturamento(agendamentosGroup, activeStep);
        }
      });
    }
  }

  renderSituacao = (agendamento) => {
    const { statusPagamento } = agendamento;
    if (statusPagamento === 'AGUARDANDO') {
      return (
        <>
          <LabelClin
            text={statusPagamento}
            icon={mdiTimerSand}
            iconSize="20px"
            bgColor="#ffbb99"
            textColor="#ff5500"
          />
        </>
      );
    }
    if (statusPagamento === 'PAGO') {
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
    return (
      <>
        <LabelClin
          text={statusPagamento}
          icon={mdiAlertBoxOutline}
          iconSize="20px"
          bgColor="#eff0ad"
          textColor="#a3a605"
        />
      </>
    );
  }

  handleSubmitPagamentos = async () => {
    const { formasPagamento, guiaAgendamentos: { agendamentos } } = this.state;
    const { notify, unidade } = this.props;
    const convenios = [];
    const particulares = [];
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    try {
      agendamentos.map(agendamento => (agendamento.particular ? (
        particulares.push(agendamento.id)
      ) : (
        convenios.push(agendamento.id)
      )));
      await FinanceiroService.gerarFechamento({
        date: moment().format('YYYY-MM-DD'),
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
        fechamento: {
          convenios,
          particulares,
          pagamentos: formasPagamento,
        },
      });
      this.handleNext();
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Ocorreu um erro ao tentar realizar o fechamento.', { variant: 'error' });
      }
    }
  }

  handleChangeAgendamentos = async (agendamento) => {
    let { agendamentosGroup } = this.state;
    const { setFieldValue } = this.props;
    if (agendamentosGroup.includes(agendamento)) {
      agendamentosGroup = agendamentosGroup.filter(item => item !== agendamento);
      await this.setState({ agendamentosGroup });
    } else {
      agendamentosGroup.push(agendamento);
      await this.setState({ agendamentosGroup });
    }
    setFieldValue('agendamentosGroup', this.state.agendamentosGroup);
  }

  renderAgendamentos = (agendamento) => {
    const { classes } = this.props;
    return (
      <>
        <TableCell className={classes.tableCell} align="left">{agendamento.id.usuario.nome}</TableCell>
        <TableCell className={classes.tableCell} align="left">{agendamento.evento.descricao}</TableCell>
        <TableCell className={classes.tableCell} align="left">{agendamento.plano ? agendamento.plano.descricaoPlanoConvenio : '' }</TableCell>
        <TableCell className={classes.tableCell} align="left">{`${moment(agendamento.id.data).format('DD/MM/YYYY')} às ${moment(agendamento.id.hora, 'HH:mm:ss').format('HH:mm')}`}</TableCell>
        <TableCell className={classes.tableCell} align="left">{this.renderSituacao(agendamento)}</TableCell>
      </>
    );
  }

  generatePDF = () => {
    return (
      null
    );
  }

  getStepContent = (step) => {
    const {
      classes, agendamentos, values, paciente, containerHeight,
    } = this.props;
    const {
      agendamentosGroup, guiaPDF, isPresentConvenio, guiaAgendamentos,
    } = this.state;
    switch (step) {
      case 0:
        return (
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableRow}>
                <TableCell align="left">Médico</TableCell>
                <TableCell align="left">Evento</TableCell>
                <TableCell align="left">Plano/Convênio</TableCell>
                <TableCell align="left">Horário</TableCell>
                <TableCell align="left">Situação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agendamentos.map(agendamento => (
                <Fragment>
                  {agendamento.statusPagamento !== 'AGUARDANDO' ? (
                    <TableRow
                      className={classes.disableRow}
                    >
                      {this.renderAgendamentos(agendamento)}
                    </TableRow>
                  ) : (
                    <TableRow
                      className={classes.tableRow}
                      onClick={() => this.handleChangeAgendamentos(agendamento)}
                      style={({ backgroundColor: agendamentosGroup.includes(agendamento) && 'rgba(0, 0, 0, 0.07)' })}
                    >
                      {this.renderAgendamentos(agendamento)}
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        );
      case 1:
        return (
          <Fragment>
            {agendamentosGroup.length !== 0 && values.showGuia === true && this.generatePDF()}

            {values.showGuia ? (
              <Iframe
                url={guiaPDF}
                width="100%"
                height={containerHeight}
              />
            ) : (
              <Grid item sm={12} md={12} lg={12}>
                {isPresentConvenio !== null && (
                  <Typography align="center" variant="subtitle2">
                  NENHUM AGENDAMENTO POR CONVÊNIO FOI SELECIONADO.
                  </Typography>
                )}
              </Grid>
            )}
          </Fragment>
        );
      case 2:
        return (


          <Grid item sm={12} md={12} lg={12}>
            <FormaPagamento
              guiaAgendamentos={guiaAgendamentos}
              paciente={paciente}
              onComplete={(formasPagamento, formasPagamentoTotal, formasPagamentoTotalParcelado, paymentsParcelas) => {
                this.setState({
                  formasPagamento, formasPagamentoTotal, formasPagamentoTotalParcelado, paymentsParcelas,
                });
              }}
            />
          </Grid>
        );
      default:
        return null;
    }
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

  renderPagamentos = () => {
    const { classes } = this.props;
    const { formasPagamento, formasPagamentoTotalParcelado } = this.state;
    if (formasPagamento.length) {
      return (
        <print>
          <Grid item sm={12} md={12} lg={12} className={classes.paperRound}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                >
                  <TableCell align="center" colspan={10}>FORMA(S) DE PAGAMENTO</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formasPagamento.map((payment, index) => (
                  <Fragment>
                    <TableRow>
                      {this.renderRowPayments(payment, index)}
                    </TableRow>
                    {index === formasPagamento.length - 1 && (
                    <TableRow>
                      <TableCell align="right" style={{ fontSize: '0.8vw' }} colSpan={10}><b>{`TOTAL: ${formataDinheiro(Number(formasPagamentoTotalParcelado))}`}</b></TableCell>
                    </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </print>
      );
    }
  }

  renderAllParcelasPagamento = () => {
    const { classes } = this.props;
    const { paymentsParcelas, formasPagamento: payments, labelFormaPagamentoOptions } = this.state;
    if (!isEmpty(paymentsParcelas)) {
      return (
        <Grid item sm={12} md={12} lg={12} className={classes.paperRound}>
          <Grid item sm={12} md={12} lg={12} className={classes.paper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                >
                  <TableCell align="center" colspan={18}>PARCELA(S)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentsParcelas.map(({ uuid, condicaoPagamento, parcelas }) => {
                  const rowIndex = payments.map((payment, index) => {
                    if (payment.uuid === uuid) {
                      return index + 1;
                    }
                  });
                  return (
                    <Fragment>
                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell className={classes.tableCell} align="center" colSpan={4}>
                          <Grid className={classes.rowIndex}>
                            <strong>
                              {rowIndex}
                            </strong>
                          </Grid>
                        </TableCell>
                        <TableCell align="center" colSpan={10}>
                          <strong>
                            {`${labelFormaPagamentoOptions[condicaoPagamento.formaPagamento]} - ${String(condicaoPagamento.descricao).toUpperCase()}`}
                          </strong>
                        </TableCell>
                        <TableCell align="center" colSpan={4} />
                      </TableRow>
                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell colspan={4} />
                        <TableCell align="center" colspan={3}><strong>DATA</strong></TableCell>
                        <TableCell align="center" colspan={3}><strong>VALOR</strong></TableCell>
                        <TableCell align="center" colspan={4}><strong>CHEQUE Nº</strong></TableCell>
                        <TableCell align="center" colspan={4}><strong>BANCO</strong></TableCell>
                      </TableRow>
                      <TableRow style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }} />
                      {parcelas.map(parcela => (
                        <TableRow>
                          <TableCell colSpan={2} />
                          <TableCell className={classes.tableCell} align="center" colSpan={2}>
                            <Grid className={[classes.rowItemIndex]}>
                              {`${parcela.id > 9 ? parcela.id : `0${parcela.id}`}ª`}
                            </Grid>
                          </TableCell>
                          <TableCell align="center" colspan={3}><strong>{`${moment(parcela.data, 'YYYY-MM-DD').format('DD/MM/YYYY')}`}</strong></TableCell>
                          <TableCell align="center" colspan={3}><strong>{`${formataDinheiro(parcela.valor)}`}</strong></TableCell>
                          <TableCell align="center" colspan={4}><strong>{parcela.chequeNumero || '-'}</strong></TableCell>
                          <TableCell align="center" colspan={4}><strong>{parcela.chequeBanco || '-'}</strong></TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      );
    }
  }

  renderRowPayments = (payment, index) => {
    const { classes } = this.props;

    const { formaPagamentoOptions, labelFormaPagamentoOptions } = this.state;
    const { formaPagamento } = payment;
    if (formaPagamento === formaPagamentoOptions.DINHEIRO) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colSpan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.DINHEIRO}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorPago))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Recebendo:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Troco:
            <br />
            <strong>{formataDinheiro(Number(payment.troco))}</strong>
          </TableCell>
        </Fragment>
      );
    }


    if (formaPagamento === formaPagamentoOptions.CRÉDITO) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colSpan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.CARTAO_CREDITO}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={4}>
            Total Parcelado:
            <br />
            <strong>{formataDinheiro(payment.total)}</strong>
          </TableCell>
        </Fragment>
      );
    }

    if (formaPagamento === formaPagamentoOptions.DÉBITO) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colSpan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.CARTAO_DEBITO}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="right" colSpan={4} />
        </Fragment>
      );
    }


    if (formaPagamento === formaPagamentoOptions.CHEQUE) {
      return (
        <Fragment>
          <TableCell className={classes.tableCell} align="center" colSpan={2}>
            <Grid className={classes.rowIndex}>
              <strong>{index + 1}</strong>
            </Grid>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Modo:
            <br />
            <strong>{labelFormaPagamentoOptions.CHEQUE}</strong>
          </TableCell>

          <TableCell className={classes.tableCell} align="left" colSpan={2}>
            Valor a Pagar:
            <br />
            <strong>{formataDinheiro(Number(payment.valorEventos))}</strong>
          </TableCell>
          <TableCell className={classes.tableCell} align="left" colSpan={4}>
            Total Parcelado:
            <br />
            <strong>
              {formataDinheiro(payment.total)}
            </strong>
          </TableCell>
        </Fragment>
      );
    }
  }

  handleSendEmail = () => {
    const { recibo } = this.state;
    const { values: { agendamentosGroup: agendamentos } } = this.props;

    let emails = agendamentos.filter(({ email }) => email).map(({ email }) => email);
    emails = emails.filter((element, index) => emails.indexOf(element) === index);

    if (!isEmpty(emails)) {
      this.sendPDF(recibo, emails);
    } else {
      this.setState({ modalSendEmail: true });
    }
  }

  sendPDF = async (file, destinatarios) => {
    const { unidade, notify } = this.props;
    try {
      this.setState({ loading: true });
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
    } finally {
      this.setState({ loading: false });
    }
  }

  printPDF = async () => {
    const { notify } = this.props;
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
            this.uploadFileS3(recibo);
          });
      });
    } catch (err) {
      notify('Ocorreu um erro ao gerar o recibo.', { variant: 'error' });
      console.log(err);
    }
  }

  uploadFileS3 = async (file) => {
    const { paciente, unidade } = this.props;
    try {
      file.append('_method', 'PUT');
      await GenericFileService.uploadFile({
        bucketFileS3,
        filename: `${paciente.nome}-${moment().format('HH:mm:ss')}.pdf`,
        file,
        key: `recibos/${unidade.id}/${moment().format('YYYY-MM-DD')}`,
      });
      file.delete('_method');
      this.setState({ recibo: file });
    } catch (err) {
      console.log(err);
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

  renderAllAgendamentos = () => {
    const { classes } = this.props;
    const { guiaAgendamentos: { agendamentos, totalConvenio, totalPagar } } = this.state;
    return (
      <print>
        <Grid item sm={12} md={12} lg={12} className={classes.paperRound}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                <TableCell align="center" colspan={4}>AGENDAMENTO(S)</TableCell>
              </TableRow>

              <TableRow
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
              >
                <TableCell align="center">Médico</TableCell>
                <TableCell align="center">Evento</TableCell>
                <TableCell align="center">Horário</TableCell>
                <TableCell align="center">Valor</TableCell>
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
                    <TableCell className={classes.tableCell} align="center">{agendamento.medico}</TableCell>
                    <TableCell className={classes.tableCell} align="center">{agendamento.evento}</TableCell>
                    <TableCell className={classes.tableCell} align="center">{`${moment(agendamento.id.data).format('DD/MM/YYYY')} às ${moment(agendamento.id.hora, 'HH:mm:ss').format('HH:mm')}h`}</TableCell>
                    <TableCell className={classes.tableCell} align="center">{formataDinheiro(Number(agendamento.valorAgendamento))}</TableCell>
                  </TableRow>
                  {index === agendamentos.length - 1 && (
                  <Fragment>
                    <TableRow>
                      <TableCell align="right" colspan={4}>
                        <Grid container spacing={1} sm={12} md={12} lg={12} direction="row" justify="flex-end" alignItems="center" style={{ minHeight: 80 }}>
                          <Grid item sm={12} md={12} lg={10} className={classes.tableCell}>
                            <strong>_</strong>
                          </Grid>

                          <Grid item sm={12} md={12} lg={2} alignItems="right" className={classes.tableCell}>
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
      </print>
    );
  }

  renderPaciente =() => {
    const { paciente } = this.props;
    return (
      <Grid item sm={12} md={12} lg={12} style={{ color: 'rgba(0, 0, 0, 0.87)', fontSize: '0.8vw' }}>
        {`PACIENTE: ${String(paciente.nome).toUpperCase()}`}
      </Grid>
    );
  };

  pdfRender = () => (
    <>
      {this.renderAllAgendamentos()}
      {this.renderPagamentos()}
      {this.renderAllParcelasPagamento()}
    </>
  );

  render() {
    const {
      openModalAgendamentos, classes, paciente, values, notify,
    } = this.props;
    const {
      loadingPDF, email, modalSendEmail, activeStep, recibo, steps, loading, agendamentosGroup, formasPagamento, guiaAgendamentos, formasPagamentoTotal,
    } = this.state;

    return (
      <Fragment>
        { openModalAgendamentos ? (
          <Grid container spacing={2}>
            <LoadingIndicator loading={loading} />
            { openModalAgendamentos && (
            <Grid item sm={12} md={12} lg={12}>
              <div className={classes.root}>
                <Grid item sm={12} md={12} lg={12}>
                  <Typography align="center" variant="subtitle2">
                    {`GUIA DO PACIENTE ${paciente.nome.toUpperCase()}`}
                  </Typography>
                </Grid>
                <Stepper activeStep={activeStep}>
                  {steps.map((label, index) => (
                    <Step key={label} style={{ cursor: 'pointer' }}>
                      <StepLabel onClick={() => {
                        if (activeStep >= index && activeStep) {
                          if (activeStep !== 3) {
                            if (index === 0) {
                              this.setState({ agendamentosGroup: values.agendamentosGroup });
                            }
                            this.setState({ activeStep: index }, () => {
                              if (this.state.activeStep === 1) {
                                this.fetchFaturamento(values.agendamentosGroup, activeStep);
                              }
                            });
                          }
                        } else {
                          notify('Complete as etapas anteriores!', { variant: 'warning' });
                        }
                      }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <div>
                  {activeStep === steps.length ? (
                    <Fragment>
                      <Dialog
                        open={modalSendEmail}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={() => this.setState({ modalSendEmail: false })}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle id="form-dialog-title">ENVIAR POR-EMAIL</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            Nós estaremos enviando o recibo em alguns instantes.
                          </DialogContentText>
                          <TextField
                            autoFocus
                            value={email}
                            onChange={(event) => {
                              this.setState({ email: event.target.value });
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
                              this.sendPDF(recibo, email);
                              this.setState({ modalSendEmail: false });
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
                      <Grid container direction="row" align="center" justify="center">
                        <Button
                          style={{
                            width: '40%',
                          }}
                          variant="contained"
                          color="secondary"
                          className={classes.button}
                          onClick={this.handlePrintPdf}
                        >
                          Imprimir
                        </Button>

                        <Button
                          style={{
                            width: '40%',
                          }}
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          onClick={this.handleSendEmail}
                          disabled={!recibo || loading}
                        >
                          {loading ? <CircularProgress size={32} color="primary" /> : 'Enviar por e-mail'}

                        </Button>
                      </Grid>

                      {this.pdfRender()}

                      <Grid style={{ marginTop: '100vw', display: loadingPDF ? 'block' : 'none' }}>
                        <PDFExport
                          keepTogether="print"
                          scale={0.8}
                          paperSize="A4"
                          margin="1cm"
                          ref={(component) => {
                            this.printReciboComponent = component;
                          }}
                        >
                          {this.renderPaciente()}
                          {this.pdfRender()}
                          {this.renderAssinatura()}
                        </PDFExport>
                      </Grid>

                      <Grid style={{ display: 'none' }}>
                        <Grid id="page-template">{this.renderPageTemplate()}</Grid>
                      </Grid>
                    </Fragment>
                  ) : (
                    <Grid>
                      <Grid
                        container
                        direction="row"
                        className={(values.agendamentosGroup.length || agendamentosGroup.length ? classes.menuIsVisible : classes.menuHidden)}
                        align="center"
                      >
                        <Button
                          style={{
                            width: '40%',
                          }}
                          onClick={this.handleBack}
                          className={classes.button}
                          variant="contained"
                          size="medium"
                          color="secondary"
                          type="submit"
                          disabled={activeStep === 0}
                        >
                        Voltar
                        </Button>
                        <Button
                          style={{
                            width: '40%',
                          }}
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            (activeStep === steps.length - 1 ? this.handleSubmitPagamentos() : this.handleNext());
                          }}
                          className={classes.button}
                          disabled={(
                          activeStep === steps.length - 1
                            ? (guiaAgendamentos.totalPagar !== 0 ? (
                              formasPagamento.length === 0 ? (true) : (
                                formasPagamentoTotal !== guiaAgendamentos.totalPagar
                              )
                            ) : (false)) : (false)
                        )}
                        >
                          {activeStep === steps.length - 1 ? 'Finalizar' : 'Avançar'}
                        </Button>
                      </Grid>
                      <Typography className={classes.instructions}>{this.getStepContent(activeStep)}</Typography>
                    </Grid>
                  )}
                </div>
              </div>
            </Grid>
            )}
          </Grid>
        ) : (
          null
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
  withFormik({
    displayName: 'GerarGuia',
    validateOnChange: false,
    validateOnBlur: false,
    mapPropsToValues: () => ({
      agendamentosGroup: [],
      showGuia: false,
    }),
    validationSchema: props => Yup.object().shape({
    }),
    handleSubmit: async (values, { props, setSubmitting, resetForm }) => {
    },
  }),
)(GerarGuia);
