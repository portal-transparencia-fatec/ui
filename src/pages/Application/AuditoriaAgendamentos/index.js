import React, { Component } from 'react';
import moment from 'moment';
import {
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Divider,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import uuid from 'uuid/v4';

import AuditoriaService from '../../../services/Auditoria';
import UsuarioService from '../../../services/Usuario';
import ModalSelect from '../../../components/ModalSelect';
import LoadingIndicator from '../../../components/LoadingIndicator';
import TablePaginationActions from '../../../components/TablePaginationActions';
import NotificationActions from '../../../store/ducks/notifier';
import { Container } from '../../../styles/global';

import Material from './styles';

class AuditoriaAgendamentos extends Component {
  state = {
    ocorrencia: '',
    ocorrencias: {
      1: 'INSERÇÃO',
      2: 'ALTERAÇÃO',
      3: 'REMOÇÃO',
    },
    paciente: '',
    pacientes: [],
    tables: [],
    table: '',
    colunasGroup: [],
    columns: [],
    rows: [],
    agendaMedicos: [],
    agendaMedico: '',
    dateStartOcorrencia: moment().startOf('month').format('YYYY-MM-DD[T]HH:mm:ss'),
    dateStartAgendamento: moment().startOf('month').format('YYYY-MM-DD[T]HH:mm:ss'),
    dateNowOcorrencia: moment().startOf('week').format('YYYY-MM-DD[T]HH:mm:ss'),
    dateNowAgendamento: moment().startOf('week').format('YYYY-MM-DD[T]HH:mm:ss'),
    pagina: 0,
    limite: 25,
    total: 0,
    loadingSearch: false,
  }

  componentDidMount = () => {
    this.fetchMedicos();
    this.fetchTables();
  }

  componentDidUpdate = (prevProps, prevState) => {
    const { unidade } = this.props;
    const { table } = this.state;

    if (unidade.id !== prevProps.unidade.id) {
      this.fetchMedicos();
    }

    if (table !== prevState.table) {
      this.fecthColumns();
    }
  }


  fetchMedicos = async () => {
    const { notify, unidade } = this.props;

    if (!unidade.id) {
      return;
    }

    try {
      const agendaMedicos = await UsuarioService.search(true, true, unidade.id);
      await this.setState({ agendaMedicos });
    } catch (err) {
      notify('Erro ao buscar lista de médicos', { variant: 'error' });
    }
  }

  fetchTables = async () => {
    const { notify } = this.props;
    try {
      const tables = await AuditoriaService.getAllTables();

      this.setState({ tables });
    } catch (err) {
      notify('Erro ao buscar lista de recursos', { variant: 'error' });
    }
  }

  fecthColumns = async () => {
    const { notify } = this.props;
    const { table } = this.state;

    if (!table) {
      notify('Selecione um recurso que deseja consultar');
    }

    try {
      const columns = await AuditoriaService.getAllColumns(table);

      this.setState({
        columns,
        colunasGroup: columns.map(({ coluna }) => coluna.toUpperCase()),
      });
    } catch (err) {
      notify('Erro ao buscar lista de campos', { variant: 'error' });
    }
  }

  fecthResults = async () => {
    this.setState({ loadingSearch: true });
    const {
      ocorrencias,
      dateStartOcorrencia,
      dateNowOcorrencia,
      dateStartAgendamento,
      dateNowAgendamento,
      paciente,
      ocorrencia,
      agendaMedico,
      table,
      pagina,
      limite,
    } = this.state;
    const { notify, unidade } = this.props;

    const dateNowOcorrenciaFormat = moment(dateNowOcorrencia).format('YYYY-MM-DD[T]HH:mm:ss');
    const dateStartOcorrenciaFormat = moment(dateStartOcorrencia).format('YYYY-MM-DD[T]HH:mm:ss');
    const dateNowAgendamentoFormat = moment(dateNowAgendamento).format('YYYY-MM-DD');
    const dateStartAgendamentoFormat = moment(dateStartAgendamento).format('YYYY-MM-DD');

    try {
      const { resultados: rows, totalResultados } = await AuditoriaService.getAll({
        tabela: table,
        empresaUnidade: unidade.id,
        dateStartOcorrencia: dateStartOcorrenciaFormat,
        dateNowOcorrencia: dateNowOcorrenciaFormat,
        ocorrencia: ocorrencias[ocorrencia],
        ...(this.isAuditoryAgenda() ? {
          dateStartAgendamento: dateStartAgendamentoFormat,
          dateNowAgendamento: dateNowAgendamentoFormat,
          paciente,
          agendaMedico,
        } : {}),
        pagina: pagina + 1,
        limite,
      });
      this.setState({ rows, total: totalResultados });
      if (!rows.length) {
        notify('Nenhum resultado encontrado!', { variant: 'warning' });
      }
    } catch (err) {
      console.log(err);
      notify('Erro ao buscar resultados', { variant: 'error' });
    } finally {
      this.setState({ loadingSearch: false });
    }
  }

  handleChangeCampos = async (colunasGroup) => {
    const { columns } = this.state;

    this.setState({
      colunasGroup: columns
        .filter(({ coluna }) => colunasGroup.includes(coluna.toUpperCase()))
        .map(({ coluna }) => coluna.toUpperCase()),
    });
  }

  handleChangeAgendaMedico = async (agendaMedico) => {
    this.setState({ agendaMedico });
  }

  handleChangePaciente = (nomePaciente) => {
    this.setState({ paciente: nomePaciente });
  }

  handleChangeOcorrencias = (ocorrencia) => {
    this.setState({ ocorrencia });
  }

  handleClickPesquisar = () => {
    if (this.validateForm()) {
      this.fecthResults();
    }
  }

  handleChangePage = (event, pagina) => {
    this.setState({ pagina }, this.fecthResults);
  }

  handleChangeRowsPerPage = (event) => {
    this.setState({ limite: event.target.value }, this.fecthResults);
  }

  validateForm = () => {
    const {
      dateStartOcorrencia,
      dateNowAgendamento,
      dateStartAgendamento,
      dateNowOcorrencia,
      table,
      colunasGroup,
    } = this.state;

    if (!this.isAuditoryAgenda()) {
      return (dateStartOcorrencia
        && dateNowOcorrencia
        && table
        && colunasGroup.length);
    }

    return (dateStartOcorrencia
    && dateNowOcorrencia
    && dateStartAgendamento
    && dateNowAgendamento
    && table
    && colunasGroup.length);
  }

  isAuditoryAgenda = () => {
    const { table } = this.state;

    return table === 'auditory_agenda';
  }

  render() {
    const { classes } = this.props;
    const {
      ocorrencia,
      ocorrencias,
      rows,
      tables,
      table,
      columns,
      colunasGroup,
      agendaMedico,
      agendaMedicos,
      dateStartOcorrencia,
      dateStartAgendamento,
      dateNowOcorrencia,
      dateNowAgendamento,
      pagina,
      limite,
      total,
      loadingSearch,
    } = this.state;
    const isAuditoryAgenda = this.isAuditoryAgenda();

    return (
      <Container>
        <LoadingIndicator loading={loadingSearch} />
        <Grid container spacing={2}>
          <Paper className={classes.paper}>
            <Grid container spacing={2}>
              <Grid
                container
                spacing={2}
                item
                sm={12}
                md={isAuditoryAgenda ? 6 : 12}
                lg={isAuditoryAgenda ? 6 : 12}
              >
                <Grid item sm={12} md={12} lg={12}>
                  <Typography align="center">
                    Período das ocorrências
                  </Typography>
                </Grid>
                <Grid item sm={12} md={12} lg={12}>
                  <TextField
                    id="datetime-local"
                    label="Data Inicial"
                    type="datetime-local"
                    value={dateStartOcorrencia}
                    onChange={(e) => {
                      this.setState({ dateStartOcorrencia: e.target.value });
                    }}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item sm={12} md={12} lg={12}>
                  <TextField
                    id="datetime-local"
                    label="Data Final"
                    type="datetime-local"
                    value={dateNowOcorrencia}
                    onChange={(e) => {
                      this.setState({ dateNowOcorrencia: e.target.value });
                    }}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              {!!isAuditoryAgenda && (
                <Grid container spacing={2} item sm={12} md={6} lg={6}>
                  <Grid item sm={12} md={12} lg={12}>
                    <Typography align="center">
                      Período dos agendamentos
                    </Typography>
                  </Grid>
                  <Grid item sm={12} md={12} lg={12}>
                    <TextField
                      id="datetime-local"
                      label="Data Inicial"
                      type="datetime-local"
                      value={dateStartAgendamento}
                      onChange={(e) => {
                        this.setState({ dateStartAgendamento: e.target.value });
                      }}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item sm={12} md={12} lg={12}>
                    <TextField
                      id="datetime-local"
                      label="Data Final"
                      type="datetime-local"
                      value={dateNowAgendamento}
                      onChange={(e) => {
                        this.setState({ dateNowAgendamento: e.target.value });
                      }}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              )}

              {!!isAuditoryAgenda && (
                <Grid item sm={12} md={12} lg={12}>
                  <Divider variant="fullWidth" style={{ margin: '20px 0' }} />
                </Grid>
              )}

              {!!isAuditoryAgenda && (
                <>
                  <Grid item sm={12} md={3} lg={3}>
                    <ModalSelect
                      label="Médico"
                      empty="Lista de médicos vazia..."
                      value={agendaMedico}
                      options={agendaMedicos.map(medico => ({
                        id: medico.id,
                        label: medico.nome,
                      }))}
                      onChange={this.handleChangeAgendaMedico}
                      textfieldProps={{
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={3}
                    lg={3}
                  >
                    <TextField
                      label="Paciente"
                      placeholder="Procurar..."
                      margin="dense"
                      fullWidth
                      onChange={({ target }) => this.setState({ paciente: target.value })}
                    />
                  </Grid>
                </>
              )}

              {!isAuditoryAgenda && (
                <Grid item sm={12} md={12} lg={12}>
                  <Divider variant="fullWidth" style={{ margin: '20px 0' }} />
                </Grid>
              )}

              <Grid item sm={12} md={isAuditoryAgenda ? 2 : 4} lg={isAuditoryAgenda ? 2 : 4}>
                <ModalSelect
                  label="Ocorrência"
                  empty="Lista de ocorrências vazia..."
                  value={ocorrencia}
                  options={Object.keys(ocorrencias).map(key => ({
                    id: key,
                    label: ocorrencias[key],
                  }))}
                  onChange={this.handleChangeOcorrencias}
                  textfieldProps={{
                    fullWidth: true,
                  }}
                />
              </Grid>

              <Grid item sm={12} md={isAuditoryAgenda ? 2 : 4} lg={isAuditoryAgenda ? 2 : 4}>
                <ModalSelect
                  label="Recursos*"
                  empty="Lista de recursos vazia..."
                  value={table}
                  options={tables.map(({ tabela, exibicao }) => ({
                    id: tabela,
                    label: exibicao.toUpperCase(),
                  }))}
                  onChange={value => this.setState({ table: value })}
                  textfieldProps={{
                    fullWidth: true,
                  }}
                />
              </Grid>

              <Grid item sm={12} md={isAuditoryAgenda ? 2 : 4} lg={isAuditoryAgenda ? 2 : 4}>
                <ModalSelect
                  label="Campos*"
                  empty="Lista de campos vazia..."
                  value={colunasGroup}
                  multiple
                  options={columns.map(({ coluna, exibicao }) => ({
                    id: coluna.toUpperCase(),
                    label: exibicao.toUpperCase(),
                  }))}
                  onChange={this.handleChangeCampos}
                  disabled={!table}
                  textfieldProps={{
                    fullWidth: true,
                  }}
                />
              </Grid>

              <Grid item sm={12} md={12} lg={12}>
                <Button
                  onClick={this.handleClickPesquisar}
                  color="secondary"
                  variant="contained"
                  fullWidth
                >
                  Pesquisar
                </Button>
              </Grid>
            </Grid>
            {!!this.validateForm() && (
              <>
                <Grid style={{ maxHeight: '57.5%', overflow: 'auto' }}>
                  <Table className={classes.table} style={{ paddingTop: 10, overflowX: 'hidden' }}>
                    <TableHead>
                      <TableRow>
                        {colunasGroup.map(data => (
                          <TableCell key={data} align="left">{data}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>

                      {rows.map(dados => (
                        <TableRow hover key={uuid()}>
                          {colunasGroup.map(column => (
                            <TableCell key={column} align="left">{dados[column.toLowerCase()]}</TableCell>
                          ))
                          }
                          <TableCell />
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    classes={{
                      spacer: classes.paginationLeft,
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={limite}
                    page={pagina}
                    labelRowsPerPage="Limite por página"
                    backIconButtonProps={{
                      'aria-label': 'Página anterior',
                    }}
                    nextIconButtonProps={{
                      'aria-label': 'Próxima página',
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    ActionsComponent={paginationProps => (
                      <TablePaginationActions {...paginationProps} loading={loadingSearch} />
                    )}
                  />
                </Grid>  
              </>
            )}
          </Paper>
        </Grid>
      </Container>
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

export default connect(
  mapStateToProps, mapDispatchToProps,
)(withStyles(Material)(AuditoriaAgendamentos));
