import React, { Component, Fragment } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';

import DoneIcon from '@material-ui/icons/Done';

import FormPeriodoSemanal from './components/FormPeriodoSemanal';
import FormDataEspecifica from './components/FormDataEspecifica';
import DrawerEditar from './components/DrawerEditar';
import { hourValidator, dateValidator } from '../../../libs/utils';
import UsuarioService from '../../../services/Usuario';
import ConvenioService from '../../../services/Convenio';
import GradeHorarioService from '../../../services/GradeHorario';
import EventoService from '../../../services/Evento';

import NotificationActions from '../../../store/ducks/notifier';

import Material from './styles';

class GradeHorario extends Component {
  state = {
    tabIndex: 0,
    medicos: [],
    convenios: [],
    eventos: [],
    gruposEvento: [],
    gradesSemanal: [],
    pageSemanal: 0,
    perPageSemanal: 15,
    orderSemanal: 'asc',
    orderBySemanal: 'horaLabel',
    gradesEspecifica: [],
    pageEspecifica: 0,
    perPageEspecifica: 15,
    orderEspecifica: 'asc',
    orderByEspecifica: 'date',
    openDrawerEditar: false,
    gradeHorarioEditarRegras: null,
  }

  componentDidMount() {
    Promise.all([
      this.fetchMedicos(),
      this.fetchConvenios(),
      this.fetchEventosEGrupos(),
    ]);
  }

  fetchMedicos = async () => {
    const { notify, unidadeAtualId } = this.props;

    if (!unidadeAtualId) {
      return;
    }

    try {
      const medicos = await UsuarioService.search(undefined, true, unidadeAtualId);

      this.setState({ medicos });
    } catch (err) {
      notify('Erro ao buscar lista de médicos', { variant: 'error' });
    }
  }

  fetchConvenios = async () => {
    const { notify } = this.props;
    try {
      const convenios = await ConvenioService.getAll();

      this.setState({ convenios });
    } catch (err) {
      notify('Erro ao buscar lista de convênios', { variant: 'error' });
    }
  }

  fetchEventosEGrupos = async () => {
    const { notify } = this.props;
    try {
      const [eventos, gruposEvento] = await Promise.all([
        EventoService.getEventos(true),
        EventoService.getGrupoEventos(true),
      ]);

      this.setState({ eventos, gruposEvento });
    } catch (err) {
      notify('Erro ao buscar lista e eventos e grupos', { variant: 'error' });
    }
  }

  handleClickGradeAtivo = async (grade) => {
    const { notify } = this.props;

    try {
      const { dados: gradeResponse } = await GradeHorarioService.atualizarStatus(grade.id);

      if (gradeResponse.data) {
        const { gradesEspecifica } = this.state;
        const index = gradesEspecifica.findIndex(g => g.id === gradeResponse.id);
        if (index !== -1) {
          gradesEspecifica
            .splice(index, 1, { ...gradesEspecifica[index], ativo: gradeResponse.ativo });
          this.setState({ gradesEspecifica });
        }
      } else {
        const { gradesSemanal } = this.state;
        const index = gradesSemanal.findIndex(g => g.id === gradeResponse.id);
        if (index !== -1) {
          gradesSemanal
            .splice(index, 1, { ...gradesSemanal[index], ativo: gradeResponse.ativo });
          this.setState({ gradesSemanal });
        }
      }
      notify(`Grade de horário ${gradeResponse.ativo ? 'ativada' : 'inativada'}`);
    } catch (err) {
      if (err.response && err.response.data.mensagem) {
        notify(err.response.data.mensagem, { variant: 'error' });
      } else {
        notify('Erro ao alterar status da grade', { variant: 'error' });
      }
    }
  }

  onChangeTabs = (event, tabIndex) => {
    this.setState({ tabIndex });
  }

  onChangeSwipeable = (tabIndex) => {
    this.setState({ tabIndex });
  }

  getDayOfWeek = (javaDiaSemana) => {
    const days = {
      1: 'Segunda-feira',
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      7: 'Domingo',
    };

    return days[javaDiaSemana];
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

  onSortTable = (event, gradeTipo, propriedade) => {
    const {
      [`orderBy${gradeTipo}`]: orderByState,
      [`order${gradeTipo}`]: orderState,
    } = this.state;

    const orderBy = propriedade;
    let order = 'desc';

    if (orderByState === propriedade && orderState === 'desc') {
      order = 'asc';
    }

    this.setState({
      [`orderBy${gradeTipo}`]: orderBy,
      [`order${gradeTipo}`]: order,
    });
  }

  handleDoubleClickTableRow = (grade) => {
    this.setState({
      gradeHorarioEditarRegras: grade,
      openDrawerEditar: true,
    });
  }

  handleCloseDrawerEditar = () => {
    this.setState({
      gradeHorarioEditarRegras: null,
      openDrawerEditar: false,
    });
  }

  handleSaveDrawerEditar = ({
    id, convenios, grupos, eventos, data,
  }) => {
    if (data) {
      const { gradesEspecifica } = this.state;
      const index = gradesEspecifica.findIndex(g => g.id === id);
      if (index !== -1) {
        gradesEspecifica.splice(
          index,
          1,
          {
            ...gradesEspecifica[index],
            grupos,
            eventos,
            convenios,
          },
        );
        this.setState({ gradesEspecifica });
      }
    } else {
      const { gradesSemanal } = this.state;
      const index = gradesSemanal.findIndex(g => g.id === id);
      if (index !== -1) {
        gradesSemanal.splice(
          index,
          1,
          {
            ...gradesSemanal[index],
            grupos,
            eventos,
            convenios,
          },
        );
        this.setState({ gradesSemanal });
      }
    }
  }

  renderEmptyRows = (data, page, perPage) => {
    const emptyRows = perPage - Math.min(perPage, data.length - page * perPage);

    return emptyRows > 0 && (
      <TableRow style={{ height: 57 * emptyRows }}>
        <TableCell colSpan={5} />
      </TableRow>
    );
  }

  renderTableHeadGradeSemanal = () => {
    const { orderSemanal, orderBySemanal } = this.state;

    return (
      <TableHead>
        <TableRow>
          <TableCell aling="left">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderBySemanal === 'diaSemana'}
                direction={orderSemanal}
                onClick={event => this.onSortTable(event, 'Semanal', 'diaSemana')}
              >
                Dia da semana
              </TableSortLabel>
            </Tooltip>
          </TableCell>
          <TableCell align="left">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderBySemanal === 'horaLabel'}
                direction={orderSemanal}
                onClick={event => this.onSortTable(event, 'Semanal', 'horaLabel')}
              >
                Horário
              </TableSortLabel>
            </Tooltip>
          </TableCell>
          <TableCell align="left">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderBySemanal === 'duracaoMinutos'}
                direction={orderSemanal}
                onClick={event => this.onSortTable(event, 'Semanal', 'duracaoMinutos')}
              >
                Duração
              </TableSortLabel>
            </Tooltip>
          </TableCell>
          <TableCell align="center">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderBySemanal === 'ativo'}
                direction={orderSemanal}
                onClick={event => this.onSortTable(event, 'Semanal', 'ativo')}
              >
                Status
              </TableSortLabel>
            </Tooltip>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  renderTableBodyGradeSemanal = () => {
    const {
      gradesSemanal,
      pageSemanal,
      perPageSemanal,
      orderSemanal,
      orderBySemanal,
    } = this.state;
    const { classes } = this.props;

    const RowsToRender = this
      .stableSort(gradesSemanal, this.getSorting(orderSemanal, orderBySemanal))
      .slice(pageSemanal * perPageSemanal, pageSemanal * perPageSemanal + perPageSemanal)
      .map(grade => (
        <Tooltip
          key={grade.id}
          title="2 cliques para editar"
          placement="top"
          enterDelay={600}
          leaveDelay={100}
        >
          <TableRow
            className={classes.tableRow}
            hover
            onDoubleClick={() => this.handleDoubleClickTableRow(grade)}
          >
            <TableCell>
              {grade.diaSemanaLabel}
            </TableCell>
            <TableCell>
              {grade.horaLabel}
            </TableCell>
            <TableCell>
              {`${grade.duracaoMinutos} minutos`}
            </TableCell>
            <TableCell
              align="center"

            >
              <Chip
                style={{ width: 100 }}
                {...({ deleteIcon: grade.ativo ? <DoneIcon /> : undefined })}
                label={grade.ativo ? 'ATIVO' : 'INATIVO'}
                color={grade.ativo ? 'primary' : 'secondary'}
                onDelete={() => this.handleClickGradeAtivo(grade)}
                onClick={() => this.handleClickGradeAtivo(grade)}
                clickable
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        </Tooltip>
      ));
    const EmptyRowsToRender = this.renderEmptyRows(gradesSemanal, pageSemanal, perPageSemanal);

    return (
      <TableBody>
        {RowsToRender}
        {EmptyRowsToRender}
      </TableBody>
    );
  }

  renderTableHeadGradeEspecifica = () => {
    const { orderEspecifica, orderByEspecifica } = this.state;

    return (
      <TableHead>
        <TableRow>
          <TableCell aling="left">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderByEspecifica === 'date'}
                direction={orderEspecifica}
                onClick={event => this.onSortTable(event, 'Especifica', 'date')}
              >
                Data
              </TableSortLabel>
            </Tooltip>
          </TableCell>
          <TableCell align="left">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderByEspecifica === 'horaLabel'}
                direction={orderEspecifica}
                onClick={event => this.onSortTable(event, 'Especifica', 'horaLabel')}
              >
                Horário
              </TableSortLabel>
            </Tooltip>
          </TableCell>
          <TableCell align="left">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderByEspecifica === 'duracaoMinutos'}
                direction={orderEspecifica}
                onClick={event => this.onSortTable(event, 'Especifica', 'duracaoMinutos')}
              >
                Duração
              </TableSortLabel>
            </Tooltip>
          </TableCell>
          <TableCell align="center">
            <Tooltip
              title="Ordernar"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={orderByEspecifica === 'ativo'}
                direction={orderEspecifica}
                onClick={event => this.onSortTable(event, 'Especifica', 'ativo')}
              >
                Status
              </TableSortLabel>
            </Tooltip>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  renderTableBodyGradeEspecifica = () => {
    const {
      gradesEspecifica,
      pageEspecifica,
      perPageEspecifica,
      orderEspecifica,
      orderByEspecifica,
    } = this.state;
    const { classes } = this.props;

    const RowsToRender = this
      .stableSort(gradesEspecifica, this.getSorting(orderEspecifica, orderByEspecifica))
      .slice(
        pageEspecifica * perPageEspecifica,
        pageEspecifica * perPageEspecifica + perPageEspecifica,
      )
      .map(grade => (
        <Tooltip
          key={grade.id}
          title="2 cliques para editar"
          placement="top"
          enterDelay={600}
          leaveDelay={100}
        >
          <TableRow
            className={classes.tableRow}
            hover
            onDoubleClick={() => this.handleDoubleClickTableRow(grade)}
          >
            <TableCell>
              {grade.dataLabel}
            </TableCell>
            <TableCell>
              {grade.horaLabel}
            </TableCell>
            <TableCell>
              {`${grade.duracaoMinutos} minutos`}
            </TableCell>
            <TableCell
              align="center"

            >
              <Chip
                style={{ width: 100 }}
                {...({ deleteIcon: grade.ativo ? <DoneIcon /> : undefined })}
                label={grade.ativo ? 'ATIVO' : 'INATIVO'}
                color={grade.ativo ? 'primary' : 'secondary'}
                onDelete={() => this.handleClickGradeAtivo(grade)}
                onClick={() => this.handleClickGradeAtivo(grade)}
                clickable
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        </Tooltip>
      ));
    const EmptyRowsToRender = this.renderEmptyRows(
      gradesEspecifica,
      pageEspecifica,
      perPageEspecifica,
    );

    return (
      <TableBody>
        {RowsToRender}
        {EmptyRowsToRender}
      </TableBody>
    );
  }

  render() {
    const {
      classes,
      theme,
      unidadeAtualId,
      notify,
    } = this.props;
    const {
      tabIndex,
      medicos,
      convenios,
      eventos,
      gruposEvento,
      gradesSemanal: dadosGradeSemanal,
      pageSemanal,
      perPageSemanal,
      gradesEspecifica: dadosGradeEspecifica,
      pageEspecifica,
      perPageEspecifica,
      openDrawerEditar,
      gradeHorarioEditarRegras,
    } = this.state;

    return (
      <Fragment>
        <AppBar position="static" color="primary">
          <Tabs
            value={tabIndex}
            onChange={this.onChangeTabs}
            variant="fullWidth"
          >
            <Tab label="Período semanal" />
            <Tab label="Data específica" />
          </Tabs>
        </AppBar>
        <Paper className={classes.root}>
          <SwipeableViews
            style={{
              height: '100%',
              display: 'flex',
            }}
            containerStyle={{
              display: 'flex',
              flex: 1,
            }}
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={tabIndex}
            onChangeIndex={this.onChangeSwipeable}
          >
            <Formik
              initialValues={{
                medico: '',
                diasSemana: [],
                convenios: [],
                horaInicial: '',
                horaFinal: '',
                duracao: '',
                eventos: [],
                grupos: [],
                action: 'pesquisar',
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validationSchema={Yup.object().shape({
                medico: Yup.number().required('Campo obrigatório'),
                diasSemana: Yup.array().required('Campo obrigatório').min(1, 'Ao menos um dia da semana'),
                horaInicial: Yup.string().when('action', {
                  is: 'salvar',
                  then: Yup.string()
                    .required('Campo obrigatório')
                    .test('is-horaInicial', 'Hora inválida', hourValidator),
                  otherwise: Yup.string(),
                }),
                horaFinal: Yup.string()
                  .when('action', {
                    is: 'salvar',
                    then: Yup.string()
                      .required('Campo obrigatório')
                      .test('is-horaFinal', 'Hora inválida', hourValidator),
                    otherwise: Yup.string(),
                  }),
                duracao: Yup.string()
                  .when('action', {
                    is: 'salvar',
                    then: Yup.string().required('Campo obrigatório'),
                    otherwise: Yup.string(),
                  }),
              })}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const formPeriodoSemanal = {
                  ...values,
                  usuario: values.medico,
                  empresaUnidade: unidadeAtualId,
                  action: undefined,
                  medico: undefined,
                };

                if (values.action === 'salvar') {
                  try {
                    await GradeHorarioService.gerarHorario(formPeriodoSemanal);
                    resetForm();
                    notify('Grade de horário salva', { variant: 'success' });
                  } catch (err) {
                    if (err.response && err.response.data.mensagem) {
                      notify(err.response.data.mensagem, { variant: 'error' });
                    } else {
                      notify('Erro ao salvar os dados da agenda', { variant: 'error' });
                    }
                  }
                }
                if (values.action === 'pesquisar') {
                  try {
                    const gradesSemanal = await GradeHorarioService
                      .pesquisarPeriodoSemanal(formPeriodoSemanal);

                    if (gradesSemanal && gradesSemanal.length) {
                      this.setState({
                        gradesSemanal: gradesSemanal.map(grade => ({
                          ...grade,
                          diaSemanaLabel: this.getDayOfWeek(grade.diaSemana),
                          horaLabel: moment(grade.hora, 'HH:mm:ss').format('HH:mm'),
                          duracaoMinutos: moment.duration(grade.duracao, 'HH:mm:ss').asMinutes(),
                        })),
                      });
                    } else {
                      notify('Nenhuma grade de horário encontrada', { autoHideDuration: 3500 });
                    }
                  } catch (err) {
                    notify('Erro ao pesquisar dados da agenda', { variant: 'error' });
                  }
                }
                setSubmitting(false);
              }}
              render={props => (
                <Fragment>
                  <FormPeriodoSemanal
                    {...props}
                    convenios={convenios}
                    medicos={medicos}
                    eventos={eventos}
                    gruposEvento={gruposEvento}
                  />
                  <Table>
                    {this.renderTableHeadGradeSemanal()}
                    {this.renderTableBodyGradeSemanal()}
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 15, 20, 30]}
                    component="div"
                    count={dadosGradeSemanal.length}
                    rowsPerPage={perPageSemanal}
                    page={pageSemanal}
                    backIconButtonProps={{
                      'aria-label': 'Anterior',
                    }}
                    nextIconButtonProps={{
                      'aria-label': 'Próxima',
                    }}
                    onChangePage={(event, page) => this.setState({ pageSemanal: page })}
                    onChangeRowsPerPage={(event) => {
                      this.setState({ perPageSemanal: event.target.value });
                    }}
                  />
                </Fragment>
              )}
            />
            <Formik
              initialValues={{
                medico: '',
                dataEspecificaInicial: '',
                dataEspecificaFinal: '',
                convenios: [],
                horaInicial: '',
                horaFinal: '',
                duracao: '',
                action: 'pesquisar',
                eventos: [],
                grupos: [],
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validationSchema={Yup.object().shape({
                medico: Yup.number().required('Campo obrigatório'),
                dataEspecificaInicial: Yup.string().when('action', {
                  is: 'salvar',
                  then: Yup.string()
                    .required('Campo obrigatório')
                    .test('is-dataEspecificaInicial', 'Data inválida', value => !!value && dateValidator(value)),
                  otherwise: Yup.string(),
                }),
                dataEspecificaFinal: Yup.string().when('action', {
                  is: 'salvar',
                  then: Yup.string()
                    .required('Campo obrigatório')
                    .test('is-dataEspecificaFinal', 'Data inválida', value => !!value && dateValidator(value))
                    // eslint-disable-next-line func-names
                    .test('is-validRangeDate', 'Período de data inválido', function (value) {
                      return moment(value, 'DD/MM/YYYY').isSameOrAfter(moment(this.parent.dataEspecificaInicial, 'DD/MM/YYYY'));
                    }),
                  otherwise: Yup.string(),
                }),
                horaInicial: Yup.string()
                  .when('action', {
                    is: 'salvar',
                    then: Yup.string()
                      .required('Campo obrigatório')
                      .test('is-horaInicial', 'Hora inválida', hourValidator),
                    otherwise: Yup.string(),
                  }),
                horaFinal: Yup.string()
                  .when('action', {
                    is: 'salvar',
                    then: Yup.string()
                      .required('Campo obrigatório')
                      .test('is-horaFinal', 'Hora inválida', hourValidator),
                    otherwise: Yup.string(),
                  }),
                duracao: Yup.string()
                  .when('action', {
                    is: 'salvar',
                    then: Yup.string().required('Campo obrigatório'),
                    otherwise: Yup.string(),
                  }),
              })}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const formDataEspecifica = {
                  ...values,
                  usuario: values.medico,
                  empresaUnidade: unidadeAtualId,
                  dataInicial: values.dataEspecificaInicial
                    ? moment(values.dataEspecificaInicial, 'DD/MM/YYYY').format('YYYY-MM-DD')
                    : undefined,
                  dataFinal: values.dataEspecificaFinal
                    ? moment(values.dataEspecificaFinal, 'DD/MM/YYYY').format('YYYY-MM-DD')
                    : undefined,
                  action: undefined,
                  medico: undefined,
                  dataEspecificaInicial: undefined,
                  dataEspecificaFinal: undefined,
                };

                if (values.action === 'salvar') {
                  try {
                    await GradeHorarioService.gerarHorario(formDataEspecifica);
                    resetForm();
                    notify('Grade de horário salva', { variant: 'success' });
                  } catch (err) {
                    if (err.response && err.response.data.mensagem) {
                      notify(err.response.data.mensagem, { variant: 'error' });
                    } else {
                      notify('Erro ao salvar os dados da agenda', { variant: 'error' });
                    }
                  }
                }
                if (values.action === 'pesquisar') {
                  try {
                    const gradesEspecifica = await GradeHorarioService
                      .pesquisarDataEspecifica(formDataEspecifica);

                    if (gradesEspecifica && gradesEspecifica.length) {
                      this.setState({
                        gradesEspecifica: gradesEspecifica
                          .map(grade => ({
                            ...grade,
                            dateFull: moment(`${grade.data}T${grade.hora}`).toDate(),
                            date: moment(grade.data).toDate(),
                            hour: moment(grade.hora).toDate(),
                            dataLabel: moment(grade.data).format('DD/MM/YYYY'),
                            horaLabel: moment(grade.hora, 'HH:mm:ss').format('HH:mm'),
                            duracaoMinutos: moment.duration(grade.duracao, 'HH:mm:ss').asMinutes(),
                          })),
                      });
                    } else {
                      notify('Nenhuma grade de horário encontrada', { autoHideDuration: 3500 });
                    }
                  } catch (err) {
                    notify('Erro ao pesquisar dados da agenda', { variant: 'error' });
                  }
                }
                setSubmitting(false);
              }}
              render={props => (
                <Fragment>
                  <FormDataEspecifica
                    {...props}
                    convenios={convenios}
                    medicos={medicos}
                    eventos={eventos}
                    gruposEvento={gruposEvento}
                  />
                  <Table>
                    {this.renderTableHeadGradeEspecifica()}
                    {this.renderTableBodyGradeEspecifica()}
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 15, 20, 30]}
                    component="div"
                    count={dadosGradeEspecifica.length}
                    rowsPerPage={perPageEspecifica}
                    page={pageEspecifica}
                    backIconButtonProps={{
                      'aria-label': 'Anterior',
                    }}
                    nextIconButtonProps={{
                      'aria-label': 'Próxima',
                    }}
                    onChangePage={(event, page) => this.setState({ pageEspecifica: page })}
                    onChangeRowsPerPage={(event) => {
                      this.setState({ perPageEspecifica: event.target.value });
                    }}
                  />
                </Fragment>
              )}
            />
          </SwipeableViews>
          <DrawerEditar
            open={openDrawerEditar}
            handleClose={this.handleCloseDrawerEditar}
            gradeHorario={gradeHorarioEditarRegras}
            onSave={this.handleSaveDrawerEditar}
            convenios={convenios}
            eventos={eventos}
            gruposEvento={gruposEvento}
          />
        </Paper>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  unidadeAtualId: state.user.unidades.length
    ? state.user.unidades.find(unidade => unidade.current).unidade.id
    : undefined,
});

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Material, { withTheme: true }),
)(GradeHorario);
