/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable array-callback-return */
/* eslint-disable func-names */
import React, { Component } from 'react';
import { DayPickerSingleDateController } from 'react-dates';
import { VERTICAL_ORIENTATION } from 'react-dates/constants';
import moment from 'moment';
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { compose } from 'redux';
import classNames from 'classnames';
import { orderBy, debounce } from 'lodash';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Grow from '@material-ui/core/Grow';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Schedule from '@material-ui/icons/Schedule';
import Close from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import PersonAdd from '@material-ui/icons/PersonAdd';
import Icon from '@mdi/react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import {
  mdiPagePreviousOutline,
} from '@mdi/js';
import Dimensions from 'react-dimensions';
import { withRouter } from 'react-router-dom';
import {
  cpfFormatter,
} from '../../../libs/utils';
import PacienteService from '../../../services/Paciente';
import TabPanel from '../../../components/TabPanel';
import NotifyAgendamentos from '../../../services/Notify';
import Sockets from '../../../services/ws';
import UsuarioService from '../../../services/Usuario';
import FinanceiroService from '../../../services/Financeiro';
import AgendaService from '../../../services/Agenda';
import GradeHorarioService from '../../../services/GradeHorario';

import ModalSelect from '../../../components/ModalSelect';
import LoadingIndicator from '../../../components/LoadingIndicator';
import FormCadastroPaciente from '../../../components/FormCadastroPaciente';
import FormNovoAgendamento from './components/FormNovoAgendamento';
import FormNovoEncaixe from './components/FormNovoEncaixe';
import DetalhesAgendamento from './components/DetalhesAgendamento';
import ListaHorarios from './components/ListaHorarios';
import ListaCaixa from './components/ListaCaixa';
import ListaRecibos from './components/ListaRecibos';
import GerarGuia from './components/GerarGuia';

import HorariosDisponiveis from './components/HorariosDisponiveis';

import NotificationActions from '../../../store/ducks/notifier';
import {
  RECEPCAO,
  ADMINISTRADOR,
  ADMINISTRADOR_GLOBAL,
} from '../../../libs/permissoes';
import { Container } from '../../../styles/global';
import Material from './styles';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const hasPermission = (...menuPermissions) => {
  const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));

  if (!usuario) {
    return false;
  }

  const { permissoes: userPermissions } = usuario;

  if (!menuPermissions || menuPermissions.length === 0) {
    return true;
  }

  return menuPermissions.some(menuPermission => userPermissions
    .some(userPermission => menuPermission === userPermission.nome));
};


class Agendamento extends Component {
  constructor(props) {
    super(props);
    this.fetchSearchPaciente = debounce(this.fetchSearchPaciente, 400);

    const { unidade } = props;
    let unidadeId = null;

    if (unidade && unidade.id) {
      unidadeId = unidade.id;
    }

    this.state = {
      openTabRecibos: true,
      isSubmitting: false,
      tabsRecepcao: [
        {
          label: 'GERAR GUIA',
          icon: <AssignmentIndIcon />,
          id: 'tab-gerar-guia',
        },
        {
          label: 'CAIXA',
          icon: <AttachMoneyIcon />,
          id: 'tab-caixa',
        },
        {
          label: 'RECIBOS',
          icon: <AssignmentIcon />,
          id: 'tab-recibos',
        },
      ],
      dataCaixaRecepcao: '',
      dataRecibo: '',
      openTabCaixaRecepcao: false,
      paciente: null,
      agendamentosPaciente: [],
      searchFilterInput: '',
      agendamentos: [],
      openModalAgendamentos: false,
      searchPaciente: '',
      tabValue: 0,
      loading: false,
      agendaMedicos: [],
      agendaMedico: '',
      dataAgendamento: moment(),
      dataAgendamentoFocus: false,
      horariosAgenda: [],
      modalHorarios: false,
      modalPaciente: false,
      showFloatMenu: false,
      openDetalhesAgendamento: false,
      openFormNovoAgendamento: false,
      openFormNovoEncaixe: false,
      horarioAgenda: {},
      regras: {},
      disponibilidades: {
        dataInicial: moment(new Date()).subtract(1, 'M').startOf('M').format('YYYY-MM-DD'),
        dataFinal: moment(new Date()).add(1, 'M').endOf('M').format('YYYY-MM-DD'),
        datasDisponiveis: [],
        datasIndisponiveis: [],
      },
      caixasRecepcao: {
        dataInicial: moment(new Date()).subtract(1, 'M').startOf('M').format('YYYY-MM-DD'),
        dataFinal: moment(new Date()).add(1, 'M').endOf('M').format('YYYY-MM-DD'),
        datasAbertas: [],
        datasFinalizadas: [],
      },
      caixaRecepcao: [],
      socketAgenda: null,
      timeoutSocketEditando: null,
      openCaixa: null,
    };
  }

  async componentDidMount() {
    const { unidade } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    await this.setState({
      agendaMedico: usuarioLogado.medico ? usuarioLogado.id : '',
      socketAgenda: await Sockets.socketAgenda(unidade.id),
    });
    this.fetchMedicos();
  }

  async componentDidUpdate(prevProps, prevState) {
    const {
      openDetalhesAgendamento, socketAgenda, agendaMedico, dataAgendamento, dataCaixaRecepcao, openFormNovoAgendamento, tabValue,
    } = this.state;
    const { unidade } = this.props;

    if (openDetalhesAgendamento !== prevState.openDetalhesAgendamento) {
      this.setState({ showFloatMenu: false });
    }

    if (
      (agendaMedico !== prevState.agendaMedico)
      || (!moment(dataAgendamento).isSame(prevState.dataAgendamento))
      || (unidade !== prevProps.unidade)
    ) {
      /**
       * Realiza as seguintes chamadas de funções quando altera o
       * médico, a data selecionada no calendario ou unidade da clinica
       */

      if (agendaMedico) {
        await Promise.all([
          this.fetchDisponibilidadesAgenda(),
        ]);
      }
      await this.fetchMedicos();
      await this.fetchUpdateAgenda();

      if (socketAgenda) {
        await socketAgenda.disconnect();
        await this.setState({ socketAgenda: await Sockets.socketAgenda(unidade.id) });
      }
      await this.connectSocketAgendas();
    }

    if (
      (prevState.openFormNovoAgendamento !== openFormNovoAgendamento)
    ) {
      /**
       * Emite via WS se o usuario está manipulando uma determinada agenda
       */
      this.emitSocketEditandoAgendamento(prevState.horarioAgenda);
    }

    if (tabValue === 1 && tabValue !== prevState.tabValue) {
      this.fetchPacientesAgendamentos();
    }

    if (tabValue === 2 && tabValue !== prevState.tabValue) {
      this.setState({ openTabCaixaRecepcao: false, dataCaixaRecepcao: '' });
      await this.abrirCaixaRecepcao();
      this.fetchCaixaRecepcao();
    }

    if ((tabValue === 2 && unidade !== prevProps.unidade) || (dataCaixaRecepcao && dataCaixaRecepcao !== prevState.dataCaixaRecepcao)) {
      if (unidade !== prevProps.unidade) {
        this.setState({ dataCaixaRecepcao: '' });
        this.setState({ openTabCaixaRecepcao: false });
        this.fetchCaixaRecepcao();
      }
      if (dataCaixaRecepcao && dataCaixaRecepcao !== prevState.dataCaixaRecepcao) {
        this.fetchCaixa();
      }
    }
  }

  componentWillUnmount() {
    const { socketAgenda } = this.state;
    /**
     * Desconecta do WS clin-agenda
     */
    if (socketAgenda) {
      socketAgenda.disconnect();
    }
  }

  fetchCaixa = async () => {
    const { unidade, notify } = this.props;
    const { dataCaixaRecepcao } = this.state;
    try {
      const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
      const caixaRecepcao = await FinanceiroService.buscaCaixaLancamento({
        date: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
      });
      this.setState({ openTabCaixaRecepcao: true, caixaRecepcao });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível buscar o caixa do dia selecionado.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }

  handleNotify = async () => {
    const { dataAgendamento, agendaMedico } = this.state;
    const { notify, unidade } = this.props;

    try {
      this.setState({ isSubmitting: true });
      const formNotify = {
        medico: agendaMedico,
        empresaUnidade: unidade.id,
        date: moment(dataAgendamento, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      };

      await NotifyAgendamentos.notifyMeusAgendamentos(formNotify);
      notify('Envio realizado com sucesso', { variant: 'success' });
    } catch (error) {
      console.log(error);
      notify('Não foi possível realizar o envio', { variant: 'error' });
    } finally {
      this.setState({ isSubmitting: false });
    }
  }

  onCompleteUpdate = async () => {
    const { unidade, notify } = this.props;
    const { dataCaixaRecepcao } = this.state;
    try {
      const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
      const caixaRecepcao = await FinanceiroService.buscaCaixaLancamento({
        date: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
      });
      this.setState({ openTabCaixaRecepcao: true, caixaRecepcao });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível realizar a ação.', { variant: 'warning', autoHideDuration: 5000 });
      }
    }
  }

  abrirCaixaRecepcao = async () => {
    const { unidade, notify } = this.props;
    try {
      const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
      await FinanceiroService.buscaCaixaLancamento({
        date: moment().format('YYYY-MM-DD'),
        empresaUnidade: unidade.id,
        usuarioLogado: usuarioLogado.id,
      });
      await this.setState({ openCaixa: true });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível abrir o caixa.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }

  fetchCaixaRecepcao = async () => {
    const {
      caixasRecepcao: { dataInicial, dataFinal },
    } = this.state;
    const { notify, unidade } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    try {
      const { datasAbertas, datasFinalizadas } = await FinanceiroService
        .getCaixasRecepcao({
          dataInicial,
          dataFinal,
          empresaUnidade: unidade.id,
          usuarioLogado: usuarioLogado.id,
        });
      this.setState(({ caixasRecepcao }) => ({
        caixasRecepcao: {
          ...caixasRecepcao,
          datasAbertas: datasAbertas && datasAbertas.length > 0
            ? datasAbertas.map(data => moment(data))
            : [],
          datasFinalizadas: datasFinalizadas && datasFinalizadas.length > 0
            ? datasFinalizadas.map(data => moment(data))
            : [],
        },
      }));
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível buscar os lançamentos do caixa', { variant: 'error' });
      }
    }
  }

  fetchSearchPaciente = async (searchPaciente) => {
    const { notify } = this.props;
    if (!String(searchPaciente).trim()) return;

    try {
      const pacientes = await PacienteService.getAllByDay(searchPaciente);

      this.setState({
        pacientes: pacientes.map(paciente => ({
          ...paciente,
          cpfLabel: cpfFormatter(paciente.cpf),
          telefoneLabel: cpfFormatter(paciente.telefone),
          planosLabel: paciente.planos
            .map(({ plano: { nome, nomeConvenio } }) => `${nomeConvenio} - ${nome}`).join(', '),
        })),
      });
    } catch (err) {
      notify('Não foi possível buscar os dados do paciente', { variant: 'error', autoHideDuration: 5000 });
    }
  }

  fetchMedicos = async () => {
    const { notify, unidade } = this.props;

    if (!unidade.id) {
      return;
    }

    try {
      this.setState({ loading: true });
      const agendaMedicos = await UsuarioService.search(true, true, unidade.id);

      await this.setState({ agendaMedicos });
    } catch (err) {
      notify('Erro ao buscar lista de médicos', { variant: 'error' });
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Agrupa as chamadas à API relacionadas ao horario da agenda
   * e às disponibilidades dos dias no calendário da agenda
   */
  fetchUpdateAgenda = async () => {
    try {
      this.setState({ loading: true, horariosAgenda: [] });
      /**
       * Chamada feita em concorrência
       */
      await Promise.all([
        this.fetchHorariosAgenda(),
      ]);
    } catch (err) {
      throw new Error(err);
    } finally {
      this.setState({ loading: false });
    }
  }

  filterUsuarios = (usuario) => {
    const { searchPaciente } = this.state;

    if (!String(searchPaciente).trim()) return true;

    if (new RegExp(searchPaciente, 'ig').test(usuario.nome)) {
      return true;
    }

    if (new RegExp(searchPaciente, 'ig').test(usuario.email)) {
      return true;
    }

    return false;
  }

  handleChangeSearch = async (event) => {
    await this.setState(({ searchPaciente: event.target.value }));
  }

  handleToggleUsuarioStatus = (usuario, index) => async () => {
    const { notify, setUsuario } = this.props;

    try {
      const responseUsuario = await UsuarioService.atualizarStatus(usuario.id);

      setUsuario(responseUsuario, index);
    } catch (err) {
      notify('Não foi possível alterar o status', { variant: 'error' });
    }
  }


  /**
   * Busca os horários que serão exibidos na agenda de acordo com
   * o médico e dia selecionado.
   */
  fetchHorariosAgenda = async () => {
    const { notify, unidade } = this.props;
    const { agendaMedico, dataAgendamento } = this.state;

    if (!agendaMedico || !unidade.id) {
      return;
    }

    try {
      const { horariosAgenda } = await AgendaService.pesquisarHorariosAgenda({
        empresaUnidade: unidade.id, // Necessário informar a unidade que deseja buscar os horários
        usuario: agendaMedico,
        data: moment(dataAgendamento).format('YYYY-MM-DD'),
      });

      this.setState({
        horariosAgenda: orderBy(horariosAgenda.map(this.sanitizeAgendamento), 'startDate'), // Ordena os horários na agenda
      });
    } catch (err) {
      notify('Não foi possível buscar os horários', { variant: 'error' });
    }
  }

  /**
   * Busca as regras da agenda selecionada para
   * validar o cadastro de um agendamento
   */
  fetchGradeHorarioRegras = async () => {
    const {
      notify,
      unidade,
    } = this.props;
    const { horarioAgenda } = this.state;

    try {
      const regras = await GradeHorarioService.pesquisarRegras({
        empresaUnidade: unidade.id,
        usuario: horarioAgenda.medico.id,
        data: horarioAgenda.data,
        hora: moment(horarioAgenda.startDate).format('HH:mm'),
      });

      if (regras && regras.id) {
        this.setState({ regras });
      }
    } catch (err) {
      notify('Erro ao buscar regras do agendamento', { variant: 'error' });
    }
  }

  /**
   * Busca as disponibilidades da agenda para
   * visulizar no calendario os dias com/sem
   * agendamentos disponíveis
   */
  fetchDisponibilidadesAgenda = async () => {
    const {
      agendaMedico,
      disponibilidades: { dataInicial, dataFinal },
    } = this.state;
    const { notify, unidade } = this.props;


    if (!agendaMedico || !dataInicial || !dataFinal) return;

    try {
      const { datasDisponiveis, datasIndisponiveis } = await AgendaService
        .pesquisarDisponibilidades({
          dataInicial,
          dataFinal,
          empresaUnidade: unidade.id,
          usuario: agendaMedico,
        });

      this.setState(({ disponibilidades }) => ({
        disponibilidades: {
          ...disponibilidades,
          /**
           * Realiza um map das datas retornadas pela API para
           * trabalhar com instancias do moment
           */
          datasDisponiveis: datasDisponiveis && datasDisponiveis.length > 0
            ? datasDisponiveis.map(data => moment(data))
            : [],
          datasIndisponiveis: datasIndisponiveis && datasIndisponiveis.length > 0
            ? datasIndisponiveis.map(data => moment(data))
            : [],
        },
      }));
    } catch (err) {
      notify('Não foi possível buscar as disponibilidades da agenda', { variant: 'error' });
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Método que computa algumas propriedades a mais
   * no DTO fornecido pelo endpoint
   */
  sanitizeAgendamento = (
    {
      data, horaInicial, horaFinal, ...rest
    },
    // index,
    // arrayAgendamentos,
  ) => {
    const { agendaMedicos, agendaMedico } = this.state;

    return {
      ...rest,
      data,
      horaInicial,
      horaFinal,
      startDate: moment(`${data}T${horaInicial}`).toDate(),
      endDate: moment(`${data}T${horaFinal}`).toDate(),
      medico: agendaMedicos.find(medico => medico.id === agendaMedico),
      mensagemEditando: null,
    };
  }

  /**
   * Realiza a conexão WS com o clin-agenda
   */
  connectSocketAgendas = async () => {
    const { socketAgenda } = this.state;
    const { unidade } = this.props;

    if (!socketAgenda) return;

    await socketAgenda.open();

    this.listenSocketEvents(socketAgenda, unidade);
  }

  /**
   * Métodos para escutar os eventos WS do clin-agenda
   */
  listenSocketEvents = (socket, unidade) => {
    const { agendaMedico: medicoId } = this.state;

    /**
     * Evento WS que escuta as agendas salvas através do ID do médico
     */
    socket.on(`salva.${medicoId}`, (agendas) => {
      if (!agendas.find(Boolean).encaixe) {
        if (agendas.length === 1) {
          /**
           * Lista de agendas salvas contendo apenas 1 agendas
           */

          const [agenda] = agendas;
          this.handleNovoAgendamento(agenda);
        } else {
          /**
           * Lista de agendas salvas contendo 2 ou mais agendas
           */
          this.handleNovoAgendamentoEstendido(agendas);
        }
      } else {
        this.fetchHorariosAgenda();
      }
    });

    /**
     * Evento WS que escuta as agendas canceladas/excluídas
     * através do ID do médico
     */
    socket.on(`cancela.${medicoId}`, (agendas) => {
      if (agendas.length === 1) {
        /**
         * Lista de agendas canceladas contendo apenas 1 agendas
         */
        const [agenda] = agendas;
        this.handleDeleteAgendamento(agenda);
      } else {
        /**
         * Lista de agendas canceladas contendo 2 ou mais agendas
         */
        this.handleDeleteAgendamentoEstendido(agendas);
      }
    });

    /**
     * Evento WS para escutar agendas sendo manipuladas por
     * outro usuário
     */
    socket.on(`editando.unidade.${unidade.id}.medico.${medicoId}`, (payload) => {
      this.handleEditandoAgendamento(payload);
    });
  }

  fetchAgendamentosPaciente = async (event, paciente) => {
    const { unidade, notify } = this.props;
    try {
      const agendamentos = await AgendaService.pesquisarHorariosPaciente({
        empresaUnidade: unidade.id,
        dataInicial: moment().format('YYYY-MM-DD'),
        dataFinal: moment().format('YYYY-MM-DD'),
        paciente: paciente.id || undefined,
        nomePaciente: paciente.nome,
      });
      this.setState({ agendamentos, openModalAgendamentos: true, paciente });
    } catch (error) {
      notify('Não foi possível a lista de agendamentos do dia', { variant: 'error' });
    }
  }


  fetchPacientesAgendamentos = async () => {
    const { unidade, notify } = this.props;

    try {
      await this.abrirCaixaRecepcao();
      if (this.state.openCaixa) {
        const agendamentosPaciente = await PacienteService.getAllByDay({
          empresaUnidade: unidade.id,
          date: moment().format('YYYY-MM-DD'),
        });
        if (agendamentosPaciente) {
          this.setState({ agendamentosPaciente });
        } else {
          notify('Não foi encontrado nenhum paciente', { variant: 'error' });
        }
      }
    } catch (err) {
      const error = 'Não foi possível buscar os agendamentos';
      notify(error, { variant: 'error' });
    }
  }


  /**
   * Emite um evento WS quando uma agenda
   * está sendo manipulada
   */
  emitSocketEditandoAgendamento = (prevHorarioAgenda) => {
    const { socketAgenda } = this.state;

    if (!socketAgenda.connected) return;

    const { agendaMedico: usuarioId } = this.state;
    const { horarioAgenda: { data, horaInicial }, openFormNovoAgendamento } = this.state;
    const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));
    let payload;

    /**
     * Verifica se o form de agendamento foi aberto
     */
    if (openFormNovoAgendamento) {
      payload = {
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        medicoId: usuarioId,
        data,
        hora: horaInicial,
        isEditando: openFormNovoAgendamento,
      };
    } else {
      payload = {
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        medicoId: usuarioId,
        data: prevHorarioAgenda.data,
        hora: prevHorarioAgenda.horaInicial,
        isEditando: openFormNovoAgendamento,
      };
    }

    socketAgenda.emit('editando', payload);
  }

  /**
   * Escuta a mudança de seleção da data no calendário
   * para atualizar o range de visualização
   */
  handleNavigateCalendar = async (momentInstance) => {
    /**
     * Necessário o uso do await para buscar a disponibilidade
     * da agenda somente após atribuir os valors ao state
     */
    await this.setState(state => ({
      loading: true,
      disponibilidades: {
        ...state.disponibilidades,
        /**
         * Subtrai um mês do dia selecionado no caledário
         * e configura a dataInicial para o primeiro dia desse mês
         */
        dataInicial: momentInstance.startOf('M').format('YYYY-MM-DD'),
        /**
         * Soma dois meses do dia selecionado no calendário
         * e configura a dataFinal para o último dia desse mês
         */
        dataFinal: momentInstance.add(1, 'M').endOf('M').format('YYYY-MM-DD'),
      },
    }));
    this.fetchDisponibilidadesAgenda();
  }

  handleNavigateCalendarCaixaRecepcao = async (momentInstance) => {
    await this.setState(state => ({
      caixasRecepcao: {
        ...state.caixasRecepcao,
        dataInicial: momentInstance.subtract(1, 'M').startOf('M').format('YYYY-MM-DD'),
        dataFinal: momentInstance.add(2, 'M').endOf('M').format('YYYY-MM-DD'),
      },
    }));
    this.fetchCaixaRecepcao();
  }

  /**
   * Lida com a mudança no select de médicos
   */

  /**
   * Método que lida com um novo agendamento
   * disparado pelo WebSocket
   */
  handleNovoAgendamento = (agendamento) => {
    const { agendaMedico: usuarioId } = this.state;
    if (!agendamento || !agendamento.id) {
      return;
    }

    if (agendamento.id.usuario.id !== usuarioId) {
      return;
    }

    const { horariosAgenda } = this.state;
    const novosHorariosAgenda = [...horariosAgenda];

    /**
     * Verifica se é um encaixe
     */
    if (agendamento.encaixe) {
      /**
       * Verifica se a agenda mostrada na View está
       * na mesma data do agendamento recebido pelo WS
       */
      const isAgendaMesmaData = novosHorariosAgenda
        .some(horario => horario.data === agendamento.id.data);

      if (isAgendaMesmaData) {
        novosHorariosAgenda.push(this.sanitizeAgendamento({
          agenda: agendamento,
          data: agendamento.id.data,
          horaInicial: agendamento.id.hora,
          horaFinal: agendamento.id.hora,
        }));
        this.setState({ horariosAgenda: orderBy(novosHorariosAgenda, 'startDate') }, this.fetchDisponibilidadesAgenda);
      }
      return;
    }

    const horarioAgendaIndex = novosHorariosAgenda
      .findIndex(horario => (agendamento.id.data === horario.data)
    && (agendamento.id.hora === horario.horaInicial));

    if (horarioAgendaIndex !== -1) {
      /**
       * Atualiza a agenda caso ela tenha sido encontrada na lista
       */
      const horarioAgenda = {
        ...novosHorariosAgenda[horarioAgendaIndex],
        agenda: agendamento,
      };

      novosHorariosAgenda.splice(horarioAgendaIndex, 1, horarioAgenda);
    }

    /**
     * Após atribuir o os novos agendamentos atualizados ao state
     * utilizo o callback do setState para chamar o método de buscar
     * as disponibilidades da agenda
     */
    this.setState({ horariosAgenda: novosHorariosAgenda }, this.fetchDisponibilidadesAgenda);
  }

  /**
   * Lida com um novo agendamento disparado pelo
   * WebSocket, porém este agendamento ocupa 2 ou mais agendas
   */
  handleNovoAgendamentoEstendido = async (agendamentos) => {
    const { agendaMedico: usuarioId } = this.state;

    if (agendamentos.find(Boolean).id.usuario.id !== usuarioId) {
      return;
    }

    const { horariosAgenda } = this.state;
    const grupoAgendamentoLength = agendamentos.length;
    const [primeiroAgendamento, segundoAgendamento] = agendamentos;
    const momentInstancePrimeiroAgendamento = moment(`${primeiroAgendamento.id.data} ${primeiroAgendamento.id.hora}`);
    const momentInstanceSegundoAgendamento = moment(`${segundoAgendamento.id.data} ${segundoAgendamento.id.hora}`);
    /**
     * Realiza o cálculo para encontrar a duração total do evento de acordo com a regra
     * determinada pela regra da grade horário desta agenda em minutos,
     * encontrando assim a duração padrão entre as agendas e multiplicando pelo número
     * de agendas que este agendamento está ocupando
     */
    const duracaoEvento = momentInstanceSegundoAgendamento.diff(momentInstancePrimeiroAgendamento, 'minutes') * grupoAgendamentoLength;
    /**
     * Verifica se a agenda mostrada na View está
     * na mesma data do agendamento recebido pelo WS
     */
    const isAgendaMesmaDataIndex = horariosAgenda
      .findIndex(horarioAgenda => horarioAgenda.horaInicial === primeiroAgendamento.id.hora
        && horarioAgenda.data === primeiroAgendamento.id.data);

    if (isAgendaMesmaDataIndex !== -1) {
      const horarioAgendaEstendidaIndex = horariosAgenda
        .findIndex(horarioAgenda => horarioAgenda.agenda
          && (horarioAgenda.agenda.grupoAgendamento === primeiroAgendamento.grupoAgendamento));
      /**
       * Verifica na agenda se este agendamento
       * estendido se encontra na lista
       */
      if (horarioAgendaEstendidaIndex !== -1) {
        /**
         * Atualiza os dados dessa agenda caso ele tenha
         * sido encontrado na lista
         */
        await horariosAgenda.splice(horarioAgendaEstendidaIndex, 1, {
          ...horariosAgenda[horarioAgendaEstendidaIndex],
          agenda: primeiroAgendamento,
        });
      } else {
        const agendamentoEstendido = await this.sanitizeAgendamento({
          agenda: primeiroAgendamento,
          data: primeiroAgendamento.id.data,
          horaInicial: primeiroAgendamento.id.hora,
          horaFinal: moment(`${primeiroAgendamento.id.data} ${primeiroAgendamento.id.hora}`)
            .add(duracaoEvento, 'minutes').format('HH:mm'),
        });

        /**
         * Adiciona o agendamento estendido na lista caso nào
         * tenha sido encontrado, mesclando as agendas na qual
         * ele ocupa
         */
        await horariosAgenda.splice(isAgendaMesmaDataIndex, grupoAgendamentoLength, agendamentoEstendido);
      }
      this.setState({ horariosAgenda });
    }
  }

  /**
   * Lida com um agendamento cancelado/excluído
   * disparado pelo WS
   */
  handleDeleteAgendamento = (agendamento) => {
    if (!agendamento || !agendamento.id) {
      return;
    }
    const { horariosAgenda } = this.state;
    const novosHorariosAgenda = [...horariosAgenda];

    /**
     * Verifica se é um encaixe
     */
    if (agendamento.encaixe) {
      this.setState({
        horariosAgenda: novosHorariosAgenda
          .filter(horario => horario.data === agendamento.id.data
            && (horario.horaInicial !== agendamento.id.hora
            && horario.horaFinal !== agendamento.id.hora)),
      }, this.fetchDisponibilidadesAgenda);
      return;
    }

    const horarioAgendaIndex = novosHorariosAgenda
      .findIndex(horario => (agendamento.id.hora === horario.horaInicial)
      && (agendamento.id.data === horario.data));

    /**
     * Verifica se a data do agendamento se encontra
     * na View para realizar a atulização
     */
    if (horarioAgendaIndex !== -1) {
      const agendamentoHora = novosHorariosAgenda[horarioAgendaIndex];
      agendamentoHora.agenda = null;
      novosHorariosAgenda.splice(horarioAgendaIndex, 1, agendamentoHora);
    }
    this.setState({ horariosAgenda: novosHorariosAgenda }, this.fetchDisponibilidadesAgenda);
  }

  /**
   * Lida com 2 ou mais agendamentos cancelados/excluídos
   * disparados via WS
   */
  handleDeleteAgendamentoEstendido = (agendamentos) => {
    const agendamentoFirst = agendamentos[0];
    const { horariosAgenda } = this.state;
    const segundoAgendamento = moment(`${agendamentos[1].id.data} ${agendamentos[1].id.hora}`);
    const primeiroAgendamento = moment(`${agendamentos[0].id.data} ${agendamentos[0].id.hora}`);
    /**
     * Realiza o cálculo para encontrar a duração entre duas agendas de acordo
     * com a regra determinada na grade horário
     */
    const duracao = segundoAgendamento.diff(primeiroAgendamento, 'minutes');

    const horarioAgendaEstendidaIndex = horariosAgenda
      .findIndex(({ agenda }) => agenda
        && (agenda.grupoAgendamento === agendamentoFirst.grupoAgendamento));

    /**
     * Verifica se o agendamento se encontra
     * na agenda da View
     */
    if (horarioAgendaEstendidaIndex !== -1) {
      /**
       * Mapeia os agendamentos recebidos via WS para montar a View
       * removendo os dados da agenda
       */
      const horariosAgendaDisponiveis = agendamentos.map(agenda => this.sanitizeAgendamento({
        agenda: null,
        data: agenda.id.data,
        horaInicial: agenda.id.hora,
        /**
         * Aplica a horaFinal somando a duração calculada anteriormente
         */
        horaFinal: moment(`${agenda.id.data} ${agenda.id.hora}`).add(duracao, 'minutes').format('HH:mm'),
      }));

      /**
       * Aplica as agendas mapeadas ao array da agenda da View
       * removendo o agendamento estendido (agendas mescladas anteriormente)
       */
      horariosAgenda.splice(
        horarioAgendaEstendidaIndex,
        1,
        ...horariosAgendaDisponiveis,
      );

      this.setState({ horariosAgenda });
    }
  }

  /**
   * Lida com o evento WS disparado quando
   * uma agenda está sendo manipulada por outro usuário
   */
  handleEditandoAgendamento = (socketPayload) => {
    const { notify } = this.props;
    const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));

    if (socketPayload.usuarioId === usuario.id) {
      return;
    }

    const {
      horariosAgenda,
      horarioAgenda,
      openFormNovoAgendamento,
      timeoutSocketEditando,
    } = this.state;

    /**
     * Limpa/Reseta o timeout atribuído anteriormente
     */
    if (timeoutSocketEditando) {
      clearTimeout(timeoutSocketEditando);
      this.setState({ timeoutSocketEditando: null });
    }

    /**
     * Verifica se o form de agendamento está aberto
     * e a agenda que está sendo manipulada é a mesma
     */
    if (horarioAgenda
      && openFormNovoAgendamento
      && (horarioAgenda.data === socketPayload.data)
      && (horarioAgenda.horaInicial === socketPayload.hora)) {
      this.handleCloseNovoAgendamento();
      notify(`${socketPayload.usuarioNome} tentou agendar este horário também...`, { variant: 'warning', autoHideDuration: 4500 });
      return;
    }

    const horarioAgendaIndex = horariosAgenda
      .findIndex(horario => (horario.horaInicial === socketPayload.hora)
      && (horario.data === socketPayload.data));

    /**
     * Verifica se o horário que está sendo editado está
     * contido na View da agenda
     */
    if (horarioAgendaIndex !== -1) {
      const agendamentoEditando = horariosAgenda[horarioAgendaIndex];
      /**
       * Atribuição da mensagem ao dado da agenda caso esteja editando
       */
      agendamentoEditando.mensagemEditando = socketPayload.isEditando
        ? `${socketPayload.usuarioNome} está editando...`
        : null;
      horariosAgenda.splice(horarioAgendaIndex, 1, agendamentoEditando);

      /**
       * Cria um timeout para o desbloqueio desta agenda após 30 segundos
       */
      const timeout = setTimeout(() => {
        /**
         * Disponibiliza a manipulação desta agenda após 30 segundos
         */
        agendamentoEditando.mensagemEditando = null;
        horariosAgenda.splice(horarioAgendaIndex, 1, agendamentoEditando);
        this.setState({ horariosAgenda });
      }, 30000);
      this.setState({ horariosAgenda, timeoutSocketEditando: timeout });
    }
  }

  handleCloseNovoAgendamento = () => {
    this.setState({
      openFormNovoAgendamento: false,
      horarioAgenda: {},
    });
  }


  handleTabChange = (event, tabValue) => {
    this.setState({ tabValue });
  }

  handleOpenNovoAgendamento = (horarioAgenda) => {
    this.setState({
      openFormNovoAgendamento: true,
      horarioAgenda,
    }, this.fetchGradeHorarioRegras);
  }

  handleDoubleClickRowHorario = (event, horarioAgenda) => {
    if (!horarioAgenda.agenda) {
      this.handleOpenNovoAgendamento(horarioAgenda);
    }
  }

  handleCloseVisulizarAgendamento = () => {
    this.setState({
      openDetalhesAgendamento: false,
      horarioAgenda: {},
    });
  }


  openVisualizarAgendamento = (horarioAgenda) => {
    this.setState({
      openDetalhesAgendamento: true,
      horarioAgenda,
    });
  }

  handleOpenNovoEncaixe = () => {
    this.setState({ openFormNovoEncaixe: true, showFloatMenu: false });
  }

  handleClosenNovoEncaixe = () => {
    this.setState({ openFormNovoEncaixe: false });
  }

  handleCloseHorariosDisponiveis = () => {
    this.setState({ modalHorarios: false });
    this.fetchHorariosAgenda();
  }

  handleClickRowHorario = (event, horarioAgenda) => {
    if (horarioAgenda.agenda) {
      this.openVisualizarAgendamento(horarioAgenda);
    }
  }

  onChangePicture = async () => {
    await this.setState({ openDetalhesAgendamento: false, horariosAgenda: [] });
    this.fetchHorariosAgenda();
  }

  onRemoveLancamento = async (lancamento) => {
    const { unidade, notify } = this.props;
    const { dataCaixaRecepcao } = this.state;
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));
    try {
      await FinanceiroService.excluirLancamento({
        lancamento: lancamento.id,
        id: {
          data: moment(dataCaixaRecepcao).format('YYYY-MM-DD'),
          empresa: unidade.empresa_id,
          usuarioLogado: usuarioLogado.id,
          empresaUnidade: unidade.id,
        },
      });
      this.fetchCaixa();
      notify('Lançamento excluído com sucesso.', { variant: 'success', autoHideDuration: 5000 });
    } catch (err) {
      if (err && err.response) {
        notify(err.response.data, { variant: 'error', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível excluir o lançamento', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }

  handleChangeSearchPaciente = (event) => {
    this.setState({ searchPaciente: event.target.value });
    this.fetchSearchPaciente(event.target.value);
  }

  filterAgendamentosPaciente = (paciente) => {
    const { searchFilterInput } = this.state;

    if (!String(searchFilterInput).trim()) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(paciente.nome)) {
      return true;
    }
    return false;
  }

  render() {
    const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));

    const {
      classes, theme, isChatOpen, containerHeight,
    } = this.props;
    const {
      dataRecibo,
      openTabRecibos,
      isSubmitting,
      tabsRecepcao,
      agendamentosPaciente,
      agendamentos,
      openModalAgendamentos,
      searchFilterInput,
      tabValue,
      loading,
      agendaMedicos,
      agendaMedico,
      dataAgendamento,
      dataAgendamentoFocus,
      horariosAgenda,
      modalHorarios,
      modalPaciente,
      showFloatMenu,
      horarioAgenda,
      regras,
      openFormNovoAgendamento,
      openFormNovoEncaixe,
      openDetalhesAgendamento,
      disponibilidades: { datasDisponiveis, datasIndisponiveis },
      caixasRecepcao: { datasAbertas, datasFinalizadas },
      caixaRecepcao,
      paciente,
      dataCaixaRecepcao,
      openTabCaixaRecepcao,
      openCaixa,
    } = this.state;
    /**
     * Bloqueia os horarios que estão ausentes das lista de disponibilidades
     */
    const isDayBlocked = (momentInstance) => {
      if (!agendaMedico) return false;

      /**
       * Concatena os arrays
       */
      const datasAgenda = [...datasDisponiveis, ...datasIndisponiveis];

      /**
       * Verifica se o horario do calendario não está contido
       */
      return !datasAgenda.some(data => momentInstance.isSame(data, 'day'));
    };

    const isDayBlockedCaixaRecepcao = (momentInstance) => {
      const datasCaixaRecepcao = [...datasAbertas, ...datasFinalizadas];
      return !datasCaixaRecepcao.some(data => momentInstance.isSame(data, 'day'));
    };

    /**
     * Para cada dia do calendário é aplicado uma estilização
     * de acordo com a disponibilidade desta data
     * @param {moment} momentInstance
     */
    const renderDayContents = (momentInstance) => {
      if (!agendaMedico) {
        return <span>{momentInstance.date()}</span>;
      }

      const dataIndisponivel = datasIndisponiveis.find(data => momentInstance.isSame(data, 'day'));

      if (dataIndisponivel) {
        return <span className={classes.invalidDay}>{momentInstance.date()}</span>;
      }

      const dataDisponivel = datasDisponiveis.find(data => momentInstance.isSame(data, 'day'));

      if (dataDisponivel) {
        return <span className={classes.validDay}>{momentInstance.date()}</span>;
      }

      if (moment(new Date()).isAfter(momentInstance, 'day')) {
        return <span className={classes.pastDay}>{momentInstance.date()}</span>;
      }

      return <span>{momentInstance.date()}</span>;
    };

    const renderDayContentsCaixa = (momentInstance) => {
      const datasAberta = datasAbertas.find(data => momentInstance.isSame(data, 'day'));

      if (datasAberta) {
        return <span className={classes.invalidDay}>{momentInstance.date()}</span>;
      }

      const datasFinalizada = datasFinalizadas.find(data => momentInstance.isSame(data, 'day'));

      if (datasFinalizada) {
        return <span className={classes.validDay}>{momentInstance.date()}</span>;
      }

      if (moment(new Date()).isAfter(momentInstance, 'day')) {
        return <span className={classes.pastDay}>{momentInstance.date()}</span>;
      }
      return <span>{momentInstance.date()}</span>;
    };

    const renderDayContentsRecibo = (momentInstance) => {
      if (moment().add(1, 'days').isAfter(momentInstance, 'day')) {
        return <span className={classes.validDay}>{momentInstance.date()}</span>;
      }
      return <span className={classes.pastDay}>{momentInstance.date()}</span>;
    };

    const isDayBlockedRecibo = (momentInstance) => {
      if (moment().add(1, 'days').isAfter(momentInstance, 'day')) {
        return false;
      }
      return true;
    };

    return (
      <Grid container>
        {/* <form autoComplete="off" noValidate onSubmit={handleSubmit}> */}
        <TabPanel value={tabValue} className={classes.tabPanel} index={0}>
          <Container>
            <LoadingIndicator loading={loading} />
            <Grid container spacing={2}>
              <Grid item sm={12} md={6} lg={4}>
                <Grid item sm={12} md={6} lg={12}>

                  <AppBar position="relative" className={classes.appbar}>
                    <Tabs
                      className={classes.tabs}
                      value={tabValue}
                      onChange={this.handleTabChange}
                    >
                      <Tab label="Consulta" icon={<AccountCircleIcon />} id="tab-consulta" />
                      {hasPermission(ADMINISTRADOR, ADMINISTRADOR_GLOBAL, RECEPCAO) && (
                        tabsRecepcao.map(props => (
                          <Tab {...props} />
                        ))
                      )}
                    </Tabs>
                  </AppBar>
                </Grid>
                <Paper
                  className={classNames(classes.paper, classes.paperAside)}
                  elevation={5}
                >
                  <div className={classes.headerAside} />
                  <ModalSelect
                    label="Médico*"
                    empty="Lista de médicos vazia..."
                    disabled={usuarioLogado.medico
                      ? !hasPermission(ADMINISTRADOR, ADMINISTRADOR_GLOBAL)
                      : false}
                    value={agendaMedico}
                    options={agendaMedicos.map(medico => ({
                      id: medico.id,
                      label: medico.nome,
                    }))}
                    onChange={async agendaMedico => await this.setState({ agendaMedico, loading: true })}
                    textfieldProps={{
                      Component: props => (
                        <InputBase
                          {...props}
                          placeholder="Escolher médico..."
                          classes={{
                            root: classes.inputMedicoRoot,
                            input: classes.inputMedico,
                          }}
                        />
                      ),
                    }}
                  />
                  <Typography
                    className={classes.textInfoAside}
                    component="p"
                    variant="body1"
                    align="center"
                  >
                    Selecione abaixo o dia de agendamento
                  </Typography>

                  <DayPickerSingleDateController
                    date={dataAgendamento}
                    onDateChange={date => this.setState({ dataAgendamento: date })}
                    focused={dataAgendamentoFocus}
                    onFocusChange={({ focused }) => this.setState({ dataAgendamentoFocus: focused })}
                    orientation={VERTICAL_ORIENTATION}
                    numberOfMonths={2}
                    verticalHeight={600}
                    daySize={30}
                    weekDayFormat="ddd"
                    keepOpenOnDateSelect
                    noBorder
                    hideKeyboardShortcutsPanel
                    onPrevMonthClick={this.handleNavigateCalendar}
                    onNextMonthClick={this.handleNavigateCalendar}
                    renderDayContents={renderDayContents}
                    isDayBlocked={isDayBlocked}
                  />
                  <Button
                    style={{ marginTop: 20 }}
                    fullWidth
                    variant="contained"
                    color="secondary"
                    type="submit"
                    disabled={isSubmitting}
                    onClick={this.handleNotify}
                  >
                    Enviar por e-mail
                  </Button>
                </Paper>
              </Grid>
              <Grid item sm={12} md={6} lg={8}>
                <Paper className={classNames(classes.paper, classes.paperHorarios)} elevation={5}>
                  <ListaHorarios
                    horariosAgenda={horariosAgenda}
                    onDoubleClickRowHorario={this.handleDoubleClickRowHorario}
                    onClickRowHorario={this.handleClickRowHorario}
                    dataAgendamento={dataAgendamento}
                  />
                </Paper>
              </Grid>
            </Grid>
            <Dialog
              fullScreen
              open={modalPaciente}
              onClose={() => this.setState({ modalPaciente: false, showFloatMenu: true })}
              TransitionComponent={Transition}
            >
              <AppBar position="relative">
                <Toolbar>
                  <IconButton color="inherit" onClick={() => this.setState({ modalPaciente: false, showFloatMenu: true })} aria-label="Fechar">
                    <Close />
                  </IconButton>
                  <Typography variant="h6" color="inherit" style={{ flex: 1 }}>
                    Cadastrar Paciente
                  </Typography>
                  <Button onClick={() => this.setState({ modalPaciente: false, showFloatMenu: true })} color="inherit">
                    Cancelar
                  </Button>
                </Toolbar>
              </AppBar>
              <DialogContent>
                <Grid container spacing={2} justify="center" alignItems="center">
                  <Grid item>
                    <FormCadastroPaciente />
                  </Grid>
                </Grid>
              </DialogContent>
            </Dialog>
            <HorariosDisponiveis
              open={modalHorarios}
              handleClose={this.handleCloseHorariosDisponiveis}
            />
            <FormNovoAgendamento
              horarioAgenda={horarioAgenda}
              regras={regras}
              open={openFormNovoAgendamento}
              handleClose={this.handleCloseNovoAgendamento}
              onComplete={() => {}}
              onEdit={this.emitSocketEditandoAgendamento}
            />
            <FormNovoEncaixe
              open={openFormNovoEncaixe}
              handleClose={this.handleClosenNovoEncaixe}
              onComplete={() => {}}
            />
            <DetalhesAgendamento
              containerHeight={containerHeight}
              horarioAgenda={horarioAgenda}
              open={openDetalhesAgendamento}
              handleClose={this.handleCloseVisulizarAgendamento}
              onChangePicture={this.onChangePicture}
            />
            <Grow
              in={showFloatMenu}
              style={{ transformOrigin: '0 0 0' }}
              {...(showFloatMenu ? { timeout: 1600 } : {})}
            >
              <Fab
                size="small"
                className={classes.fabItem}
                style={{ bottom: theme.spacing(26), zIndex: 500 }}
                color="secondary"
                onClick={this.handleOpenNovoEncaixe}
              >
                <Tooltip title="Encaixe" placement="left">
                  <span className={classes.iconWrapper}>
                    <Icon
                      path={mdiPagePreviousOutline}
                      size="24px"
                      color="#FFF"
                    />
                  </span>
                </Tooltip>
              </Fab>
            </Grow>
            <Grow
              in={showFloatMenu}
              style={{ transformOrigin: '0 0 0' }}
              {...(showFloatMenu ? { timeout: 1000 } : {})}
            >
              <Fab
                size="small"
                className={classes.fabItem}
                style={{ bottom: theme.spacing(19), zIndex: 500 }}
                color="secondary"
                onClick={() => this.setState({ modalPaciente: true, showFloatMenu: false })}
              >
                <Tooltip title="Cadastro pacientes" placement="left">
                  <PersonAdd />
                </Tooltip>
              </Fab>
            </Grow>
            <Grow in={showFloatMenu}>
              <Fab
                size="small"
                className={classes.fabItem}
                style={{ bottom: theme.spacing(12), zIndex: 500 }}
                color="secondary"
                onClick={() => this.setState({ modalHorarios: true, showFloatMenu: false })}
              >
                <Tooltip title="Horários disponíveis" placement="left">
                  <Schedule />
                </Tooltip>
              </Fab>
            </Grow>
            {isChatOpen || openDetalhesAgendamento || openFormNovoAgendamento || (
            <Tooltip style={{ zIndex: 500 }} title="Mais opções" placement="left">
              <Fab
                size="large"
                className={classes.fab}
                color="secondary"
                onClick={() => this.setState({ showFloatMenu: !showFloatMenu })}
              >
                {showFloatMenu ? <RemoveIcon /> : <AddIcon />}
              </Fab>
            </Tooltip>
            )}
          </Container>
        </TabPanel>


        <TabPanel value={tabValue} className={classes.tabPanel} index={1}>
          <Container>
            <LoadingIndicator loading={loading} />
            <Grid container spacing={2}>
              <Grid item sm={12} md={6} lg={4}>
                <Grid item sm={12} md={6} lg={12}>
                  <AppBar position="relative" className={classes.appbar}>
                    <Tabs
                      className={classes.tabs}
                      value={tabValue}
                      onChange={this.handleTabChange}
                    >
                      <Tab label="Consulta" icon={<AccountCircleIcon />} id="tab-consulta" />
                      <Tab label="Gerar Guia" icon={<AssignmentIndIcon />} id="tab-gerar-guia" />
                      <Tab label="Caixa" icon={<AttachMoneyIcon />} id="tab-caixa" />
                      <Tab label="Recibos" icon={<AssignmentIcon />} id="tab-recibos" />
                    </Tabs>
                  </AppBar>
                </Grid>
                <Paper
                  className={classNames(classes.paper, classes.paperAside)}
                  elevation={5}
                >
                  <div className={classes.headerAside} />
                  <Grid style={{ visibility: 'hidden', minHeight: 54 }} item sm={12} md={3} lg={12} />
                  <Typography
                    className={classes.textInfoAside}
                    component="p"
                    variant="body1"
                    align="center"
                  >
                    Pesquise pelo paciente desejado
                    <br />
                    para gerar a guia de consulta do dia
                  </Typography>
                  {agendamentosPaciente.length ? (
                    <Grid item sm={12} md={12} lg={12}>
                      <TextField
                        placeholder="Procurar..."
                        type="search"
                        margin="normal"
                        fullWidth
                        value={searchFilterInput}
                        onChange={event => this.setState({ searchFilterInput: event.target.value })}
                      />
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align="left" />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {agendamentosPaciente.filter(this.filterAgendamentosPaciente).map((paciente, index) => (
                            <Tooltip
                              title="Clique para selecionar"
                              placement="top"
                              enterDelay={600}
                              leaveDelay={100}

                            >
                              <TableRow
                                className={classes.tableRow}
                                hover
                                onClick={event => this.fetchAgendamentosPaciente(event, paciente)}
                                style={{ backgroundColor: paciente === this.state.paciente ? 'rgba(0, 0, 0, 0.07)' : null }}
                              >
                                <TableCell align="left">{paciente.nome}</TableCell>
                              </TableRow>
                            </Tooltip>
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
                      {openCaixa
                        ? 'Nenhum resultado encontrado...'
                        : (
                          'Finalize o(s) caixa(s) do(s) dia(s) anteriores\n para iniciar o caixa de hoje.'
                        )
                      }
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item sm={12} md={6} lg={8}>
                <Paper className={classNames(classes.paper, classes.gerarGuia)} elevation={5}>
                  <GerarGuia
                    containerHeight={containerHeight}
                    paciente={paciente}
                    agendamentos={agendamentos}
                    openModalAgendamentos={openModalAgendamentos}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </TabPanel>

        <TabPanel value={tabValue} className={classes.tabPanel} index={2}>
          <Container>
            <LoadingIndicator loading={loading} />
            <Grid container spacing={2}>
              <Grid item sm={12} md={6} lg={4}>
                <Grid item sm={12} md={6} lg={12}>
                  <AppBar position="relative" className={classes.appbar}>
                    <Tabs
                      className={classes.tabs}
                      value={tabValue}
                      onChange={this.handleTabChange}
                    >
                      <Tab label="Consulta" icon={<AccountCircleIcon />} id="tab-consulta" />
                      <Tab label="Gerar Guia" icon={<AssignmentIndIcon />} id="tab-gerar-guia" />
                      <Tab label="Caixa" icon={<AttachMoneyIcon />} id="tab-caixa" />
                      <Tab label="Recibos" icon={<AssignmentIcon />} id="tab-recibos" />
                    </Tabs>
                  </AppBar>
                </Grid>
                <Paper
                  className={classNames(classes.paper, classes.paperAside)}
                  elevation={5}
                >
                  <div className={classes.headerAside} />
                  <Grid style={{ visibility: 'hidden', minHeight: 54 }} item sm={12} md={3} lg={12} />
                  <Typography
                    className={classes.textInfoAside}
                    component="p"
                    variant="body1"
                    align="center"
                  >
                    Selecione a data de abertura/fechamento
                    {' '}
                    <br />
                    do caixa do(a) recepcionista
                  </Typography>
                  {tabValue === 2 && (
                    <DayPickerSingleDateController
                      date={dataCaixaRecepcao}
                      onDateChange={date => this.setState({ dataCaixaRecepcao: date })}
                      orientation={VERTICAL_ORIENTATION}
                      numberOfMonths={2}
                      verticalHeight={600}
                      daySize={30}
                      weekDayFormat="ddd"
                      keepOpenOnDateSelect
                      noBorder
                      hideKeyboardShortcutsPanel
                      onPrevMonthClick={this.handleNavigateCalendarCaixaRecepcao}
                      onNextMonthClick={this.handleNavigateCalendarCaixaRecepcao}
                      renderDayContents={renderDayContentsCaixa}
                      isDayBlocked={isDayBlockedCaixaRecepcao}
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item sm={12} md={6} lg={8}>
                <Paper className={classNames(classes.paper, classes.paperHorarios)} elevation={5}>
                  <ListaCaixa
                    onCompleteUpdate={this.onCompleteUpdate}
                    onOpenCaixaRecepcao={this.abrirCaixaRecepcao}
                    onFetchCaixaRecepcao={this.fetchCaixaRecepcao}
                    onRemoveLancamento={this.onRemoveLancamento}
                    datasAbertas={datasAbertas}
                    datasFinalizadas={datasFinalizadas}
                    caixaRecepcao={caixaRecepcao}
                    dataCaixaRecepcao={dataCaixaRecepcao}
                    openTabCaixaRecepcao={openTabCaixaRecepcao}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </TabPanel>
        <TabPanel value={tabValue} className={classes.tabPanel} index={3}>
          <Container>
            <LoadingIndicator loading={loading} />
            <Grid container spacing={2}>
              <Grid item sm={12} md={6} lg={4}>
                <Grid item sm={12} md={6} lg={12}>
                  <AppBar position="relative" className={classes.appbar}>
                    <Tabs
                      className={classes.tabs}
                      value={tabValue}
                      onChange={this.handleTabChange}
                    >
                      <Tab label="Consulta" icon={<AccountCircleIcon />} id="tab-consulta" />
                      <Tab label="Gerar Guia" icon={<AssignmentIndIcon />} id="tab-gerar-guia" />
                      <Tab label="Caixa" icon={<AttachMoneyIcon />} id="tab-caixa" />
                      <Tab label="Recibos" icon={<AssignmentIcon />} id="tab-recibos" />
                    </Tabs>
                  </AppBar>
                </Grid>
                <Paper
                  className={classNames(classes.paper, classes.paperAside)}
                  elevation={5}
                >
                  <div className={classes.headerAside} />
                  <Grid style={{ visibility: 'hidden', minHeight: 54 }} item sm={12} md={3} lg={12} />
                  <Typography
                    className={classes.textInfoAside}
                    component="p"
                    variant="body1"
                    align="center"
                  >
                    Selecione a data de emissão do recibo
                    {' '}
                    <br />
                    para realizar uma busca avançada
                  </Typography>
                  {tabValue === 3 && (
                    <DayPickerSingleDateController
                      date={dataRecibo}
                      onDateChange={date => this.setState({ dataRecibo: date !== dataRecibo ? date : '' })}
                      orientation={VERTICAL_ORIENTATION}
                      numberOfMonths={2}
                      verticalHeight={600}
                      daySize={30}
                      weekDayFormat="ddd"
                      keepOpenOnDateSelect
                      noBorder
                      hideKeyboardShortcutsPanel
                      renderDayContents={renderDayContentsRecibo}
                      isDayBlocked={isDayBlockedRecibo}
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item sm={12} md={6} lg={8}>
                <Paper className={classNames(classes.paper, classes.paperHorarios)} elevation={5}>
                  <ListaRecibos
                    containerHeight={containerHeight}
                    dataRecibo={dataRecibo}
                    openTabRecibos={openTabRecibos}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </TabPanel>
        {/* </form> */}
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
  withRouter,
  Dimensions(),
  withStyles(Material, { withTheme: true }),
  withFormik({
    displayName: 'Agendamento',
    validateOnChange: false,
    validateOnBlur: false,
    mapPropsToValues: () => ({
      agendamentosGroup: [],
    }),
    validationSchema: props => Yup.object().shape({
    }),
    handleSubmit: async (values, { props, setSubmitting, resetForm }) => {
      values = { ...values };
      values.permissoes = [...values.permissoes, ...values.notificacoes];
      const { userId } = props.match.params;
      const isEdit = userId && !!Number(userId);
      const userForm = {
        ...values,
        id: isEdit ? Number(userId) : undefined,
      };
      try {
        const usuario = await UsuarioService.save(userForm);
        props.notify('Cadastro salvo com sucesso', { variant: 'success' });
        const [url] = props.match.path.split('/:userId');
        resetForm();
        props.history.replace(`${url}`);
        props.setUsuario(usuario);
      } catch (err) {
        setSubmitting(false);
        props.notify('Houve um problema ao salvar', { variant: 'error' });
      }
    },
  }),
)(Agendamento);
