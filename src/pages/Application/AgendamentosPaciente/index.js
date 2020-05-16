import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';

import {
  mdiAccountClock,
  mdiAccountCheck,
  mdiCalendarImport,
  mdiCalendarClock,
  mdiCalendarCheck,
} from '@mdi/js';

import LabelClin from '../../../components/LabelClin';

import AgendaService from '../../../services/Agenda';
import NotificationActions from '../../../store/ducks/notifier';

import Material from './styles';

class AgendamentosPaciente extends Component {
  state = {
    error: null,
    agendamentosPaciente: [],
    nomePaciente: null,
    searchFilterInput: '',
  }

  componentDidMount() {
    this.fetchAgendamentos();
  }

  fetchAgendamentos = async () => {
    const { match: { params }, unidade, notify } = this.props;

    if (params.pacienteId) {
      try {
        const agendamentosPaciente = await AgendaService.pesquisarHorariosPaciente({
          empresaUnidade: unidade.id,
          paciente: params.pacienteId,
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
        } else {
          this.setState({
            error: 'Este paciente não possui agendamentos',
          });
        }
      } catch (err) {
        const error = 'Não foi possível buscar os agendamentos';
        notify(error, { variant: 'error' });
        this.setState({ error });
      }
    }
  }

  filterAgendamentosPaciente = (agenda) => {
    const { searchFilterInput } = this.state;

    if (!String(searchFilterInput).trim()) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(agenda.id.dataLabel)) {
      return true;
    }

    if (new RegExp(searchFilterInput, 'ig').test(agenda.evento.descricao)) {
      return true;
    }

    return false;
  }

  renderAgendamentoPacienteSituacao = (agenda) => {
    const { classes } = this.props;

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
      error,
      agendamentosPaciente,
      nomePaciente,
      searchFilterInput,
    } = this.state;

    if (error) {
      return (
        <Grid container>
          <Paper className={classes.paper}>
            <Typography className={classes.errorText} component="p" color="textSecondary">
              {error}
            </Typography>
          </Paper>
        </Grid>
      );
    }

    return (
      <Grid container>
        {!!agendamentosPaciente.length && !!nomePaciente && (
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
                    <TableCell align="left">{`${agenda.plano.nomeConvenio} - ${agenda.plano.nome}`}</TableCell>
                    {this.renderAgendamentoPacienteSituacao(agenda)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
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
  withStyles(Material),
)(AgendamentosPaciente);
