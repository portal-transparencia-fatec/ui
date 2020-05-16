/* eslint-disable */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import Dimensions from 'react-dimensions';
import Grow from '@material-ui/core/Grow';
import renderHTML from 'react-render-html';
import SubjectIcon from '@material-ui/icons/Subject';
import AddIcon from '@material-ui/icons/Add';
import { Editor } from '@tinymce/tinymce-react';
import RemoveIcon from '@material-ui/icons/Remove';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { compose } from 'redux';
import Fab from '@material-ui/core/Fab';
import uuid from 'uuid/v1';
import Tooltip from '@material-ui/core/Tooltip';
import { withFormik } from 'formik';
import { withRouter } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import Assignment from '@material-ui/icons/Assignment';
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import 'easymde/dist/easymde.min.css';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import Chip from '@material-ui/core/Chip';
import * as Yup from 'yup';
import Iframe from 'react-iframe';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Divider from '@material-ui/core/Divider';
import { debounce, isEmpty } from 'lodash';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import { apiS3 as api, rootURL as baseURL, nexoData } from '../../../../../../services/api';
import ModalSelect from '../../../../../../components/ModalSelect';
import iconPaciente from '../../../../../../assets/images/iconPaciente.jpg';
import FieldsetInfo from '../../../../../../components/FieldsetInfo';
import AnamneseService from '../../../../../../services/Anamnese';
import NexoDataService from '../../../../../../services/NexoData';
import GenericFileService from '../../../../../../services/GenericFile';
import {
  sleep,
  cpfFormatter,
  telFormatter,
  celFormatter,
  uniqueID,
} from '../../../../../../libs/utils';

import NotificationActions from '../../../../../../store/ducks/notifier';
import PacienteService from '../../../../../../services/Paciente';
import Material, { DividerVertical, HTMLContainer } from './styles';
import { Container } from '../../../../../../styles/global';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const bucketPacienteS3 = process.env.REACT_APP_V2_S3_PACIENTE;
const bucketFileS3 = process.env.REACT_APP_V2_S3_FILES;
const TINY_API_KEY = process.env.REACT_APP_TINY_API_KEY;


class Anamnese extends Component {
  constructor(props) {
    super(props);

    this.onSearchCid = debounce(this.onSearchCid, 1000);
  }

  state = {
    isSubmitting: false,
    idPaciente: null,
    idMedico: null,
    searchPrescricao: '',
    prescricoesPaciente: [],
    modalPrescricoesPaciente: false,
    pdfPrescricao: null,
    modalPrescricao: false,
    showFloatMenu: false,
    prescricao: {},
    cidSearch: '',
    revisoes: [],
    openModalRevisao: false,
    cid: [],
    filterAgendamentosAnamneseEvolucao: false,
    options: {
      chart: {
        toolbar: {
          show: false,
        },
        events: {
          dataPointSelection: async (event, chartContext, config) => {
            this.onSearchCidChart(config.w.config.cids[config.dataPointIndex]);
          },
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 2500,
          animateGradually: {
            enabled: true,
            delay: 300,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 700,
          },
        },
      },
      plotOptions: {
        bar: {
          distributed: true,
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: true,
      },
      colors: ['rgb(235, 47, 55)'],
      xaxis: {
        categories: [],
      },
    },
    series: [{
      name: '',
      data: [0],
    }],
    chart: false,
    prontuarioVisible: true,
    paciente: {},
    openDrop: false,
    itemAnamneseEvolucao: null,
    pacienteId: undefined,
  }

  componentDidMount() {
    const { notify } = this.props;
    window.addEventListener('message', (event) => {
      if (event.origin === nexoData) {
        if (event.data.imprimir) {
          this.generatePDFPrescricao(event.data.idPrescricao);
        } else {
          this.setState({ modalPrescricao: false });
        }
        notify('Prescrição realizada com sucesso!', { variant: 'success' });
      }
    });
    this.loadCids();
  }


  async componentDidUpdate() {
    const { status, pacienteId } = this.props;

    if (pacienteId !== this.state.pacienteId) {
      this.setState({ pacienteId, showFloatMenu: false, isSubmitting: true });
      await this.fetchPaciente(true);
      this.savePacienteMedicoPrescricao();
      this.fetchAnamneseEvolucao(Number(pacienteId));
      this.fetchCidsPaciente(Number(pacienteId));
    }

    if (pacienteId && status && status.updateCidsPaciente) {
      this.fetchCidsPaciente(Number(pacienteId));
    }
  }

  savePacienteMedicoPrescricao = async () => {
    const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));
    const { paciente } = this.state;
    try {
      this.setState({ prescricoesPaciente: [], showFloatMenu: false, isSubmitting: true });
      const [idMedico, idPaciente] = await Promise.all([
        NexoDataService.saveMedico({
          Especialidades: [],
          RegistroProfissional: {
            Numero: usuario.registroProfNumero,
            Conselho: usuario.registroProfConselho,
            UF: usuario.registroProfUf,
          },
          Nome: usuario.nome,
          ReferenciaExterna: usuario.id,
          Email: usuario.email,
        }),
        NexoDataService.savePaciente({
          Sexo: paciente.sexo,
          Nascimento: moment(paciente.dataNascimento, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          Altura: paciente.altura,
          Peso: paciente.peso,
          Nome: paciente.nome,
          Documento: paciente.cpf,
          ReferenciaExterna: paciente.id,
          // Alergias: paciente.alertas ? [paciente.alertas] : '',
          TelefoneCelular: paciente.celular,
          Email: paciente.email,
          Endereco: {
            Endereco1: paciente.endereco,
            Endereco2: `${paciente.endereco}, ${paciente.enderecoNumero} - ${paciente.enderecoBairro}`,
            Bairro: paciente.enderecoBairro,
            Cidade: paciente.cidade,
            Estado: paciente.uf,
            CodigoPostal: paciente.cep,
          },
        }),
      ]);
      this.setState({ idMedico, idPaciente });
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({ isSubmitting: false });
    }
  }

  initIntegracao = async () => {
    const { notify, unidade } = this.props;
    const { paciente } = this.state;
    const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));

    try {
      this.setState({ isSubmitting: true });
      const Estabelecimento = {
        Nome: unidade.nome,
        CNES: unidade.cnpj,
        Endereco: {
          Endereco1: `${unidade.endereco}, ${unidade.enderecoNumero} - ${unidade.enderecoBairro}`,
          Endereco2: unidade.nome,
          Bairro: unidade.enderecoBairro,
          Cidade: unidade.cidade ? unidade.cidade.nome : undefined,
          Estado: unidade.estado_uf ? unidade.cidade.estado_uf : undefined,
          CodigoPostal: unidade.cep,
        },
        IdEstabelecimento: unidade.id,
        Contato: {
          TelefoneComercial: unidade.telefone,
          Celular: unidade.celular,
          Email: unidade.email,
          Site: '',
        },
      };

      const Paciente = {
        Sexo: paciente.sexo,
        Nascimento: moment(paciente.dataNascimento, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        Altura: paciente.altura,
        Peso: paciente.peso,
        Nome: paciente.nome,
        Documento: paciente.cpf,
        ReferenciaExterna: paciente.id,
        // Alergias: paciente.alertas ? [paciente.alertas] : '',
        TelefoneCelular: paciente.celular,
        Email: paciente.email,
        Endereco: {
          Endereco1: paciente.endereco,
          Endereco2: `${paciente.endereco}, ${paciente.enderecoNumero} - ${paciente.enderecoBairro}`,
          Bairro: paciente.enderecoBairro,
          Cidade: paciente.cidade,
          Estado: paciente.uf,
          CodigoPostal: paciente.cep,
        },
      };
      const Medico = {
        RegistroProfissional: {
          Numero: usuario.registroProfNumero,
          Conselho: usuario.registroProfConselho,
          UF: usuario.registroProfUf,
        },
        Email: usuario.email,
        Nome: usuario.nome,
        ReferenciaExterna: usuario.id,
      };

      const prescricao = await
      NexoDataService.iniciarPrescricao({
        ReferenciaExterna: `${paciente.id}_${usuario.id}_${unidade.id}`,
        RegistroProntuarioEletronico: {
          ReferenciaExterna: paciente.id,
        },
        Medico,
        Paciente,
        Estabelecimento,
        Emitir: false,
        Modelo: false,
        Funcionalidades: {
          HistoricoPosologia: true,
          PosologiaEstruturada: true,
          AlertaInteracao: true,
          Bula: true,
          CorretorMedicamento: true,
          ProdutoFarmacia: true,
          ModeloPrescricao: true,
        },
        DataPrescricao: moment().format('YYYY-MM-DD[T]HH:mm:ss'),
        // CID10: [
        //   "<string>",
        //   "<string>"
        // ],
      });
      this.setState({ prescricao, modalPrescricao: true, showFloatMenu: false });
    } catch (err) {
      notify('Ocorreu um erro ao iniciar a prescrição.', { variant: 'error' });
      console.log(err);
    } finally {
      this.setState({ isSubmitting: false });
    }
  }


  getPrescricoesPaciente = async () => {
    const { notify } = this.props;
    const { idMedico, idPaciente } = this.state;
    try {
      const prescricoesPaciente = await
      NexoDataService.consultarPrescricoesPaciente({
        id: idPaciente,
        idMedico,
        numeroPrescricoes: 100,
      });
      this.setState({ prescricoesPaciente });
    } catch (err) {
      notify('Ocorreu um erro ao buscar as prescrições do paciente.', { variant: 'error' });
    }
  }

  generatePDFPrescricao = async (id) => {
    const { notify } = this.props;
    try {
      const pdfPrescricao = await
      NexoDataService.getPDFPrescricao(id);
      this.setState({ pdfPrescricao, modalPrescricao: true });
    } catch (err) {
      notify('Ocorreu um erro ao tentar gerar o impresso da prescrição.', { variant: 'error' });
    }
  }

  fetchAnamneseEvolucao = async (paciente) => {
    const { unidade, notify, setFieldValue } = this.props;
    try {
      if (paciente) {
        const agendamentosAnamneseEvolucao = await AnamneseService.getAllAnamneses({
          paciente,
          empresa: unidade.id,
        });
        setFieldValue('agendamentosAnamneseEvolucao', agendamentosAnamneseEvolucao);
      }
    } catch (err) {
      console.log(err);
      notify('Não foi possível buscar os cids já registrados', { variant: 'error' });
    }
  }

  onSearchCidChart = async ({ cid }) => {
    const {
      pacienteId, notify, setFieldValue, unidade,
    } = this.props;

    let isPresentCid;
    const agendamentosAnamneseEvolucao = [];

    try {
      const data = await AnamneseService.getAllAnamneses({
        paciente: pacienteId,
        empresa: unidade.id,
      });

      await data.map((agendamento) => {
        isPresentCid = false;
        agendamento.revisoes.map((revisao) => {
          revisao.cids.map((value) => {
            if (value.cid.id.codigo === cid.id.codigo) {
              isPresentCid = true;
            }
          });
        });

        if (isPresentCid === true) {
          agendamentosAnamneseEvolucao.push(agendamento);
        }
      });

      this.setState({ filterAgendamentosAnamneseEvolucao: true });
      setFieldValue('agendamentosAnamneseEvolucao', agendamentosAnamneseEvolucao);
    } catch (error) {
      notify('Não foi possível filtrar os cids já registrados', { variant: 'error' });
    }
  }

  fetchCidsPaciente = async (paciente) => {
    const { unidade, notify, setStatus } = this.props;
    const { options } = this.state;

    if (paciente) {
      try {
        const data = [];
        const categories = [];

        const cids = await AnamneseService.getCidById({
          paciente,
          empresa: unidade.id,
        });

        if (cids.length) {
          cids.map((value) => {
            data.push(value.quantidade);
            categories.push(String(value.cid.id.codigo));
          });

          const series = [{ data, name: 'quantidade' }];

          this.setState({
            chart: true,
            series,
            options: {
              ...options,
              xaxis: {
                ...options.xaxis,
                categories,
              },
              cids,
            },
          });
        } else {
          this.setState({ chart: false });
        }


        setStatus({ updateCidsPaciente: false });
      } catch (err) {
        console.log(err);
        notify('Não foi possível buscar os cids já registrados', { variant: 'error' });
      }
    }
  }

  loadCids = async () => {
    const cid = await AnamneseService.getAllCid({
      codigo: '',
    });

    localStorage.setItem('@clin:cid', JSON.stringify(cid));
  }

  isExistedPaciente = () => {
    const { pacienteId } = this.props;
    return pacienteId && !!Number(pacienteId);
  }


  filterCids = (cid) => {
    const { cidSearch } = this.state;

    if (cidSearch.length < 2) return false;

    if (!String(cidSearch).trim()) return false;

    if (new RegExp(cidSearch, 'ig').test(cid.descricao)) {
      return true;
    }

    if (new RegExp(cidSearch, 'ig').test(cid.id.codigo)) {
      return true;
    }

    return false;
  }


  fetchPaciente = async (state) => {
    const {
      notify, pacienteId, setFieldValue,
    } = this.props;

    if (this.isExistedPaciente()) {
      try {
        const paciente = await PacienteService.getById(pacienteId);
        if (paciente) {
          this.setState({
            paciente: {
              id: paciente.id,
              nome: paciente.nome || '',
              cpf: String(cpfFormatter(paciente.cpf)) || '',
              dataNascimento: moment(paciente.dataNascimento).format('DD/MM/YYYY') || '',
              sexo: paciente.sexo || '',
              telefone: String(telFormatter(paciente.telefone)) || '',
              celular: String(celFormatter(paciente.celular)) || '',
              email: paciente.email || '',
              endereco: paciente.endereco || '',
              enderecoBairro: paciente.enderecoBairro || '',
              enderecoComplemento: paciente.enderecoComplemento || '',
              enderecoNumero: Number(paciente.enderecoNumero) || '',
              // planos: paciente.planos.map(({ plano }) => plano.id),
              planos: paciente.planos
                .map(({ plano: { nomeConvenio } }) => `${nomeConvenio}`).join(', '),
              cep: String(paciente.cep) || '',
              uf: paciente.cidade ? paciente.cidade.estado.uf : '',
              cidade: paciente.cidade ? paciente.cidade.codigoIbge : '',
              idadePorExtenso: paciente.idadePorExtenso,
              alertas: paciente.alertas,
              peso: paciente.peso,
              altura: paciente.altura,
            },
          });
          await sleep(1000);
          if (!this.state.modalPrescricao && !this.state.modalPrescricoesPaciente && paciente.alertas) {
            setFieldValue('alertas', state);
          }
        } else {
          throw new Error();
        }
      } catch (err) {
        notify('Não foi possível buscar os dados do paciente', { variant: 'error' });
      }
    }
  }

  onSearchCid = async (cidSearch = '') => {
    const { notify } = this.props;

    try {
      this.setState({ cidSearch }, async () => {
        const cids = await JSON.parse(localStorage.getItem('@clin:cid'));
        const cid = await cids.filter(this.filterCids);
        this.setState({ cid });
      });
    } catch (err) {
      notify('Falha ao pesquisar códigos cid', { variant: 'error' });
    }
  }

  handleSaveAlertas = async () => {
    const { notify, pacienteId } = this.props;

    try {
      const paciente = await PacienteService.getById(pacienteId);
      const pacienteForm = {
        id: paciente.id,
        nome: paciente.nome || '',
        cpf: String(cpfFormatter(paciente.cpf)) || '',
        dataNascimento: moment(paciente.dataNascimento).format('YYYY-MM-DD') || '',
        sexo: paciente.sexo || '',
        telefone: String(telFormatter(paciente.telefone)) || '',
        celular: String(celFormatter(paciente.celular)) || '',
        email: paciente.email || '',
        endereco: paciente.endereco || '',
        enderecoBairro: paciente.enderecoBairro || '',
        enderecoComplemento: paciente.enderecoComplemento || '',
        enderecoNumero: Number(paciente.enderecoNumero) || '',
        planos: paciente.planos.map(({ plano }) => plano.id),
        cep: String(paciente.cep) || '',
        uf: paciente.cidade ? paciente.cidade.estado.uf : '',
        cidade: paciente.cidade ? paciente.cidade.codigoIbge : '',
        idadePorExtenso: paciente.idadePorExtenso,
        alertas: this.state.paciente.alertas,
      };
      await PacienteService.save(pacienteForm);
      this.handleClose();
      notify('Observações salvas com sucesso', { variant: 'success' });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Houve um problema ao salvar', { variant: 'error' });
      }
    }
  }

  handleDelete = async () => {
    const { notify, values, setFieldValue } = this.props;
    const { itemAnamneseEvolucao } = this.state;

    try {
      const agendamentosAnamneseEvolucao = await AnamneseService.descartarAnamneseEvolucao({
        grupoAnamneseEvolucao: String(itemAnamneseEvolucao.grupoAnamneseEvolucao),
        id: Number(itemAnamneseEvolucao.idPrincipal),
      });

      setFieldValue('agendamentosAnamneseEvolucao', agendamentosAnamneseEvolucao);

      this.setState({ openDrop: false });
      notify(`${(values.anamneseEvolucao ? 'Anamnese' : 'Evolução')} descartada com sucesso`, { variant: 'success' });
    } catch (error) {
      console.log(error);
      notify('Ocorreu um problema ao tentar descartar. ', { variant: 'error' });
    }
  }

  addDefaultSrc = (ev) => {
    ev.target.src = iconPaciente;
  }

  handleClickCancelarEdicao = () => {
    const { history, pacienteId } = this.props;
    history.replace(`/app/pacientes/${pacienteId}/false`);
  }


  filterPrescricoesPaciente = (prescricao) => {
    const { searchPrescricao } = this.state;

    if (!String(searchPrescricao).trim()) return true;

    if (new RegExp(searchPrescricao, 'ig').test(prescricao.Estabelecimento.Nome)) {
      return true;
    }

    if (new RegExp(searchPrescricao, 'ig').test(prescricao.Prescritor.Nome)) {
      return true;
    }

    if (new RegExp(searchPrescricao, 'ig').test(prescricao.Itens.map(({ Nome }) => Nome).join(', '))) {
      return true;
    }

    if (new RegExp(searchPrescricao, 'ig').test(prescricao.Formulas.map(({ farmacos }) => farmacos.map(({ farmaco }) => farmaco).join(', ')))) {
      return true;
    }

    if (new RegExp(searchPrescricao, 'ig').test(moment(prescricao.DataCriacao).format('D [de] MMMM, dddd [às] HH:mm:ss'))) {
      return true;
    }

    return false;
  }

  handleClose = () => {
    const { setFieldValue } = this.props;
    this.setState({ modalPrescricao: false, pdfPrescricao: null, isSubmitting: false });
    setFieldValue('alertas', false);
    setFieldValue('isEditting', false);
  }

  handleChange = (value) => {
    const paciente = { ...this.state.paciente };
    paciente.alertas = value;
    this.setState({ paciente });
  }

  onSelectRevisao = async (revisao) => {
    const { setFieldValue } = this.props;
    const cid = revisao.cids.map(({ cid }) => String(cid.id.codigo));

    this.setState({ openModalRevisao: false });
    setFieldValue('anamneseEvolucao', false);
    setFieldValue('id', revisao.id);
    setFieldValue('grupoAnamneseEvolucao', revisao.grupoAnamneseEvolucao);
    setFieldValue('descricao', revisao.descricao);
    setFieldValue('cid', cid);
  }


  render() {
    const {
      unidade,
      theme,
      classes,
      handleSubmit,
      values,
      errors,
      setFieldValue,
      open,
      handleClose,
      containerHeight,
    } = this.props;

    const {
      idMedico,
      idPaciente,
      isSubmitting,
      searchPrescricao,
      prescricoesPaciente,
      modalPrescricoesPaciente,
      pdfPrescricao,
      modalPrescricao,
      showFloatMenu,
      prescricao,
      chart,
      openModalRevisao,
      cid,
      options,
      series,
      prontuarioVisible,
      paciente,
      revisoes,
      openDrop,
      filterAgendamentosAnamneseEvolucao,
    } = this.state;

    return (
      <Grid>
        {/* <Dialog
          open={open}
          fullScreen
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        > */}
        {open && (
          <Container>
            <Dialog
              maxWidth="90vw"
              maxHeight="90vw"
              open={modalPrescricoesPaciente}
              TransitionComponent={Transition}
              keepMounted
              onClose={() => this.setState({ modalPrescricoesPaciente: false })}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle id="alert-dialog-slide-title" style={{ alignSelf: 'center', whiteSpace: 'pre-wrap' }}>
                {`PRESCRIÇÕES DO PACIENTE ${paciente.nome}`}
              </DialogTitle>
              <DialogContent>

                <DialogContentText style={{
                  minHeight: '50vh', maxHeight: '50vh', minWidth: '65vw', maxWidth: '65vw',
                }}
                >
                  <Grid container spacing={1} justify="center" alignItems="center" direction="row">
                    <Grid item sm={12} md={12} lg={12} style={{ marginBottom: '5vh' }}>
                      <TextField
                        style={{
                          position: 'fixed', backgroundColor: '#fff', maxWidth: '65vw', zIndex: 998,
                        }}
                        placeholder="Procurar..."
                        type="search"
                        margin="normal"
                        fullWidth
                        value={searchPrescricao}
                        onChange={event => this.setState({ searchPrescricao: event.target.value })}
                      />
                    </Grid>
                    {prescricoesPaciente.filter(this.filterPrescricoesPaciente).length ? (
                      <>
                        {prescricoesPaciente.filter(this.filterPrescricoesPaciente).map(prescricao => (
                          <>
                            {(!isEmpty(prescricao.Formulas) || !isEmpty(prescricao.Itens) || !isEmpty(prescricao.ItensManuais)) && (
                              <Grid item container spacing={3} direction="row" style={{ marginTop: 5, marginBottom: 2.5, borderBottom: '2px solid rgba(0, 0, 0, 0.87)' }} sm={12} md={12} lg={12}>
                                <Grid item container direction="column" justify="center" alignItems="center" sm={12} md={12} lg={7}>
                                  <Typography style={{ textAlign: 'center', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                                    {`Prescrição de Industrializados: ${prescricao.Itens.map(({ Nome }) => Nome).join(', ')}
Prescrição de Manipulados: ${prescricao.Formulas.map(({ farmacos }) => farmacos.map(({ farmaco }) => farmaco).join(', '))}
`}
                                  </Typography>
                                  <Typography style={{ textAlign: 'center' }}>
                                    {`${prescricao.Estabelecimento.Nome} - ${moment(prescricao.DataCriacao).format('D [de] MMMM, dddd [às] HH:mm:ss')}`}
                                  </Typography>
                                </Grid>
                                <Grid container item sm={12} md={12} lg={5} justify="flex-end">
                                  <IconButton>
                                    <SearchIcon
                                      color="inherit"
                                      onClick={() => {
                                        this.generatePDFPrescricao(prescricao.idPrescricao);
                                      }}
                                    />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            )}
                          </>
                        ))}
                      </>
                    ) : (
                      <Grid container spacing={3} style={{ minHeight: '50vh' }} alignItems="center" justify="center" direction="row" xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="h6">
                          Nenhum resultado encontrado...
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => this.setState({ modalPrescricoesPaciente: false })}
                  color="default"
                >
                  FECHAR
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              maxWidth="90vw"
              maxHeight="90vw"
              open={modalPrescricao}
              TransitionComponent={Transition}
              keepMounted
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle id="alert-dialog-slide-title" />
              <DialogContent>
                <DialogContentText style={{ minHeight: '90vh', minWidth: '90vw' }}>
                  {!!prescricao && (
                    <Iframe
                      url={pdfPrescricao || `https://mp-homolog.nexodata.com.br/emr/prescricao.aspx?referencia=${prescricao.Referencia}`}
                      height={containerHeight}
                      width="100%"
                    />
                  )}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleClose}
                  color="default"
                >
                  FECHAR
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              maxWidth="90vw"
              maxHeight="90vh"
              open={openModalRevisao}
              TransitionComponent={Transition}
              keepMounted
              onClose={() => this.setState({ openModalRevisao: false })}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle id="alert-dialog-slide-title" style={{ alignSelf: 'center', whiteSpace: 'pre-wrap' }}>
                {`REVISÕES DO PACIENTE ${paciente.nome}`}
              </DialogTitle>
              <DialogContent>

                <DialogContentText style={{
                  minHeight: '90vh', maxHeight: '90vh', minWidth: '90vw', maxWidth: '90vw',
                }}
                >
                  <Grid container spacing={2} justify="center" alignItems="center" direction="row">
                    <Grid item sm={12} md={12} lg={12}>
                      {revisoes.map((item, index) => (
                          <ExpansionPanel key={item.id}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography className={classes.heading}><strong>{`Revisão ${index + 1}/${revisoes.length}: `}</strong>{`${moment(item.dataCadastro).format('DD/MM/YYYY')}`}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails onClick={() => this.onSelectRevisao(item)}>
                              <List dense style={{ width: '100%' }}>
                                  <ListItem
                                    key={item.id}
                                    role={undefined}
                                    dense
                                    button
                                    style={{ width: '100%', overflowX: 'auto' }}
                                  >
                                    <HTMLContainer>
                                      {renderHTML(item.descricao)}
                                    </HTMLContainer>

                                  </ListItem>
                              </List>
                            </ExpansionPanelDetails>
                          </ExpansionPanel>
                        ))}
                    </Grid>


                  </Grid>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => this.setState({ openModalRevisao: false })}
                  color="default"
                >
                  FECHAR
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={open && values.alertas}
              TransitionComponent={Transition}
              keepMounted
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle id="alert-dialog-slide-title">Alertas</DialogTitle>
              <DialogContent>
                <DialogContentText style={{ minWidth: '30vw', minHeight: '20vh', whiteSpace: 'pre-wrap' }}>
                  {!values.isEditting
                    ? (
                      paciente.alertas
                    )
                    : (
                      <Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                          <TextField
                            className={classes.textfield}
                            name="observacoes"
                            id="observacoes"
                            label="Observações"
                            value={paciente.alertas}
                            onChange={({ target: { value } }) => this.handleChange(value)}
                            variant="outlined"
                            type="text"
                            multiline
                            fullWidth
                            rows="8"
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                    )}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                {values.isEditting && (
                  <Button
                    onClick={() => {
                      this.fetchPaciente(false);
                      setFieldValue('isEditting', false);
                    }}
                    color="secondary"
                  >
                    CANCELAR
                  </Button>
                )}

                <Button onClick={!values.isEditting ? () => setFieldValue('isEditting', true) : () => this.handleSaveAlertas()} color="primary">
                  {!values.isEditting ? 'EDITAR' : 'SALVAR'}
                </Button>

                <Button
                  onClick={() => {
                    this.fetchPaciente(false);
                    setFieldValue('isEditting', false);
                    setFieldValue('alertas', false);
                  }}
                  color="default"
                >
                  FECHAR
                </Button>
              </DialogActions>
            </Dialog>

            <Grid container spacing={2}>
              {prontuarioVisible ? (
                <Grid item sm={12} md={12} lg={12}>
                  <Paper className={classes.paper} elevation={5}>
                    <Grid container className={classes.drawerContent}>
                      <Grid container item sm={12} md={12} lg={12} justify="flex-end">
                        <IconButton>
                          <KeyboardArrowUpIcon color="inherit" onClick={() => this.setState({ prontuarioVisible: false })} />
                        </IconButton>
                        <IconButton>
                          <CloseIcon
                            color="inherit"
                            onClick={() => {
                              this.setState({ showFloatMenu: false });
                              handleClose();
                            }}
                          />
                        </IconButton>
                      </Grid>
                      <Grid>
                        <Grid>
                          <img
                            className={classes.picture}
                            src={`${baseURL}/s3/imagem/${bucketPacienteS3}/${paciente.id}`}
                            alt="Foto do Paciente"
                            onError={this.addDefaultSrc}
                          />
                        </Grid>
                      </Grid>

                      <Grid container item sm={12} md={8} lg={8} justify="space-evenly">
                        <DividerVertical />
                        <Grid container item sm={12} md={5} lg={6}>
                          <FieldsetInfo
                            label="Nome"
                            info={paciente.nome}
                          />
                          <FieldsetInfo
                            label="Idade"
                            info={paciente.idadePorExtenso}
                          />
                          <FieldsetInfo
                            label="Plano/Convênio"
                            info={paciente.planos}
                          />
                        </Grid>
                        <Grid container item sm={12} md={5} lg={5}>
                          <FieldsetInfo
                            label="Nascimento"
                            info={paciente.dataNascimento}
                          />
                          <FieldsetInfo
                            label="Sexo"
                            info={paciente.sexo}
                          />
                          <FieldsetInfo
                            label="Telefone"
                            info={paciente.telefone}
                          />

                        </Grid>
                      </Grid>
                    </Grid>
                    {this.isExistedPaciente() && (
                      <Button
                        fullWidth
                        color="default"
                        onClick={this.handleClickCancelarEdicao}
                      >
                        ALTERAR
                      </Button>
                    )}
                  </Paper>
                </Grid>
              ) : (
                <Grid item sm={12} md={12} lg={12}>
                  <Paper className={classes.paper} elevation={5}>
                    <Grid container className={classes.drawerContent}>
                      <Grid container item sm={12} md={4} lg={4}>
                        <FieldsetInfo
                          label="Nome"
                          info={paciente.nome}
                        />
                      </Grid>
                      <Grid container item sm={12} md={4} lg={4}>
                        <FieldsetInfo
                          label="Idade"
                          info={paciente.idadePorExtenso}
                        />
                      </Grid>
                      <Grid container item sm={12} md={4} lg={4} justify="flex-end">
                        <IconButton>
                          <KeyboardArrowDownIcon color="inherit" onClick={() => this.setState({ prontuarioVisible: true })} />
                        </IconButton>
                        <IconButton>
                          <CloseIcon color="inherit" onClick={handleClose} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              <Grid item sm={12} md={12} lg={(chart ? 9 : 12)}>
                <Paper className={[classes.paper, classes.timeline]} elevation={5}>
                  <Grid container direction="row" spacing={1} item sm={12} md={12} lg={12}>
                    <Grid item sm={12} md={12} lg={12}>
                      <Button
                        onClick={() => setFieldValue('alertas', true)}
                        fullWidth
                        variant="contained"
                        size="medium"
                        color="secondary"
                        type="submit"
                      >
                        Alertas
                      </Button>
                    </Grid>
                    <Grid item sm={12} md={12} lg={12}>
                      <Button
                        onClick={() => {
                          setFieldValue('anamneseEvolucao', true);
                        }}
                        fullWidth
                        variant="contained"
                        size="medium"
                        color="secondary"
                        type="submit"
                      >
                        Nova Anamnese
                      </Button>
                    </Grid>
                    {filterAgendamentosAnamneseEvolucao && (
                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          style={{ marginBottom: 10 }}
                          onClick={() => {
                            const { pacienteId } = this.props;
                            this.setState({ filterAgendamentosAnamneseEvolucao: false });
                            this.fetchAnamneseEvolucao(Number(pacienteId));
                          }}
                          fullWidth
                          variant="contained"
                          size="medium"
                          color="white"
                        >
                          LIMPAR FILTRO
                        </Button>
                      </Grid>
                    )}
                  </Grid>


                  <Grid>
                    <Dialog
                      open={openDrop}
                      TransitionComponent={Transition}
                      keepMounted
                      onClose={() => this.setState({ openDrop: false })}
                      aria-labelledby="alert-dialog-slide-title"
                      aria-describedby="alert-dialog-slide-description"
                    >
                      <DialogTitle id="alert-dialog-slide-title">Deseja descartar essa anotação permanentemente?</DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                        Uma vez confirmada, essa operação não poderá ser desfeita.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => this.setState({ openDrop: false })} color="primary">
                        Discordar
                        </Button>
                        <Button onClick={() => this.handleDelete()} color="primary">
                        Concordar
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Grid>

                  <Drawer
                    classes={{ paper: classes.drawer }}
                    anchor="bottom"
                    open={values.anamneseEvolucao === true || values.anamneseEvolucao === false}
                    onClose={() => {
                      setFieldValue('anamneseEvolucao', '');
                    }}
                    disableEnforceFocus
                  >
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      justify="center"
                    >
                      <Grid item sm={12} md={12} lg={12}>
                        <Paper className={classes.paper} elevation={5}>
                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography style={{ fontStyle: 'italic' }} component="h2" variant="h5" color="textPrimary">
                              Ficha de Anamnese
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography style={{ fontStyle: 'italic' }} component="p" variant="body2" color="textSecondary">
                              Para encontrar a classificação que deseja, faça uma pesquisa utilizando o campo de busca.
                            </Typography>
                          </Grid>

                          <Grid item sm={12} md={3} lg={12}>
                            <ModalSelect
                              id="select-cid"
                              label="CID*"
                              multiple
                              type="cid"
                              empty="Nenhum CID encontrado..."
                              error={!!errors.cid}
                              value={values.cid}
                              options={cid.map(item => ({
                                id: item.id.codigo,
                                label: item.id.codigo,
                                subLabel: item.descricao,
                              }))}
                              autoCompleteAsync
                              onSearchAsync={this.onSearchCid}
                              // onChange={value => setFieldValue('cid', value)}
                              onChange={async (value) => {
                                await setFieldValue('cid', value);
                              }}
                              textfieldProps={{
                                variant: 'outlined',
                                fullWidth: true,
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography style={{ fontStyle: 'italic' }} component="p" variant="body2" color="textSecondary">
                              Considerações e observações
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6} md={6} lg={12}>
                            <Editor
                              apiKey={TINY_API_KEY}
                              initialValue={values.descricao}
                              value={values.descricao}
                              init={{
                                height: 400,
                                language: 'pt_BR',
                                language_url: `${process.env.PUBLIC_URL}/js/tinymce/langs/pt_BR.js`,
                                plugins: [
                                  'advlist autolink lists link image charmap print preview anchor',
                                  'searchreplace visualblocks code fullscreen',
                                  'insertdatetime media table paste imagetools wordcount',
                                ],
                                toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                                async images_upload_handler(
                                  blobInfo,
                                  success,
                                  failure,
                                ) {
                                  try {
                                    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
                                    const file = new FormData();
                                    const filename = `${uniqueID()}-${blobInfo.filename()}`;
                                    const key = `anamnese/${unidade.id}/${usuarioLogado.id}/${moment().format('YYYY-MM-DD')}`;
                                    const contentType = 'image/*';
                                    file.append('file', blobInfo.blob(), blobInfo.filename());

                                    await GenericFileService.uploadFile({
                                      bucketFileS3,
                                      filename,
                                      contentType,
                                      file,
                                      key,
                                    });

                                    success(`${baseURL}/s3/file/?bucket=${bucketFileS3}&key=${key}&filename=${filename}`);
                                  } catch (error) {
                                    failure(error);
                                    console.log(error);
                                  }
                                },
                              }}
                              onEditorChange={descricao => setFieldValue('descricao', descricao)}
                            />
                          </Grid>
                          <Button
                            onClick={handleSubmit}
                            fullWidth
                            variant="contained"
                            size="medium"
                            color="secondary"
                            type="submit"
                          >
                            SALVAR ANAMNESE
                          </Button>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Drawer>

                  {values.agendamentosAnamneseEvolucao && (
                    values.agendamentosAnamneseEvolucao.map((agendamento, index) => {
                      agendamento = values.agendamentosAnamneseEvolucao[values.agendamentosAnamneseEvolucao.length - 1 - index];
                      return (
                        <VerticalTimeline>
                          <VerticalTimelineElement
                            className="vertical-timeline-element--work"
                            contentArrowStyle={{ display: 'none' }}
                            position={index % 2 === 1 ? 'right' : 'left'}
                            contentStyle={{
                              background: (agendamento.descartado ? '#dbdbdb' : '#fff'),
                              color: (agendamento.descartado ? '#808080' : '#616161'),
                              width: '100%',
                            }}
                            iconStyle={{ background: '#eb2f37', color: '#fff' }}
                            icon={<Assignment />}
                          >

                            <h3 className="vertical-timeline-element-title">
                              {moment(agendamento.dataCadastro).format('D [de] MMMM, dddd [às] HH:mm:ss')}
                            </h3>
                            <h5 className="vertical-timeline-element-subtitle">
                              <i>
                                Entrevista realizada por
                                {' '}
                                {agendamento.cadastradoPor}
                              </i>
                            </h5>

                            <h4>{agendamento.descricao}</h4>
                            <Grid item sm={12} md={12} lg={12}>
                              <Divider variant="fullWidth" style={{ margin: '20px 0' }} />
                            </Grid>


                            {agendamento.revisoes.map((revisao, index) => {
                              if (agendamento.qtdRevisoes - 1 === index) {
                                return (
                                  <Grid item sm={12} md={12} lg={12} style={{ overflowX: 'auto' }}>
                                    <h4>
                                    Revisão
                                      {' '}
                                      {index + 1}
                                    /
                                      {agendamento.qtdRevisoes}
                                    </h4>

                                    {revisao.cids.map(item => (
                                      <Chip
                                        key={item}
                                        label={item.cid.id.codigo}
                                        clickable
                                        color="secondary"
                                        onClick={() => this.onSearchCidChart(item)}
                                        className={classes.chip}
                                      />
                                    ))}
                                    <HTMLContainer>
                                      {renderHTML(revisao.descricao)}
                                    </HTMLContainer>
                                  </Grid>
                                );
                              }
                            })}


                            {!agendamento.descartado && (
                              <Grid>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  size="medium"
                                  color="secondary"

                                  style={{ marginBottom: 10 }}
                                  onClick={() => {
                                    this.setState({
                                      openDrop: true,
                                      itemAnamneseEvolucao: agendamento,
                                    });
                                  }}
                                >
                                  DESCARTAR
                                </Button>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  size="medium"
                                  color="secondary"

                                  style={{ marginBottom: 10 }}
                                  onClick={() => {
                                    this.setState({
                                      openModalRevisao: true,
                                      revisoes: agendamento.revisoes,
                                    });
                                  }}
                                >
                                  REVISÕES
                                </Button>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  size="medium"
                                  color="secondary"

                                  onClick={() => {
                                    setFieldValue('id', agendamento.idPrincipal);
                                    setFieldValue('grupoAnamneseEvolucao', agendamento.grupoAnamneseEvolucao);
                                    setFieldValue('anamneseEvolucao', false);
                                  }}
                                >
                                NOVA REVISÃO
                                </Button>
                              </Grid>
                            )}
                          </VerticalTimelineElement>
                        </VerticalTimeline>
                      );
                    })
                  )}
                </Paper>
              </Grid>

              {chart && (
              <Grid item style={{ maxHeight: 1000 }} sm={12} md={12} lg={3}>
                <Paper className={classes.paper} elevation={5}>
                  <Grid item sm={12} md={12} lg={12}>

                    <Paper className={classes.paper} elevation={5}>
                      <Grid item sm={12} md={12} lg={12}>
                        <center>Filtro por CID</center>
                        <ReactApexChart options={options} series={series} type="bar" height="350" />
                      </Grid>

                      <Grid item sm={12} md={12} lg={12}>
                        <Divider variant="fullWidth" style={{ margin: '20px 0' }} />
                      </Grid>

                      {/* <Grid item sm={12} md={12} lg={12}>
                        <TagCloud
                          minSize={12}
                          maxSize={35}
                          tags={tagcloud}
                          onClick={({ value }) => alert(value)}
                        />
                      </Grid> */}
                    </Paper>
                  </Grid>
                </Paper>
              </Grid>
              )}
            </Grid>
            <Grow
              in={showFloatMenu}
              style={{ transformOrigin: '0 0 0' }}
              {...(showFloatMenu ? { timeout: 1000 } : {})}
            >
              <Fab
                size="small"
                className={classes.fabItem}
                style={{ bottom: theme.spacing(19), zIndex: 500 }}
                disabled={values.alertas || modalPrescricao || modalPrescricoesPaciente}
                color="secondary"
                onClick={async () => {
                  this.getPrescricoesPaciente();
                  this.setState({ modalPrescricoesPaciente: true, showFloatMenu: false });
                }}
              >
                <Tooltip title="Receituários" placement="left">
                  <FindInPageIcon />
                </Tooltip>
              </Fab>
            </Grow>

            <Grow in={showFloatMenu}>
              <Fab
                size="small"
                className={classes.fabItem}
                disabled={values.alertas || modalPrescricao || modalPrescricoesPaciente || isSubmitting}
                style={{ bottom: theme.spacing(12), zIndex: 500 }}
                color="secondary"
                onClick={() => this.initIntegracao()}
              >
                <Tooltip title="Prescrição Digital" placement="left">
                  <SubjectIcon />
                </Tooltip>
              </Fab>
            </Grow>
            {modalPrescricao || modalPrescricoesPaciente || (
              <Tooltip style={{ zIndex: 500 }} title="Mais opções" placement="left">
                <Fab
                  size="large"
                  className={classes.fab}
                  color="secondary"
                  disabled={values.alertas || !idMedico || !idPaciente || isSubmitting}
                  onClick={() => this.setState({ showFloatMenu: !showFloatMenu })}
                >
                  {showFloatMenu ? <RemoveIcon /> : <AddIcon />}
                </Fab>
              </Tooltip>
            )}
          </Container>
        )}
      </Grid>
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
  withRouter,
  Dimensions(),
  withStyles(Material, { withTheme: true }),
  withFormik({
    displayName: 'Anamnese',
    validateOnChange: false,
    validateOnBlur: false,
    mapPropsToValues: () => ({
      alertas: false,
      isEditting: false,
      anamneseEvolucao: undefined,
      agendamentosAnamneseEvolucao: [],
      cid: [],
      cids: [],
      descricao: '',
      empresa: '',
      id: null,
      grupoAnamneseEvolucao: '',
    }),
    validationSchema: Yup.object().shape({
      descricao: Yup.string().required('Campo obrigatório'),
      cid: Yup.array()
        .required('Campo obrigatório')
        .min(1, 'Mínimo de 1 CID'),
    }),
    handleSubmit: async (values, {
      props, setStatus, setSubmitting, setFieldValue, resetForm,
    }) => {
      try {
        const data = await JSON.parse(localStorage.getItem('@clin:cid'));
        const cids = values.cid.map(id => data.filter(item => item.id.codigo === id)[0]);

        let formAnamneseEvolucao;
        if (values.anamneseEvolucao) {
          formAnamneseEvolucao = {
            anamneseEvolucao: values.anamneseEvolucao,
            cids,
            descricao: values.descricao,
            empresa: Number(props.unidade.empresa.id),
            paciente: Number(props.pacienteId),
          };
        } else {
          formAnamneseEvolucao = {
            anamneseEvolucao: values.anamneseEvolucao,
            cids,
            descricao: values.descricao,
            empresa: Number(props.unidade.empresa.id),
            paciente: Number(props.pacienteId),
            id: values.id,
            grupoAnamneseEvolucao: values.grupoAnamneseEvolucao,
          };
        }
        resetForm();
        const agendamentosAnamneseEvolucao = await AnamneseService.saveAnamneseEvolucao(formAnamneseEvolucao);
        setFieldValue('agendamentosAnamneseEvolucao', agendamentosAnamneseEvolucao);
        props.notify(`${(values.anamneseEvolucao ? 'Anamnese' : 'Evolução')} salva com sucesso`, { variant: 'success' });
        setStatus({ updateCidsPaciente: true });
      } catch (err) {
        setSubmitting(false);
        props.notify('Houve um problema ao salvar', { variant: 'error' });
      }
    },
  }),
)(Anamnese);
