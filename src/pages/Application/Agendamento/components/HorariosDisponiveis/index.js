import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import classnames from 'classnames';

import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';

import CloseIcon from '@material-ui/icons/Close';

import FormNovoAgendamento from '../FormNovoAgendamento';
import ModalSelect from '../../../../../components/ModalSelect';
import { InputFormatHora, InputFormatData } from '../../../../../components/InputFormat';

import NotificationActions from '../../../../../store/ducks/notifier';
import AgendaService from '../../../../../services/Agenda';
import ConvenioService from '../../../../../services/Convenio';
import EventoService from '../../../../../services/Evento';
import UsuarioService from '../../../../../services/Usuario';

import Material from './styles';

const TransitionComponent = React
  .forwardRef((props, ref) => <Slide ref={ref} direction="up" {...props} />);

/**
 * Componente que lista os horários disponíveis e
 * agenda uma consulta fora das regras definidas da
 * grade de horario
 */
class HorariosDisponiveis extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
  };

  state = {
    planos: [],
    convenios: [],
    eventos: [],
    usuarios: [],
    diasSemanaOptions: [
      { label: 'SEGUNDA-FEIRA', value: 1 },
      { label: 'TERÇA-FEIRA', value: 2 },
      { label: 'QUARTA-FEIRA', value: 3 },
      { label: 'QUINTA-FEIRA', value: 4 },
      { label: 'SEXTA-FEIRA', value: 5 },
      { label: 'SÁBADO', value: 6 },
      { label: 'DOMINGO', value: 7 },
    ],
    horariosDisponiveis: [],
    openFormNovoAgendamento: false,
    horarioAgenda: {},
  }

  /**
   * Busca os dados na API para preencher os inputs/selects
   * do filtro de pesquisa
   */
  loadData = async () => {
    const { horariosDisponiveis } = this.state;
    const { notify, unidade } = this.props;

    if (horariosDisponiveis.length) {
      this.setState({ horariosDisponiveis: [] });
    }

    try {
      const [eventos, convenios, usuarios] = await Promise.all([
        EventoService.getEventos(),
        ConvenioService.getAll(),
        UsuarioService.search(true, true, unidade.id),
      ]);

      this.setState({ eventos, convenios, usuarios });
    } catch (err) {
      notify('Não foi possível carregar os dados', { variant: 'error' });
    }
  }

  /**
   * Fecha o modal de agendamento
   */
  handleCloseNovoAgendamento = () => {
    this.setState({
      openFormNovoAgendamento: false,
      horarioAgenda: {},
    });
  }

  /**
   * Quando um horario disponível é agendado essa função
   * é executada para atualizar a lista
   */
  onCompleteNovoAgendamento = (agendamento) => {
    if (!agendamento || !agendamento.id) {
      return;
    }
    const { horariosDisponiveis } = this.state;
    const novoshorariosDisponiveis = [...horariosDisponiveis];

    const horarioAgendaIndex = novoshorariosDisponiveis
      .findIndex(horario => (agendamento.id.data === horario.data)
      && (agendamento.id.hora === horario.hora));

    if (horarioAgendaIndex !== -1) {
      novoshorariosDisponiveis.splice(horarioAgendaIndex, 1);
    }

    this.setState({ horariosDisponiveis: novoshorariosDisponiveis });
  }

  /**
   * Abre o modal para realizar o agendamento no duplo clique
   */
  handleDoubleClickRow = async (horarioAgenda) => {
    if (moment(horarioAgenda.startDate).isBefore(new Date())) {
      return;
    }

    await this.setState({ openFormNovoAgendamento: true });
    await this.setState({
      horarioAgenda: {
        data: horarioAgenda.data,
        horaInicial: horarioAgenda.hora,
        startDate: moment(`${horarioAgenda.data}T${horarioAgenda.hora}`).toDate(),
        medico: horarioAgenda.usuario,
      },
    });
  }

  /**
   * Realiza a pesquisa dos horários disponíveis de acordo
   * com os dados no formulário de pesquisa. Este método faz
   * referência ao onSubmit do Formik
   */
  onSubmitHorariosDisponiveis = async (values, { setSubmitting }) => {
    const { notify, unidade } = this.props;
    const { convenios } = this.state;

    const formPesquisarHorarios = {
      ...values,
      dataInicial: values.dataInicial ? moment(values.dataInicial, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
      dataFinal: values.dataFinal ? moment(values.dataFinal, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
      horaInicial: values.horaInicial ? values.horaInicial : undefined,
      horaFinal: values.horaFinal ? values.horaFinal : undefined,
      empresaUnidade: unidade.id,
    };

    try {
      const horariosDisponiveis = await AgendaService
        .pesquisarHorariosDisponíveis(formPesquisarHorarios);

      if (horariosDisponiveis && horariosDisponiveis.length) {
        this.setState({
          horariosDisponiveis: horariosDisponiveis.map(horario => ({
            ...horario,
            /**
             * Computa no objeto uma data no formato do JS
             */
            startDate: moment(`${horario.data}T${horario.hora}`).toDate(),
          })),
          planos: convenios
            /**
             * Filtra apenas os planos do convenio selecionado no formulario
             * de pesquisa
             */
            .filter(({ id }) => id === values.convenio)
            .map(({ id, nome, planos }) => planos.map(plano => ({
              /**
               * Mapeia os dados dos planos do convênio para
               * o formato do ModalSelect
               */
              id: plano.id, label: plano.nome, idConvenio: id, subLabel: nome,
            })))
            .reduce((a, b) => [...a, ...b]),
        });
      } else {
        notify('Nenhum horário encontrado', { autoHideDuration: 3500 });
      }
    } catch (err) {
      notify('Não foi possível buscar os horários', { variant: 'error' });
    }
    setSubmitting(false);
  }

  /**
   * Renderiza as linhas da tabela
   */
  renderHorarios = () => {
    const {
      horariosDisponiveis,
    } = this.state;
    const {
      classes,
    } = this.props;

    /**
     * Renderiza uma linha vazia caso não possua uma horário disponível
     * no array
     */
    if (!horariosDisponiveis.length) {
      return (
        <TableRow>
          <TableCell colSpan={2}>
            <Typography align="center" color="textSecondary">
              Faça uma consulta visualizar os horários...
            </Typography>
          </TableCell>
        </TableRow>
      );
    }


    return horariosDisponiveis.map((horario) => {
      const isHoraPassada = moment(horario.startDate).isBefore(new Date());
      const desabilitarAgendamento = isHoraPassada && !horario.agenda;

      return (
        <Tooltip
          key={`${horario.data}_${horario.hora}`}
          title="2 cliques para agendar"
          placement="top"
          enterDelay={600}
          leaveDelay={100}
          disableHoverListener={desabilitarAgendamento}
        >
          <TableRow
            hover={!desabilitarAgendamento}
            className={classnames(
              classes.tableRow,
              { [classes.disableRow]: desabilitarAgendamento },
            )}
            onDoubleClick={() => this.handleDoubleClickRow(horario)}
          >
            <TableCell align="left" className={classes.tableCellHorarios}>
              {moment(`${horario.data}T${horario.hora}`).format('D [de] MMMM, dddd [às] HH:mm')}
            </TableCell>
            <TableCell align="center">
              {horario.usuario.nome}
            </TableCell>
          </TableRow>
        </Tooltip>
      );
    });
  }

  render() {
    const {
      open,
      handleClose,
      classes,
    } = this.props;
    const {
      eventos,
      planos,
      convenios,
      usuarios,
      diasSemanaOptions,
      openFormNovoAgendamento,
      horarioAgenda,
    } = this.state;

    return (
      <Dialog
        fullScreen
        open={open}
        onEnter={this.loadData}
        onClose={handleClose}
        TransitionComponent={TransitionComponent}
      >
        <AppBar position="relative">
          <Toolbar>
            <IconButton color="inherit" onClick={handleClose} aria-label="Fechar">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.flex}>
              Horários disponíveis
            </Typography>
            <Button onClick={handleClose} color="inherit">
              Cancelar
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Formik
                initialValues={{
                  convenio: '',
                  evento: '',
                  diasSemana: [],
                  usuarios: [],
                  horaInicial: '',
                  horaFinal: '',
                  dataInicial: moment().format('DD/MM/YYYY'),
                  dataFinal: moment().format('DD/MM/YYYY'),
                }}
                validateOnBlur={false}
                validateOnChange={false}
                validationSchema={Yup.object().shape({
                  convenio: Yup.number().required('Campo obrigatório'),
                  evento: Yup.number().required('Campo obrigatório'),
                })}
                onSubmit={this.onSubmitHorariosDisponiveis}
                render={({
                  values,
                  errors,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting,
                }) => (
                  <form onSubmit={handleSubmit}>
                    <Grid className={classes.formFilter} container spacing={2}>
                      <Grid item sm={12} md={5} lg={5}>
                        <ModalSelect
                          label="Evento*"
                          error={!!errors.evento}
                          empty="Nenhum evento encontrado..."
                          placeholderFilter="Filtrar eventos..."
                          value={values.evento}
                          options={eventos.map(({ id, descricao }) => ({ id, label: descricao }))}
                          onChange={value => setFieldValue('evento', value)}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={7} lg={7}>
                        <ModalSelect
                          label="Convênio*"
                          error={!!errors.convenio}
                          empty="Nenhum convênio encontrado..."
                          placeholderFilter="Filtrar convênios..."
                          value={values.convenio}
                          options={convenios
                            .map(({ id, nome }) => ({
                              id, label: nome,
                            }))
                          }
                          onChange={value => setFieldValue('convenio', value)}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={6} lg={6}>
                        <ModalSelect
                          label="Médico"
                          multiple
                          error={!!errors.usuarios}
                          empty="Nenhum médico encontrado..."
                          placeholderFilter="Filtrar médicos..."
                          value={values.usuarios}
                          options={usuarios.map(({ id, nome }) => ({ id, label: nome }))}
                          onChange={value => setFieldValue('usuarios', value)}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={6} lg={6}>
                        <ModalSelect
                          multiple
                          label="Dias da semana*"
                          error={!!errors.diasSemana}
                          placeholderFilter="Filtrar.."
                          value={values.diasSemana}
                          options={diasSemanaOptions.map(dia => ({
                            id: dia.value,
                            label: dia.label,
                          }))}
                          onChange={value => setFieldValue('diasSemana', value)}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <TextField
                          error={!!errors.dataInicial}
                          name="dataInicial"
                          label="Data inicial"
                          value={values.dataInicial}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatData,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <TextField
                          error={!!errors.dataFinal}
                          name="dataFinal"
                          label="Data final"
                          value={values.dataFinal}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatData,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <TextField
                          error={!!errors.horaInicial}
                          name="horaInicial"
                          label="Hora inicial (hh:mm)"
                          value={values.horaInicial}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatHora,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3}>
                        <TextField
                          error={!!errors.horaFinal}
                          name="horaFinal"
                          label="Hora final (hh:mm)"
                          value={values.horaFinal}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatHora,
                          }}
                        />
                      </Grid>
                      <Grid container item sm={12} md={12} lg={12} justify="flex-end">
                        <Button
                          color="secondary"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Pesquisar
                        </Button>
                      </Grid>
                    </Grid>
                    <FormNovoAgendamento
                      horarioAgenda={horarioAgenda}
                      open={openFormNovoAgendamento}
                      planos={planos}
                      eventos={eventos.map(({ id, descricao }) => ({ id, label: descricao }))}
                      evento={eventos.find(({ id }) => id === values.evento)}
                      handleClose={this.handleCloseNovoAgendamento}
                      onComplete={this.onCompleteNovoAgendamento}
                      agendamentoLivre
                    />
                  </form>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" className={classes.tableCellHorarios}>Horários</TableCell>
                    <TableCell colSpan={2} align="center">Médico</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.renderHorarios()}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
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
)(HorariosDisponiveis);
