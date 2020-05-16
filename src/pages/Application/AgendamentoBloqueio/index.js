import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import IconButton from '@material-ui/core/IconButton';

import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import ModalSelect from '../../../components/ModalSelect';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { InputFormatHora, InputFormatData } from '../../../components/InputFormat';

import HorarioBloqueadoService from '../../../services/HorarioBloqueado';
import UsuarioService from '../../../services/Usuario';
import NotificationActions from '../../../store/ducks/notifier';
import { dateValidator, hourValidator } from '../../../libs/utils';

import Material from './styles';
import { Container } from '../../../styles/global';

const formInitialValues = {
  usuario: '',
  dataInicial: '',
  dataFinal: '',
  horaInicial: '',
  horaFinal: '',
  action: 'pesquisar',
};

class AgendamentoBloqueio extends Component {
  static propTypes = {
    notify: PropTypes.func.isRequired,
    unidade: PropTypes.shape({
      id: PropTypes.number,
    }).isRequired,
  }

  state = {
    loading: false,
    medicos: [],
    horariosBloqueados: [],
    page: 0,
    perPage: 15,
    order: 'asc',
    orderBy: 'startDate',
    form: formInitialValues,
  }

  componentDidMount() {
    this.fetchMedicos();
    this.fetchHorarioBloqueado();
  }

  componentDidUpdate(prevProps) {
    const { match: { params } } = this.props;

    if (params.bloqueioId !== prevProps.match.params.bloqueioId) {
      this.fetchHorarioBloqueado();
    }
  }

  fetchMedicos = async () => {
    const { notify, unidade } = this.props;

    try {
      this.setState({ loading: true });
      const medicos = await UsuarioService.search(undefined, true, unidade.id);

      this.setState({ medicos });
    } catch (err) {
      notify('Não foi possível carregar a lista de médicos', { error: 'variant' });
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Busca o horario bloqueado da API
   * de acordo com o ID na URL
   */
  fetchHorarioBloqueado = async () => {
    const {
      unidade,
      history,
      match,
    } = this.props;

    const { params: { bloqueioId } } = match;

    /**
     * Valida se o ID consta na URL
     */
    if (!bloqueioId || !Number(bloqueioId)) return;

    try {
      this.setState({ loading: true });
      /**
       * Busca os dados do horário na API
       */
      let horario = await HorarioBloqueadoService
        .buscar({ horarioId: bloqueioId, empresaUnidade: unidade.id });

      /**
       * Se o horario foi encontrado, atribui
       * os valores no formulário para realizar
       * a alteracão dos dados
       */
      if (horario) {
        horario = this.sanitizeHorarioBloqueado(horario);
        const form = {
          usuario: horario.usuario.id,
          dataInicial: moment(horario.startDate).format('DD/MM/YYYY'),
          dataFinal: moment(horario.endDate).format('DD/MM/YYYY'),
          horaInicial: moment(horario.startDate).format('HH:mm'),
          horaFinal: moment(horario.endDate).format('HH:mm'),
        };
        this.setState({ form });
      } else {
        throw Error();
      }
      this.setState({ loading: false });
    } catch (err) {
      this.setState({ loading: false });
      /**
       * Em caso de erro realiza um refresh na página
       */
      history.replace('/app/agendas/bloqueios');
    }
  }

  /**
   * Exclui um horário bloqueado
   */
  handleClickHorarioExcluir = async (horarioId) => {
    const { notify } = this.props;

    try {
      this.setState({ loading: true });
      await HorarioBloqueadoService.excluir(horarioId);

      this.setState(state => ({
        horariosBloqueados: state.horariosBloqueados
          .filter(({ id }) => id !== horarioId),
      }));

      notify('Horário excluído');
    } catch (err) {
      if (err.response && err.response.data.mensagem) {
        notify(err.response.data.mensagem, { variant: 'error' });
      }
      notify('Não foi possível excluir o horário', { variant: 'error' });
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Cancela a alteração do horário bloqueado
   */
  handleClickCancelEdit = () => {
    const { history } = this.props;
    this.setState({ form: formInitialValues });
    history.replace('/app/agendas/bloqueios');
  }

  /**
   * Atualiza a lista de horários bloqueados
   */
  updateListaHorarioSalvo = (horariosSalvos) => {
    const { horariosBloqueados: horarios } = this.state;
    if (!horarios || !horarios.length) return;

    const horariosBloqueados = [...horarios];

    horariosSalvos.forEach((horarioBloqueadoSalvo) => {
      const indexHorarioSalvo = horariosBloqueados
        .findIndex(({ id }) => id === horarioBloqueadoSalvo.id);
      if (indexHorarioSalvo !== -1) {
        horariosBloqueados[indexHorarioSalvo] = this
          .sanitizeHorarioBloqueado(horarioBloqueadoSalvo);
      }
    });
    this.setState({ horariosBloqueados });
  }

  /**
   * Trata o objeto de horario bloqueado computando
   * algumas propriedades a mais para a manipulação
   * dos dados
   */
  sanitizeHorarioBloqueado = ({
    data, horaInicial, horaFinal, usuario, ...rest
  }) => {
    const startDate = `${data}T${horaInicial}`;
    const endDate = `${data}T${horaFinal}`;

    return {
      ...rest,
      usuario,
      startDate: moment(startDate).toDate(),
      endDate: moment(endDate).toDate(),
      medico: usuario.nome,
      dataLabel: moment(data).format('DD/MM/YYYY'),
      horaInicialLabel: moment(startDate).format('HH:mm'),
      horaFinalLabel: moment(endDate).format('HH:mm'),
    };
  }

  /**
   * Renderiza as linhas vazias na tabela
   */
  renderEmptyRows = (data, page, perPage) => {
    const emptyRows = perPage - Math.min(perPage, data.length - page * perPage);

    return emptyRows > 0 && (
      <TableRow style={{ height: 57 * emptyRows }}>
        <TableCell colSpan={5} />
      </TableRow>
    );
  }

  desc = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  getSorting = (order, orderBy) => {
    const that = this;

    if (order === 'desc') {
      return (a, b) => that.desc(a, b, orderBy);
    }

    return (a, b) => -that.desc(a, b, orderBy);
  }

  stableSort = (array, customComparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = customComparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  }

  onSortTable = (event, orderBy) => {
    const { orderBy: orderByState, order: orderState } = this.state;

    let order = 'desc';

    if (orderByState === orderBy && orderState === 'desc') {
      order = 'asc';
    }

    this.setState({ orderBy, order });
  }

  renderTableBody = () => {
    const { classes, history, match } = this.props;
    const {
      horariosBloqueados,
      order,
      orderBy,
      page,
      perPage,
    } = this.state;

    const TableRows = this
      .stableSort(horariosBloqueados, this.getSorting(order, orderBy))
      .slice(page * perPage, page * perPage + perPage)
      .map(horario => (
        <Tooltip
          key={horario.id}
          title="2 cliques para editar"
          placement="top"
          enterDelay={600}
          leaveDelay={100}
        >
          <TableRow
            className={classes.tableRow}
            hover
            onDoubleClick={() => history.replace(`${match.url}/${horario.id}`)}
          >
            <TableCell>
              {horario.dataLabel}
            </TableCell>
            <TableCell>
              {horario.horaInicialLabel}
            </TableCell>
            <TableCell>
              {horario.horaFinalLabel}
            </TableCell>
            <TableCell>
              {horario.medico}
            </TableCell>
            <TableCell
              align="center"

            >
              <IconButton
                onClick={() => this.handleClickHorarioExcluir(horario.id)}
              >
                <DeleteForeverIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </Tooltip>
      ));
    const EmptyRow = this.renderEmptyRows(horariosBloqueados, page, perPage);

    return (
      <>
        {TableRows}
        {EmptyRow}
      </>
    );
  }

  render() {
    const {
      classes,
      notify,
      unidade,
      match,
      history,
    } = this.props;
    const {
      loading,
      medicos,
      form,
      order,
      orderBy,
    } = this.state;

    return (
      <Container>
        <LoadingIndicator loading={loading} />
        <Grid container spacing={2}>
          <Grid item sm={12} md={12} lg={12}>
            <Paper className={classes.paper} elevation={5}>
              <Formik
                initialValues={form}
                validateOnBlur={false}
                validateOnChange={false}
                enableReinitialize
                validationSchema={Yup.object().shape({
                  usuario: Yup.number()
                    .required('Campo obrigatório'),
                  dataInicial: Yup.string()
                    .required('Campo obrigatório')
                    .test('is-DataInicial', 'Data inicial inválida', value => !!value && dateValidator(value)),
                  dataFinal: Yup.string()
                    .required('Campo obrigatório')
                    .test('is-DataFinal', 'Data final inválida', value => !!value && dateValidator(value)),
                  horaInicial: Yup.string()
                    .when('action', {
                      is: 'salvar',
                      then: Yup.string()
                        .required('Campo obrigatório')
                        .test('is-HoraInicial', 'Hora inicial inválida', hourValidator),
                      otherwise: Yup.string(),
                    }),
                  horaFinal: Yup.string()
                    .when('action', {
                      is: 'salvar',
                      then: Yup.string()
                        .required('Campo obrigatório')
                        .test('is-HoraFinal', 'Hora final inválida', hourValidator),
                      otherwise: Yup.string(),
                    }),
                })}
                onSubmit={async (values, { setSubmitting }) => {
                  const { params: { bloqueioId } } = match;
                  const horarioBloqueadoForm = {
                    ...values,
                    dataInicial: moment(values.dataInicial, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                    dataFinal: moment(values.dataFinal, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                    empresaUnidade: unidade.id,
                    id: bloqueioId,
                    action: undefined,
                  };

                  if (values.action === 'salvar') {
                    try {
                      const { dados: horarioBloqueadoSalvo } = await HorarioBloqueadoService
                        .save(horarioBloqueadoForm);
                      this.updateListaHorarioSalvo(horarioBloqueadoSalvo);
                      notify('Bloqueio salvo com sucesso', { variant: 'success' });
                      this.setState({ form: formInitialValues });
                      history.replace('/app/agendas/bloqueios');
                    } catch (err) {
                      if (err.response && err.response.data.mensagem) {
                        notify(err.response.data.mensagem, { variant: 'error' });
                      } else {
                        notify('Não foi possível realizar o bloqueio', { variant: 'error' });
                      }
                    }
                  }

                  if (values.action === 'pesquisar') {
                    try {
                      const horariosBloqueados = await HorarioBloqueadoService
                        .pesquisar(horarioBloqueadoForm);
                      this.setState({
                        horariosBloqueados: horariosBloqueados
                          .map(this.sanitizeHorarioBloqueado),
                      });
                    } catch (err) {
                      if (err.response && err.response.data.mensagem) {
                        notify(err.response.data.mensagem, { variant: 'error' });
                      } else {
                        notify('Erro durante a pesquisa', { variant: 'error' });
                      }
                    }
                  }
                  setSubmitting(false);
                }}
                render={({
                  values,
                  errors,
                  handleChange,
                  setFieldValue,
                  isSubmitting,
                }) => (
                  <Form className={classes.form}>
                    <Grid container spacing={2} direction="row">
                      {!!match.params.bloqueioId && (
                        <Grid container item sm={12} md={12} lg={12} direction="row" justify="flex-end">
                          <Button
                            color="secondary"
                            onClick={this.handleClickCancelEdit}
                          >
                            Cancelar edição
                          </Button>
                        </Grid>
                      )}
                      <Grid item sm={12} md={4} lg={4}>
                        <ModalSelect
                          label="Médico*"
                          error={!!errors.usuario}
                          empty="Nenhum médico encontrado..."
                          placeholderFilter="Filtrar médicos..."
                          value={values.usuario}
                          options={medicos.map(({ id, nome }) => ({ id, label: nome }))}
                          onChange={value => setFieldValue('usuario', value)}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={2} lg={2}>
                        <TextField
                          error={!!errors.dataInicial}
                          name="dataInicial"
                          label="Data inicial"
                          value={values.dataInicial}
                          onChange={handleChange}
                          fullWidth
                          disabled={!!match.params.bloqueioId}
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatData,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={2} lg={2}>
                        <TextField
                          error={!!errors.dataFinal}
                          name="dataFinal"
                          label="Data final"
                          value={values.dataFinal}
                          onChange={handleChange}
                          fullWidth
                          disabled={!!match.params.bloqueioId}
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatData,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={2} lg={2}>
                        <TextField
                          error={!!errors.horaInicial}
                          name="horaInicial"
                          label="Horário inicial (hh:mm)"
                          value={values.horaInicial}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatHora,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={2} lg={2}>
                        <TextField
                          error={!!errors.horaFinal}
                          name="horaFinal"
                          label="Horário final (hh:mm)"
                          value={values.horaFinal}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            inputComponent: InputFormatHora,
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid className={classes.containerButton} container spacing={2} direction="row" justify="space-between">
                      <Grid item xs={6} sm={6} md={6} lg={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          type="submit"
                          disabled={isSubmitting}
                          onClick={() => setFieldValue('action', 'pesquisar')}
                        >
                          Pesquisar
                        </Button>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} lg={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          type="submit"
                          disabled={isSubmitting}
                          onClick={() => setFieldValue('action', 'salvar')}
                        >
                          Salvar
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              />
            </Paper>
          </Grid>

          <Grid item sm={12} md={12} lg={12}>
            <Paper className={classes.paper} elevation={5}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">
                      <Tooltip
                        title="Ordenar"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === 'startDate'}
                          direction={order}
                          onClick={event => this.onSortTable(event, 'startDate')}
                        >
                          Data
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left">
                      <Tooltip
                        title="Ordenar"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === 'horaInicialLabel'}
                          direction={order}
                          onClick={event => this.onSortTable(event, 'horaInicialLabel')}
                        >
                          Hora inicial
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left">
                      <Tooltip
                        title="Ordenar"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === 'horaFinalLabel'}
                          direction={order}
                          onClick={event => this.onSortTable(event, 'horaFinalLabel')}
                        >
                          Hora final
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left" colSpan={2}>
                      <Tooltip
                        title="Ordenar"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === 'medico'}
                          direction={order}
                          onClick={event => this.onSortTable(event, 'medico')}
                        >
                          Médico
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.renderTableBody()}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
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

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Material),
)(AgendamentoBloqueio);
