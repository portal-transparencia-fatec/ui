import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { debounce } from 'lodash';
import {
  mdiAccountClock,
  mdiAccountCheck,
  mdiCalendarImport,
  mdiCalendarClock,
  mdiCalendarCheck,
} from '@mdi/js';
import { Link } from 'react-router-dom';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Anamnese from '../Agendamento/components/Anamnese';
import AgendaService from '../../../services/Agenda';
import {
  cpfFormatter,
  telFormatter,
  celFormatter,
} from '../../../libs/utils';
import FormCadastroPaciente from '../../../components/FormCadastroPaciente';

import NotificationActions from '../../../store/ducks/notifier';
import PacienteService from '../../../services/Paciente';
import LabelClin from '../../../components/LabelClin';
import Material from './styles';
import { Container } from '../../../styles/global';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
class CadastroPaciente extends Component {
  constructor(props) {
    super(props);

    this.fetchSearchPaciente = debounce(this.fetchSearchPaciente, 400);
  }

  state = {
    agendamentosPaciente: [],
    nomePaciente: null,
    searchFilterInput: '',
    showModalAgendamentos: false,
    paciente: {},
    pacientes: [],
    searchPaciente: '',
    anchorElMenu: null,
    pacienteSelecionado: null,
    openAnamnese: false,
    pacienteSelecionadoId: undefined,
  }

  componentDidMount() {
    const {
      match,
    } = this.props;
    this.fetchPaciente();
    if (match.params.pacienteId) {
      this.fetchAgendamentos(match.params.pacienteId);
    }
  }

  componentDidUpdate(prevProps) {
    const { match: { params } } = this.props;

    if (params.pacienteId !== prevProps.match.params.pacienteId) {
      this.fetchPaciente();
    }
  }

  isExistedPaciente = () => {
    const { match: { params: { pacienteId } } } = this.props;
    return pacienteId && !!Number(pacienteId);
  }

  fetchAgendamentos = async (pacienteId) => {
    const { unidade, notify, match: { params: { showModalAgendamentos } } } = this.props;
    if (pacienteId) {
      try {
        const agendamentosPaciente = await AgendaService.pesquisarHorariosPaciente({
          empresaUnidade: unidade.id,
          paciente: pacienteId,
        });

        if (agendamentosPaciente && agendamentosPaciente.length) {
          const [agendaPaciente] = agendamentosPaciente;
          this.setState({
            agendamentosPaciente: agendamentosPaciente
              .map(agenda => ({
                ...agenda,
                id: {
                  ...agenda.id,
                  dataLabel: moment(agenda.id.data).format('DD/MM/YYYY'),
                  fullDataLabel: moment(`${agenda.id.data}T${agenda.id.hora}`).format('DD [de] MMMM [de] YYYY, dddd [às] HH:mm'),
                },
              })),
            nomePaciente: agendaPaciente.nomePaciente,
          });

          this.setState({ showModalAgendamentos: showModalAgendamentos || true });
        } else {
          notify('Este paciente não possui agendamentos', { variant: 'warning' });
        }
      } catch (err) {
        const error = 'Não foi possível buscar os agendamentos';
        notify(error, { variant: 'error' });
      }
    }
  }

  fetchPaciente = async () => {
    const {
      notify, history, match,
    } = this.props;

    if (this.isExistedPaciente()) {
      try {
        const paciente = await PacienteService.getById(match.params.pacienteId);
        this.setState({
          paciente: {
            id: paciente.id,
            codigoLegado: paciente.codigoLegado || undefined,
            peso: paciente.peso || undefined,
            altura: paciente.altura || undefined,
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
            planos: paciente.planos.map(({ plano }) => plano.id),
            cep: String(paciente.cep) || '',
            uf: paciente.cidade ? paciente.cidade.estado.uf : '',
            cidade: paciente.cidade ? paciente.cidade.codigoIbge : '',
          },
        });
      } catch (err) {
        console.log(err);
        notify('Não foi possível buscar os dados do paciente', { variant: 'error' });
        const [url] = match.path.split('/:pacienteId');
        history.replace(`${url}`);
      }
    }
  }

  fetchSearchPaciente = async (searchPaciente) => {
    const { notify } = this.props;
    if (!String(searchPaciente).trim()) return;

    try {
      const pacientes = await PacienteService.getAll(searchPaciente);

      this.setState({
        pacientes: pacientes.map(paciente => ({
          ...paciente,
          cpfLabel: cpfFormatter(paciente.cpf),
          telefoneLabel: telFormatter(paciente.telefone),
          planosLabel: paciente.planos
            .map(({ plano: { nome, nomeConvenio } }) => `${nomeConvenio} - ${nome}`).join(', '),
        })),
      });
    } catch (err) {
      notify('Não foi possível buscar os dados do paciente', { variant: 'error', autoHideDuration: 5000 });
    }
  }

  handleSubmitPaciente = () => {
    const { history, match } = this.props;
    this.setState({ paciente: {} });
    const [url] = match.path.split('/:pacienteId');
    history.push(`${url}`);
  }

  handleChangeSearchPaciente = (event) => {
    this.setState({ searchPaciente: event.target.value });
    this.fetchSearchPaciente(event.target.value);
  }

  handleClickPacienteMenu = paciente => (event) => {
    this.setState({
      pacienteSelecionado: paciente,
      anchorElMenu: event.currentTarget,
    });
  }

  filterAgendamentosPaciente = (agenda) => {
    const { searchFilterInput } = this.state;

    if (!String(searchFilterInput).trim()) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(agenda.id.fullDataLabel)) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(agenda.id.dataLabel)) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(agenda.evento.descricao)) {
      return true;
    }

    if (agenda.plano && new RegExp(searchFilterInput, 'ig').test(`${agenda.plano.nomeConvenio ? agenda.plano.nomeConvenio : ''}${agenda.plano.nome ? ` - ${agenda.plano.nome}` : ''}`)) {
      return true;
    }

    return false;
  }

  handleClosePacienteMenu = () => {
    this.setState({
      pacienteSelecionado: null,
      anchorElMenu: null,
    });
  }

  handleCompleteUpdate = () => {
    const { searchPaciente } = this.state;
    this.fetchSearchPaciente(searchPaciente);
  }

  handleClickMenuItemEditar = pacienteSelecionado => () => {
    const { history } = this.props;
    console.log(pacienteSelecionado);
    history.push(`/app/pacientes/${pacienteSelecionado.id}`);
    this.handleClosePacienteMenu();
  }


  handleClickMenuItemAgendamento = pacienteSelecionado => async () => {
    await this.fetchAgendamentos(pacienteSelecionado.id);
  }

  handleClickCancelarEdicao = () => {
    const { history } = this.props;
    history.replace('/app/pacientes');
    this.setState({
      paciente: {},
    });
  }

  handleClickMenuItemAnamneseEvolucao = ({ id: pacienteSelecionadoId }) => async () => {
    this.setState({ openAnamnese: true, pacienteSelecionadoId });
    this.handleClosePacienteMenu();
  }

  renderAgendamentoPacienteSituacao = (agenda) => {
    const { classes } = this.props;

    if (agenda.desistencia) {
      return (
        <TableCell align="left" className={classes.tableCellLabels}>
          <LabelClin
            text="DESISTÊNCIA"
            icon={mdiCalendarCheck}
            iconSize="24px"
            bgColor="#8C8C8C"
            textColor="#80000"
          />
        </TableCell>
      );
    }

    if (agenda.atendido) {
      return (
        <TableCell align="left" className={classes.tableCellLabels}>
          <LabelClin
            text="ATENDIDO"
            icon={mdiCalendarCheck}
            iconSize="24px"
            bgColor="#D9D9D9"
            textColor="#8C8C8C"
          />
        </TableCell>
      );
    }

    if (agenda.atendimento) {
      return (
        <TableCell align="left" className={classes.tableCellLabels}>
          <LabelClin
            text="ATENDIMENTO"
            icon={mdiCalendarClock}
            iconSize="24px"
            bgColor="#cc99ff"
            textColor="#9933ff"
          />
        </TableCell>
      );
    }

    if (agenda.compareceu) {
      return (
        <TableCell align="left" className={classes.tableCellLabels}>
          <LabelClin
            text="COMPARECEU"
            icon={mdiCalendarImport}
            iconSize="24px"
            bgColor="#99b3ff"
            textColor="#1a53ff"
          />
        </TableCell>
      );
    }

    if (agenda.confirmado) {
      return (
        <TableCell align="left" className={classes.tableCellLabels}>
          <LabelClin
            text="CONFIRMADO"
            icon={mdiAccountCheck}
            iconSize="24px"
            bgColor="#adebad"
            textColor="#2eb82e"
          />
        </TableCell>
      );
    }

    return (
      <TableCell align="left" className={classes.tableCellLabels}>
        <LabelClin
          text="AGUARDANDO"
          icon={mdiAccountClock}
          iconSize="24px"
          bgColor="#ffbb99"
          textColor="#ff5500"
        />
      </TableCell>
    );
  }

  render() {
    const { classes } = this.props;
    const {
      agendamentosPaciente,
      nomePaciente,
      searchFilterInput,
      showModalAgendamentos,
      paciente,
      pacientes,
      searchPaciente,
      anchorElMenu,
      pacienteSelecionado,
      openAnamnese,
      pacienteSelecionadoId,
    } = this.state;

    return (
      <Container>
        <Grid container spacing={2}>
          <Grid item sm={12} md={12} lg={12}>
            <Paper className={classes.paper} elevation={5}>
              { showModalAgendamentos === true && (
                <Dialog
                  fullScreen
                  open={showModalAgendamentos}
                  TransitionComponent={Transition}
                  keepMounted
                  onClose={() => { this.setState({ showModalAgendamentos: false }); }}
                  aria-labelledby="alert-dialog-slide-title"
                  aria-describedby="alert-dialog-slide-description"
                >
                  <DialogTitle className={classes.header}>Agendamentos do paciente</DialogTitle>
                  <DialogContent className={classes.dialog}>
                    <DialogContentText id="alert-dialog-slide-description">
                      <Paper className={classes.paper}>
                        <Typography component="p" variant="h5" color="textSecondary">
                          <strong>
                            <i>
                              {nomePaciente}
                            </i>
                          </strong>
                        </Typography>
                        <TextField
                          placeholder="Filtrar por data, evento..."
                          type="search"
                          margin="normal"
                          fullWidth
                          value={searchFilterInput}
                          onChange={event => this.setState({ searchFilterInput: event.target.value })}
                        />
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell align="left"><strong>Data</strong></TableCell>
                              <TableCell align="left">Evento</TableCell>
                              <TableCell align="left">Convênio/Plano</TableCell>
                              <TableCell align="left">Situação</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {agendamentosPaciente.filter(this.filterAgendamentosPaciente).map(agenda => (
                              <TableRow hover key={`${agenda.id.data}_${agenda.id.hora}`}>
                                <TableCell align="left"><strong>{agenda.id.fullDataLabel}</strong></TableCell>
                                <TableCell align="left">{agenda.evento.descricao}</TableCell>
                                <TableCell align="left">{agenda.plano ? `${agenda.plano.nomeConvenio ? agenda.plano.nomeConvenio : ''}${agenda.plano.nome ? ` - ${agenda.plano.nome}` : ''}` : '-'}</TableCell>
                                {this.renderAgendamentoPacienteSituacao(agenda)}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions className={classes.footer}>
                    <Button
                      onClick={() => {
                        this.setState({ showModalAgendamentos: null });
                      }}
                    >
                      <CloseIcon className={classes.closeIcon} />
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
              <FormCadastroPaciente
                paciente={paciente}
                handleFormSubmit={this.handleSubmitPaciente}
                onCompleteUpdate={this.handleCompleteUpdate}
              />
              {this.isExistedPaciente() && (
                <Button
                  fullWidth
                  color="default"
                  onClick={this.handleClickCancelarEdicao}
                >
                  Cancelar edição
                </Button>
              )}
            </Paper>
          </Grid>
          <Grid item sm={12} md={12} lg={12}>
            <Paper className={classes.paper} elevation={5}>
              <TextField
                placeholder="Buscar paciente pelo nome..."
                type="search"
                margin="normal"
                fullWidth
                value={searchPaciente}
                onChange={this.handleChangeSearchPaciente}
              />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Nome</TableCell>
                    <TableCell align="left">CPF</TableCell>
                    <TableCell align="left">Convênio/Plano</TableCell>
                    <TableCell align="left">Telefone</TableCell>
                    <TableCell colSpan={2} align="left">E-mail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!!pacientes.length && pacientes.map(p => (
                    <TableRow
                      key={p.id}
                      hover
                    >
                      <TableCell align="left">{p.nome}</TableCell>
                      <TableCell align="left">{p.cpfLabel}</TableCell>
                      <TableCell align="left">{p.planosLabel}</TableCell>
                      <TableCell align="left">{p.telefoneLabel}</TableCell>
                      <TableCell align="left">{p.email}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          arial-label="Mais"
                          aria-owns={anchorElMenu ? `menu-${p.id}` : undefined}
                          aria-haspopup="true"
                          onClick={this.handleClickPacienteMenu(p)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <Grid item sm={12} md={12} lg={12}>
                    <Anamnese
                      pacienteId={pacienteSelecionadoId}
                      open={openAnamnese}
                      handleClose={() => this.setState({ openAnamnese: false })}
                    />
                  </Grid>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
        {!!pacienteSelecionado && (
          <Menu
            id={`menu-${pacienteSelecionado.id}`}
            anchorEl={anchorElMenu}
            open={!!anchorElMenu}
            onClose={this.handleClosePacienteMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 250,
              },
            }}
          >
            <MenuItem
              button
              component={Link}
              to={`/app/pacientes/${pacienteSelecionado.id}`}
              onClick={this.handleClosePacienteMenu}
            >
              Editar
            </MenuItem>
            <MenuItem
              button
              onClick={this.handleClickMenuItemAgendamento(pacienteSelecionado)}
            >
              Agendamentos
            </MenuItem>
            <MenuItem
              button
              onClick={this.handleClickMenuItemAnamneseEvolucao(pacienteSelecionado)}
            >
              Anamnese / Evolução
            </MenuItem>
          </Menu>
        )}
      </Container>
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

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(Material)(CadastroPaciente),
);
