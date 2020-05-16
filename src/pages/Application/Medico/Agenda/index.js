/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable array-callback-return */
/* eslint-disable func-names */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import PacienteService from '../../../../services/Paciente';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import Anamnese from './components/Anamnese';
import NotificationActions from '../../../../store/ducks/notifier';
import { Container } from '../../../../styles/global';
import Material from './styles';

class Agenda extends Component {
  state = {
    paciente: null,
    openAnamnese: false,
    searchFilterInput: '',
    loading: false,
    agendamentosPaciente: [],
  };

  componentDidMount() {
    this.fetchPacientesAgendamentos();
  }

  componentDidUpdate(prevProps) {
    const { unidade } = this.props;
    if (prevProps.unidade !== unidade) {
      this.fetchPacientesAgendamentos();
    }
  }

  fetchPacientesAgendamentos = async () => {
    const { unidade, notify } = this.props;

    try {
      this.setState({ openAnamnese: false });
      const agendamentosPaciente = await PacienteService.getAllByDay({
        empresaUnidade: unidade.id,
        date: moment().format('YYYY-MM-DD'),
      });
      if (agendamentosPaciente) {
        this.setState({ agendamentosPaciente });
      } else {
        notify('Não foi encontrado nenhum paciente', { variant: 'error' });
      }
    } catch (err) {
      if (err && err.response) {
        console.log(err);
        notify(err.response.data, { variant: 'warning' });
      } else {
        notify('Não foi possível realizar a busca por pacientes', { variant: 'error' });
      }
    } finally {
      this.setState({ openModalAgendamentos: false });
    }
  }

  handleChange = name => ({ target: { value } }) => {
    const values = { ...this.state.values };
    values[name] = value;
    this.setState({ values });
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

  handleChangePaciente = (paciente) => {
    const { notify } = this.props;
    if (paciente.id) {
      this.setState({ openAnamnese: true, paciente });
    } else {
      notify('Esse paciente não possui cadastro no sistema', { variant: 'error' });
    }
  }

  render() {
    const {
      classes,
    } = this.props;

    const {
      agendamentosPaciente,
      loading,
      openAnamnese,
      paciente,
      searchFilterInput,
    } = this.state;

    return (
      <Grid container>
        <Container>
          <LoadingIndicator loading={loading} />
          <Grid container spacing={2}>
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
                    AGENDA DO DIA
                </Typography>
                <Typography
                  className={classes.textInfoAside}
                  component="p"
                  variant="body1"
                  align="center"
                >
                  Pesquise pelo paciente desejado
                  <br />
                  para realizar a prescrição
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
                              onClick={() => this.handleChangePaciente(paciente)}
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
                    Nenhum resultado encontrado...
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item sm={12} md={6} lg={8}>
              <Paper className={classNames(classes.paper, classes.paperHorarios)} elevation={5}>
                <Anamnese
                  pacienteId={paciente ? paciente.id : undefined}
                  open={openAnamnese}
                  handleClose={() => this.setState({ openAnamnese: false })}
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
)(Agenda);
