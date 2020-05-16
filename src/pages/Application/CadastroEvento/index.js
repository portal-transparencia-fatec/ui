/* eslint-disable no-param-reassign */
import React, { Component, Fragment } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { compose } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import DoneIcon from '@material-ui/icons/Done';

import FormGrupoEvento from './components/FormGrupoEvento';
import FormEvento from './components/FormEvento';
import EventoService from '../../../services/Evento';

import NotificationActions from '../../../store/ducks/notifier';
import { hourValidator } from '../../../libs/utils';

import Material from './styles';

class CadastroEvento extends Component {
  state = {
    tabIndex: 0,
    updateEvento: {
      id: null,
      descricao: '',
      duracao: '',
      ativo: true,
      valorPadrao: '',
      tipoEvento: '',
    },
    updateGrupoEvento: {
      id: null,
      descricao: '',
      eventos: [],
      ativo: true,
    },
    grupoEventos: [],
    selectedGrupoEvento: {},
    filtroGrupoEvento: '',
    filtroStatusGrupoEvento: true,
    eventos: [],
    eventosDoGrupo: [],
    filtroEvento: '',
    filtroStatusEvento: true,
    anchorElMenuEvento: null,
    anchorElMenuGrupo: null,
    selectedMenuEvento: null,
    selectedMenuGrupo: null,
  }

  componentDidMount() {
    Promise.all([
      this.fetchGrupoEventos(),
      this.fetchEventos(),
    ]);
  }

  fetchGrupoEventos = async () => {
    const { notify } = this.props;
    try {
      const grupoEventos = await EventoService.getGrupoEventos(null);
      console.log(grupoEventos);

      // this.setState({ grupoEventos, selectedGrupoEvento: grupoEventos[0] || {} });
    } catch (err) {
      notify('Erro ao buscar os grupos de eventos', { variant: 'error' });
    }
  }

  fetchEventos = async () => {
    const { notify } = this.props;

    try {
      const eventos = await EventoService.getEventos(null);

      this.setState({ eventos });
    } catch (err) {
      notify('Erro ao buscar os eventos', { variant: 'error' });
    }
  }

  getEventosAtivos = () => {
    const { eventos } = this.state;
    return eventos.filter(grupo => grupo.ativo);
  }

  onChangeTabs = (event, tabIndex) => {
    this.setState({ tabIndex });
  }

  onChangeSwipeable = (tabIndex) => {
    this.setState({ tabIndex });
  }

  onChangeFiltroGrupoEvento = (event) => {
    this.setState({ filtroGrupoEvento: event.target.value });
  }

  onChangeFiltroStatusGrupo = (event) => {
    this.setState({ filtroStatusGrupoEvento: event.target.checked });
  }

  onChangeFiltroEvento = (event) => {
    this.setState({ filtroEvento: event.target.value });
  }

  onChangeFiltroStatusEvento = async () => {
    const { filtroStatusEvento } = this.state;
    await this.fetchEventos();
    this.setState({ filtroStatusEvento: !filtroStatusEvento });
  }

  onClickRowEvento = (event, evento) => {
    if (event.target.tagName === 'TD') {
      // console.log(evento);
    } else {
      this.setState({
        anchorElMenuEvento: event.target,
        selectedMenuEvento: evento,
      });
    }
  }

  onClickRowGrupo = (event, grupo) => {
    if (event.target.tagName === 'TD') {
      this.setState({
        eventosDoGrupo: [...grupo.eventos],
        selectedGrupoEvento: grupo,
      });
    } else {
      this.setState({
        anchorElMenuGrupo: event.target,
        selectedMenuGrupo: grupo,
      });
    }
  }

  onCloseMenuEvento = () => {
    this.setState({
      anchorElMenuEvento: null,
      selectedMenuEvento: null,
    });
  }

  onCloseMenuGrupo = () => {
    this.setState({
      anchorElMenuGrupo: null,
      selectedMenuGrupo: null,
    });
  }

  onClickUpdateEvento = () => {
    const { selectedMenuEvento } = this.state;
    const updateEvento = {
      id: selectedMenuEvento.id,
      descricao: selectedMenuEvento.descricao,
      duracao: moment(selectedMenuEvento.duracao, 'HH:mm:ss').format('HH:mm'),
      ativo: selectedMenuEvento.ativo,
      tipoEvento: selectedMenuEvento.tipoEvento,
      valorPadrao: selectedMenuEvento.valorPadrao,
    };
    this.setState({ updateEvento });
    this.onCloseMenuEvento();
  }

  onClickUpdateGrupo = () => {
    const { selectedMenuGrupo } = this.state;
    const eventos = selectedMenuGrupo.eventos.length
      ? selectedMenuGrupo.eventos.filter(e => e.evento.ativo).map(e => e.evento)
      : [];
    const updateGrupoEvento = {
      id: selectedMenuGrupo.id,
      descricao: selectedMenuGrupo.descricao,
      eventos,
      ativo: selectedMenuGrupo.ativo,
    };
    this.setState({ updateGrupoEvento });
    this.onCloseMenuGrupo();
  }

  onResetFormEvento = () => {
    this.setState({
      updateEvento: {
        id: null,
        descricao: '',
        duracao: '',
        ativo: true,
        valorPadrao: '',
      },
    });
  }

  onResetFormGrupo = () => {
    this.setState({
      updateGrupoEvento: {
        id: null,
        descricao: '',
        eventos: [],
        ativo: true,
      },
    });
  }

  handleToggleEventoStatus = (evento, index) => async () => {
    const { notify } = this.props;
    const { eventos } = this.state;
    try {
      await EventoService.atualizarStatusEvento(evento.id);
      this.setState({ eventos: eventos.filter(({ id }) => id !== evento.id) });
    } catch (err) {
      if (err.response && err.response.data.mensagem) {
        notify(err.response.data.mensagem, { variant: 'error' });
      } else {
        notify('Não foi possível alterar o status', { variant: 'error' });
      }
    }
  }

  handleToggleGrupoStatus = (grupo, index) => async () => {
    const { notify } = this.props;
    // const { grupos } = this.state;
    try {
      grupo.ativo = !grupo.ativo;
      await EventoService.saveGrupoEvento({
        ...grupo,
        eventos: grupo.eventos.map(evento => evento.id),
      });
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data.mensagem) {
        notify(err.response.data.mensagem, { variant: 'error' });
      } else {
        notify('Não foi possível alterar o status', { variant: 'error' });
      }
    }
  }

  isFilteredGrupoEvento = (grupoEvento) => {
    const { filtroGrupoEvento, filtroStatusGrupoEvento } = this.state;
    let filter = true;

    if (!String(filtroGrupoEvento).trim() && grupoEvento.ativo === filtroGrupoEvento) {
      return filter;
    }

    if (new RegExp(filtroGrupoEvento, 'ig').test(grupoEvento.descricao) && grupoEvento.ativo === filtroStatusGrupoEvento) {
      return filter;
    }

    filter = false;
    return filter;
  }

  isFilteredEventoFromGrupo = ({ evento }) => {
    const { filtroEvento, filtroStatusEvento } = this.state;
    let filter = true;

    if (!String(filtroEvento).trim() && evento.ativo === filtroStatusEvento) {
      return filter;
    }

    if (new RegExp(filtroEvento, 'ig').test(evento.descricao) && evento.ativo === filtroStatusEvento) {
      return filter;
    }

    filter = false;
    return filter;
  }

  isFilteredEvento = (evento) => {
    const { filtroEvento, filtroStatusEvento } = this.state;
    let filter = true;

    if (!String(filtroEvento).trim() && evento.ativo === filtroStatusEvento) {
      return filter;
    }

    if (new RegExp(filtroEvento, 'ig').test(evento.descricao) && evento.ativo === filtroStatusEvento) {
      return filter;
    }

    filter = false;
    return filter;
  }

  render() {
    const { classes, theme, notify } = this.props;
    const {
      tabIndex,
      updateEvento,
      updateGrupoEvento,
      grupoEventos,
      selectedGrupoEvento,
      filtroGrupoEvento,
      filtroStatusGrupoEvento,
      eventosDoGrupo,
      filtroEvento,
      filtroStatusEvento,
      eventos,
      anchorElMenuEvento,
      selectedMenuEvento,
      anchorElMenuGrupo,
      selectedMenuGrupo,
    } = this.state;
    const openMenuEvento = Boolean(anchorElMenuEvento);
    const openMenuGrupo = Boolean(anchorElMenuGrupo);

    return (
      <Fragment>
        <AppBar position="static" color="primary">
          <Tabs
            value={tabIndex}
            onChange={this.onChangeTabs}
            variant="fullWidth"
          >
            <Tab label="Eventos" />
            <Tab label="Grupos de evento" />
          </Tabs>
        </AppBar>
        <Paper
          className={classes.root}
          style={{
            marginBottom: 0,
            height: 870,
            minHeight: '100%',
          }}
        >
          <SwipeableViews
            style={{
              display: 'flex',
              height: '100%',
            }}
            containerStyle={{
              display: 'flex',
              flex: 1,
              height: '100%',
              // overflow: 'hidden',
            }}
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={tabIndex}
            onChangeIndex={this.onChangeSwipeable}
          >
            <Fragment>
              <Formik
                initialValues={updateEvento}
                enableReinitialize
                validateOnBlur={false}
                validateOnChange={false}
                validationSchema={
                  Yup.object().shape({
                    descricao: Yup.string()
                      .required('Campo obrigatório')
                      .min(3, 'Mínimo de 3 caracteres'),
                    duracao: Yup.string()
                      .test('is-duracao', 'Formato inválido', (value) => {
                        if (typeof value === 'undefined') {
                          return true;
                        }
                        return hourValidator(value);
                      }),
                    ativo: Yup.boolean().required('Campo obrigatório'),
                    tipoEvento: Yup.string()
                      .required('Campo obrigatório'),
                    valorPadrao: Yup.number()
                      .required('Campo obrigatório'),
                  })
                }
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  const formEvento = {
                    ...values,
                    id: updateEvento.id ? updateEvento.id : undefined,
                  };

                  try {
                    await EventoService.saveEvento(formEvento);
                    this.fetchEventos();
                    this.fetchGrupoEventos();
                    resetForm();
                    setSubmitting(false);
                    this.onResetFormEvento();
                    notify('Evento salvo com sucesso', { variant: 'success' });
                  } catch (err) {
                    if (err.response && err.response.data.mensagem) {
                      notify(err.response.data.mensagem, { variant: 'error' });
                    } else {
                      notify('Erro ao salvar os dados do evento', { variant: 'error' });
                    }
                    setSubmitting(false);
                  }
                }}
                render={props => (
                  <FormEvento {...props} evento={updateEvento} onCancel={this.onResetFormEvento} />
                )}
              />
              <Divider style={{ margin: '0 16px 8px 16px' }} />
              <Grid container direction="row" justify="space-between" style={{ minWidth: 400, flex: 1 }}>
                <Grid item sm={12} md={12} lg={12}>
                  <Toolbar
                    style={{ maxHeight: 100, height: '100%', width: '100%' }}
                  >
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography style={{ fontStyle: 'italic' }} component="h2" variant="h5" color="textPrimary">
                          Lista de Eventos
                        </Typography>
                        <Typography style={{ fontStyle: 'italic' }} component="p" variant="body2" color="textSecondary">
                          Selecione um evento para visualizar os grupos na qual pertence
                        </Typography>
                      </Grid>
                      {!!eventos.length && (
                        <Grid container spacing={2} item xs={12} sm={6} md={6} lg={6} alignItems="flex-end">
                          <Grid item sm={8} md={8} lg={8}>
                            <TextField
                              name="filtroEvento"
                              value={filtroEvento}
                              onChange={this.onChangeFiltroEvento}
                              placeholder="Filtrar eventos..."
                              label="Pesquisar"
                              margin="normal"
                              type="search"
                              fullWidth
                            />
                          </Grid>
                          <Grid item sm={1} md={1} lg={1}>
                            <FormGroup>
                              <FormControlLabel
                                control={(
                                  <Switch
                                    checked={filtroStatusEvento}
                                    name="status"
                                    onChange={event => this.onChangeFiltroStatusEvento(event)}
                                    color="primary"
                                    value="bool"
                                  />
                                )}
                                label="Ativo?"
                              />
                            </FormGroup>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Toolbar>
                  <Table style={{ flex: 1, maxHeight: 600, overflowY: 'hidden' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody style={{ overflowY: 'auto' }}>
                      {eventos.length ? (
                        eventos.filter(this.isFilteredEvento).map((evento, index) => (
                          <TableRow
                            className={classNames({
                              // [classes.selected]: evento.id === selectedEvento.id,
                            })}
                            hover
                            key={evento.id}
                            // onClick={event => this.onClickRowEvento(event, evento)}
                          >
                            <TableCell>{evento.descricao}</TableCell>
                            <TableCell align="center">
                              <Chip
                                style={{ width: 100 }}
                                {
                                  ...({
                                    deleteIcon: evento.ativo
                                      ? <DoneIcon />
                                      : undefined,
                                  })
                                }
                                label={evento.ativo ? 'ATIVA' : 'DESABILITADA'}
                                color={evento.ativo ? 'primary' : 'secondary'}
                                onDelete={this.handleToggleEventoStatus(evento, index)}
                                onClick={this.handleToggleEventoStatus(evento, index)}
                                clickable
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={event => this.onClickRowEvento(event, evento)}
                                style={{ padding: 5 }}
                                aria-label="Mais opções"
                                arial-label="Mais"
                                aria-owns={openMenuEvento ? `menu-${evento.id}` : undefined}
                                aria-haspopup="true"
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="4" align="center" color="textSecondary"><i>Lista de eventos vazia...</i></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Fragment>
            <Fragment>
              <Formik
                initialValues={updateGrupoEvento}
                enableReinitialize
                validateOnBlur={false}
                validateOnChange={false}
                validationSchema={
                  Yup.object().shape({
                    descricao: Yup.string()
                      .required('Campo obrigatório')
                      .min(3, 'Mínimo de 3 caracteres'),
                    eventos: Yup.array().min(1, 'Escolha ao menos uma opção'),
                    ativo: Yup.boolean().required('Campo obrigatório'),
                  })
                }
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    if (!updateGrupoEvento.id) {
                      await EventoService.saveGrupoEvento({
                        ...values,
                        eventos: values.eventos.map(evento => evento.id),
                      });
                    } else {
                      await EventoService.saveGrupoEvento({
                        ...values,
                        eventos: values.eventos.map(evento => evento.id),
                        id: updateGrupoEvento.id,
                      });
                    }
                    this.fetchGrupoEventos();
                    this.onResetFormGrupo();
                    setSubmitting(false);
                    notify('Grupo de eventos salvo com sucesso', { variant: 'success' });
                  } catch (err) {
                    if (err.response && err.response.data.mensagem) {
                      notify(err.response.data.mensagem, { variant: 'error' });
                    } else {
                      notify('Erro ao salvar os dados do grupo de eventos', { variant: 'error' });
                    }
                    setSubmitting(false);
                  }
                }}
                render={props => (
                  <FormGrupoEvento
                    {...props}
                    eventos={this.getEventosAtivos()}
                    grupoEvento={updateGrupoEvento}
                    onCancel={this.onResetFormGrupo}
                  />
                )}
              />
              <Divider style={{ margin: '0 16px 8px 16px' }} />
              <Grid container direction="row" justify="space-between" style={{ minWidth: 400, flex: 1 }}>
                <Grid item sm={12} md={6} lg={6}>
                  <Toolbar
                    style={{ maxHeight: 100, height: '100%', width: '100%' }}
                  >
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography style={{ fontStyle: 'italic' }} component="h2" variant="h5" color="textPrimary">
                          Lista de Grupos de Evento
                        </Typography>
                        <Typography style={{ fontStyle: 'italic' }} component="p" variant="body2" color="textSecondary">
                          Selecione um grupo para visualizar seus eventos
                        </Typography>
                      </Grid>
                      {!!grupoEventos.length && (
                        <Grid container spacing={2} item xs={12} sm={6} md={6} lg={6} alignItems="flex-end">
                          <Grid item sm={8} md={8} lg={8}>
                            <TextField
                              name="filtroGrupoEvento"
                              value={filtroGrupoEvento}
                              onChange={this.onChangeFiltroGrupoEvento}
                              placeholder="Filtrar grupos de evento..."
                              label="Pesquisar"
                              margin="normal"
                              type="search"
                              fullWidth
                            />
                          </Grid>
                          <Grid item sm={1} md={1} lg={1}>
                            <FormGroup>
                              <FormControlLabel
                                control={(
                                  <Switch
                                    checked={filtroStatusGrupoEvento}
                                    name="status"
                                    onChange={this.onChangeFiltroStatusGrupo}
                                    color="primary"
                                    value="bool"
                                  />
                                )}
                                label="Ativo?"
                              />
                            </FormGroup>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Toolbar>
                  <Table style={{ flex: 1, maxHeight: 600, overflowY: 'hidden' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody style={{ overflowY: 'auto' }}>
                      {grupoEventos.length ? (
                        grupoEventos.filter(this.isFilteredGrupoEvento).map((grupo, index) => (
                          <TableRow
                            className={classNames({
                              [classes.selectedGrupo]: grupo.id === selectedGrupoEvento.id,
                            })}
                            style={{ cursor: 'pointer' }}
                            hover
                            key={grupo.id}
                            onClick={event => this.onClickRowGrupo(event, grupo)}
                          >
                            <TableCell>{grupo.descricao}</TableCell>
                            <TableCell align="center">
                              <Chip
                                style={{ width: 100 }}
                                {
                                  ...({
                                    deleteIcon: grupo.ativo
                                      ? <DoneIcon />
                                      : undefined,
                                  })
                                }
                                label={grupo.ativo ? 'ATIVO' : 'INATIVO'}
                                color={grupo.ativo ? 'primary' : 'secondary'}
                                onDelete={this.handleToggleGrupoStatus(grupo, index)}
                                onClick={this.handleToggleGrupoStatus(grupo, index)}
                                clickable
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                style={{ padding: 5 }}
                                aria-label="Mais opções"
                                arial-label="Mais"
                                aria-owns={openMenuGrupo ? `menu-${grupo.id}` : undefined}
                                aria-haspopup="true"
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="4" align="center" color="textSecondary"><i>Lista grupo de eventos vazia...</i></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item sm={12} md={6} lg={6}>
                  <Toolbar
                    style={{ maxHeight: 100, height: '100%', width: '100%' }}
                  >
                    {selectedGrupoEvento.id ? (
                      <Grid container direction="row" alignItems="center">
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                          <Typography component="h2" variant="h5" color="textPrimary">
                            <i>{selectedGrupoEvento.descricao}</i>
                          </Typography>
                        </Grid>
                        <Grid container spacing={2} item xs={12} sm={6} md={6} lg={6} alignItems="flex-end">
                          <Grid item sm={8} md={8} lg={8}>
                            <TextField
                              name="filtroEvento"
                              value={filtroEvento}
                              onChange={this.onChangeFiltroEvento}
                              placeholder="Filtrar eventos..."
                              label="Pesquisar"
                              margin="normal"
                              fullWidth
                            />
                          </Grid>
                          <Grid item sm={1} md={1} lg={1}>
                            <FormGroup>
                              <FormControlLabel
                                control={(
                                  <Switch
                                    checked={filtroStatusEvento}
                                    name="status"
                                    onChange={event => this.onChangeFiltroStatusEvento(event)}
                                    color="primary"
                                    value="bool"
                                  />
                                )}
                                label="Ativo?"
                              />
                            </FormGroup>
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography style={{ fontStyle: 'italic' }} component="h2" variant="body2" color="textSecondary">
                          Nenhum grupo selecionado
                      </Typography>
                    )}
                  </Toolbar>
                  <Table style={{ flex: 1, maxHeight: 600, overflowY: 'auto' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventosDoGrupo.length ? (
                        eventosDoGrupo.filter(this.isFilteredEventoFromGrupo)
                          .map(evento => (
                            <TableRow hover key={evento.evento.id}>
                              <TableCell>{evento.evento.descricao}</TableCell>
                              <TableCell align="center">
                                <Chip
                                  style={{ width: 90 }}
                                  deleteIcon={null}
                                  label={evento.evento.ativo ? 'ATIVO' : 'INATIVO'}
                                  color={evento.evento.ativo ? 'primary' : 'secondary'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="4" align="center" color="textSecondary"><i>Lista de eventos vazia...</i></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Fragment>
          </SwipeableViews>
        </Paper>
        {!!selectedMenuEvento && (
          <Menu
            id={`menu-${selectedMenuEvento.id}`}
            anchorEl={anchorElMenuEvento}
            open={openMenuEvento}
            onClose={this.onCloseMenuEvento}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 150,
              },
            }}
          >
            <MenuItem onClick={this.onClickUpdateEvento}>Editar</MenuItem>
          </Menu>
        )}
        {!!selectedMenuGrupo && (
          <Menu
            id={`menu-${selectedMenuGrupo.id}`}
            anchorEl={anchorElMenuGrupo}
            open={openMenuGrupo}
            onClose={this.onCloseMenuGrupo}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 150,
              },
            }}
          >
            <MenuItem onClick={this.onClickUpdateGrupo}>Editar</MenuItem>
          </Menu>
        )}
      </Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(Material, { withTheme: true }),
)(CadastroEvento);
