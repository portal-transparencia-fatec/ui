/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import '../../../../../assets/css/camera.css';
import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import CloseIcon from '@material-ui/icons/Close';
import { DateTimePicker } from '@material-ui/pickers';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import MagicDropzone from 'react-magic-dropzone';
import ReplayIcon from '@material-ui/icons/Replay';
import CircularProgress from '@material-ui/core/CircularProgress';
import ConvenioService from '../../../../../services/Convenio';
import EventoService from '../../../../../services/Evento';
import FieldsetInfo from '../../../../../components/FieldsetInfo';
import AgendaService from '../../../../../services/Agenda';
import NotificationActions from '../../../../../store/ducks/notifier';
import FormModificacaoAgendamento from '../FormModificacaoAgendamento';
import Material, { Divider } from './styles';
import { apiS3 as api, rootURL as baseURL } from '../../../../../services/api';
import iconPaciente from '../../../../../assets/images/iconPaciente.jpg';
import Anamnese from '../Anamnese';
import Sockets from '../../../../../services/ws';

const maskDateTimePicker = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, /\s/, /\d/, /\d/, ':', /\d/, /\d/];
const bucketPacienteS3 = process.env.REACT_APP_V2_S3_PACIENTE;
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const usuarioLogado = JSON.parse(localStorage.getItem('@clin:usuario'));

class DetalhesAgendamento extends Component {
  constructor(props) {
    super(props);

    const { unidade } = props;
    let unidadeId = null;
    let empresaId = null;
    let usuarioId = null;

    if (unidade && unidade.id && unidade.empresa_id && usuarioLogado) {
      unidadeId = unidade.id;
      empresaId = unidade.empresa_id;
      usuarioId = usuarioLogado.id;
    }

    this.state = {
      socketPainel: Sockets.socketPainel(unidadeId, empresaId, usuarioId),
      openAnamnese: false,
      openFormAgendamento: false,
      planos: [],
      preview: null,
      eventos: [],
      formSituacao: {
        plano: null,
        evento: null,
        desistencia: false,
        atendido: false,
        atendimento: false,
        comparecimento: false,
        confirmado: false,
        atendidoData: '',
        atendimentoData: '',
        comparecimentoData: '',
        confirmadoData: '',
        desistenciaData: '',
      },
      openModalDelete: false,
      loading: false,
      horarioAgendaToDelete: null,
    };
  }

  async componentDidMount() {
    this.connectSocketPaineil();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { horarioAgenda } = this.props;

    if (horarioAgenda && (horarioAgenda !== prevProps.horarioAgenda) && (horarioAgenda.agenda)) {
      await this.setFieldsSituacao();
      await this.fetchPlanos();
      await this.fetchEventos();
    }
  }

  connectSocketPaineil = async () => {
    const { socketPainel } = this.state;
    const { unidade } = this.props;

    if (!socketPainel) return;
    await socketPainel.open();
  }

  /**
   * Atribui os valores de situação da agenda
   * para o formulario
   */
  setFieldsSituacao = async () => {
    const { horarioAgenda } = this.props;
    const { agenda } = horarioAgenda;
    await this.setState({
      formSituacao: {
        ...agenda,
        evento: horarioAgenda.agenda.evento,
        plano: horarioAgenda.agenda.plano,
        atendido: Boolean(horarioAgenda.agenda.atendido),
        atendimento: Boolean(horarioAgenda.agenda.atendimento),
        comparecimento: Boolean(horarioAgenda.agenda.compareceu),
        confirmado: Boolean(horarioAgenda.agenda.confirmado),
        desistencia: Boolean(horarioAgenda.agenda.desistencia),
        paciente: horarioAgenda.agenda.paciente
          ? horarioAgenda.agenda.paciente.id
          : undefined,
        atendidoData: horarioAgenda.agenda.dataAtendido
          ? new Date(horarioAgenda.agenda.dataAtendido)
          : null,
        atendimentoData: horarioAgenda.agenda.dataAtendimento
          ? new Date(horarioAgenda.agenda.dataAtendimento)
          : null,
        comparecimentoData: horarioAgenda.agenda.dataComparecimento
          ? new Date(horarioAgenda.agenda.dataComparecimento)
          : null,
        confirmadoData: horarioAgenda.agenda.dataConfirmado
          ? new Date(horarioAgenda.agenda.dataConfirmado)
          : null,
        desistenciaData: horarioAgenda.agenda.dataDesistencia
          ? new Date(horarioAgenda.agenda.dataDesistencia)
          : null,
      },
    });
  }

  /**
   * Salva os dados de situação da agenda
   */
  handleClickSaveSituacao = async (horarioAgenda) => {
    this.setState({ loading: true });
    const {
      notify, onChangeSituacao, handleClose, unidade,
    } = this.props;
    const { formSituacao, socketPainel } = this.state;

    try {
      await AgendaService.atualizarHorarioAgenda({
        /**
         * Monta o objeto para realizar a requisição a API
         */
        statusPagamento: horarioAgenda.agenda.statusPagamento,
        grupoAgendamento: horarioAgenda.agenda.grupoAgendamento,
        unidade: unidade.id,
        usuario: horarioAgenda.agenda.id.usuario.id,
        plano: horarioAgenda.agenda.plano
          ? horarioAgenda.agenda.plano.id
          : null,
        evento: horarioAgenda.agenda.evento.id,
        nomePaciente: horarioAgenda.agenda.nomePaciente,
        paciente: horarioAgenda.agenda.paciente
          ? horarioAgenda.agenda.paciente.id
          : undefined,
        data: moment(horarioAgenda.data).format('YYYY-MM-DD'),
        hora: moment(horarioAgenda.startDate).format('HH:mm'),
        observacoes: horarioAgenda.agenda.observacoes,
        telefone: horarioAgenda.agenda.telefone
          ? horarioAgenda.agenda.telefone
          : undefined,
        celular: horarioAgenda.agenda.celular
          ? horarioAgenda.agenda.celular
          : undefined,
        email: horarioAgenda.agenda.email
          ? horarioAgenda.agenda.email
          : undefined,
        atendido: formSituacao.atendido,
        atendimento: formSituacao.atendimento,
        desistencia: formSituacao.desistencia,
        compareceu: formSituacao.comparecimento,
        confirmado: formSituacao.confirmado,
        dataAtendido: formSituacao.atendidoData ? (formSituacao.atendidoData ? moment(formSituacao.atendidoData).format('YYYY-MM-DD[T]HH:mm:ss') : null) : null,
        dataAtendimento: formSituacao.atendimento ? (formSituacao.atendimentoData ? moment(formSituacao.atendimentoData).format('YYYY-MM-DD[T]HH:mm:ss') : null) : null,
        dataComparecimento: formSituacao.comparecimentoData ? (formSituacao.comparecimentoData ? moment(formSituacao.comparecimentoData).format('YYYY-MM-DD[T]HH:mm:ss') : null) : null,
        dataConfirmado: formSituacao.confirmadoData ? (formSituacao.confirmadoData ? moment(formSituacao.confirmadoData).format('YYYY-MM-DD[T]HH:mm:ss') : null) : null,
        dataDesistencia: formSituacao.desistenciaData ? (formSituacao.desistenciaData ? moment(formSituacao.desistenciaData).format('YYYY-MM-DD[T]HH:mm:ss') : null) : null,
        encaixe: horarioAgenda.agenda.encaixe,
      });
      notify('Situação atualizada');

      if (formSituacao.atendimento && formSituacao.atendimento !== horarioAgenda.agenda.atendimento) {
        socketPainel.emit('atendimentoAgenda', {
          agenda: formSituacao,
        });
      }
      handleClose();
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data.mensagem) {
        notify(err.response.data.mensagem, { variant: 'error' });
      } else {
        notify('Erro ao salvar a situação do agendamento', { variant: 'error' });
      }
    }
    this.setState({ loading: false });
  }


  fetchEventos = async () => {
    const { notify } = this.props;

    try {
      const eventos = await EventoService.getEventos();

      this.setState({
        eventos: eventos
          .map(({
            id, descricao, duracao,
          }) => ({
            id,
            label: descricao,
            duracao,
          })),
      });
    } catch (err) {
      notify('Não foi possível buscar a lista de exames', { variant: 'error' });
    }
  }

  fetchPlanos = async () => {
    const { notify } = this.props;
    try {
      const planos = await ConvenioService.getAllPlanos();

      this.setState({
        planos: planos
          .map(({
            id, nome, idConvenio, nomeConvenio,
          }) => ({
            id,
            label: nome,
            idConvenio,
            subLabel: nomeConvenio,
          })),
      });
    } catch (err) {
      notify('Erro ao buscar os planos de convênio', { variant: 'error' });
    }
  }

  onCompleteAgendamento = (agendamento) => {
    const { handleClose } = this.props;
    handleClose();
  }

  /**
   * Exclui o agendamento da lista
   */
  handleClickDeleteAgendamento = async () => {
    this.setState({ loading: true });
    const { horarioAgendaToDelete: horarioAgenda } = this.state;
    const { notify, handleClose } = this.props;

    try {
      await AgendaService.excluirAgendamento({
        empresaUnidade: horarioAgenda.agenda.id.unidade.id,
        usuario: horarioAgenda.agenda.id.usuario.id,
        data: moment(horarioAgenda.startDate).format('YYYY-MM-DD'),
        hora: moment(horarioAgenda.startDate).format('HH:mm'),
      });
      notify('Agendamento excluído');
      await this.setState({ horarioAgendaToDelete: false });
      handleClose();
    } catch (err) {
      if (err.response && err.response.data.mensagem) {
        notify(err.response.data.mensagem, { variant: 'error' });
      } else {
        notify('Erro ao excluir agendamento', { variant: 'error' });
      }
    }
    this.setState({ loading: false });
  }

  handleChangeDate = name => (date) => {
    const { formSituacao } = this.state;

    formSituacao[name] = date;
    this.setState({ formSituacao: { ...formSituacao } });
  }

  handleCloseNovoAgendamento = () => {
    this.setState({
      openFormAgendamento: false,
    });
  }

  handleChangeCheckbox = async (event, checked) => {
    const { formSituacao } = this.state;
    const { name } = event.target;

    formSituacao[name] = checked;

    if (!formSituacao[`${name}Data`] && checked) {
      formSituacao[`${name}Data`] = new Date();
    }

    await this.setState({ formSituacao: { ...formSituacao } });
  }

  addDefaultSrc = (ev) => {
    ev.target.src = iconPaciente;
  }

  onDrop = async (accepted) => {
    const file = accepted[0];
    const $ = this;
    const reader = new FileReader();

    reader.onloadend = function () {
      $.setState({ preview: reader.result });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  onTakePhoto = async (preview) => {
    this.setState({ preview });
  }

  handleCameraStart = () => {
    const { showCamera } = this.state;
    if (!showCamera) {
      this.setState({ showCamera: true });
    }
  }

  handleCameraError = (err) => {
    console.log(err);
    // this.setState({ showCamera: false });
  }

  uploadPicture = async () => {
    const { preview, action } = this.state;
    const { horarioAgenda, onChangePicture, notify } = this.props;
    try {
      this.setState({ loading: true });
      const base64 = await preview.substring(23);
      await api.post(`/imagem/${bucketPacienteS3}/${horarioAgenda.agenda.paciente.id}`, {
        base64,
      });
      notify('Foto salva com sucesso.', { variant: 'success' });
      onChangePicture();
    } catch (error) {
      notify('Não foi salvar a foto do paciente.', { variant: 'error' });
    } finally {
      this.setState({ showModalCamera: false, loading: false, preview: null });
    }
  }


  render() {
    const {
      classes,
      open,
      handleClose,
      horarioAgenda,
      containerHeight,
    } = this.props;
    const {
      formSituacao, loading, openModalDelete, preview, eventos, openAnamnese, openFormAgendamento, showModalCamera, showCamera,
    } = this.state;

    return (
      <Drawer
        classes={{ paper: classes.drawer }}
        anchor="bottom"
        open={open}
        onClose={handleClose}
      >

        { showModalCamera === true && (
          <Dialog
            open={showModalCamera}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => { this.setState({ showModalCamera: false }); }}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle id="alert-dialog-slide-title">{`CAPTURA DE FOTO DO PACIENTE ${horarioAgenda.agenda.nomePaciente}`}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                {(showCamera)
                  ? (
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Camera
                          onTakePhoto={(picture) => { this.onTakePhoto(picture); }}
                          onCameraStart={this.handleCameraStart}
                          onCameraError={this.handleCameraError}
                          onCameraStop={this.handleCameraError}
                          idealFacingMode={FACING_MODES.ENVIRONMENT}
                          idealResolution={{ width: 275, height: 275 }}
                          imageType={IMAGE_TYPES.JPG}
                          imageCompression={0.97}
                          isMaxResolution={false}
                          isImageMirror={false}
                          isSilentMode
                          sizeFactor={1}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <img
                          className={classes.pictureHandler}
                          src={preview || `${baseURL}/s3/imagem/${bucketPacienteS3}/${horarioAgenda.agenda.paciente.id}`}
                          alt="Icone do Paciente"
                          onError={this.addDefaultSrc}
                          // ref={ref => this._picturePaciente = ref}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={3} justify="center">
                      <Typography>Certifique-se que a câmera está devidamente conectada e com as permissões habilitadas.</Typography>
                      {preview !== null && (
                        <Grid item xs={6}>
                          <img
                            className={classes.pictureHandler}
                            src={preview || `${baseURL}/s3/imagem/${bucketPacienteS3}/${horarioAgenda.agenda.paciente.id}`}
                            alt="Icone do Paciente"
                            onError={this.addDefaultSrc}
                            // ref={ref => this._picturePaciente = ref}
                          />
                        </Grid>
                      )}
                    </Grid>
                  ) }
                <MagicDropzone
                  accept="image/jpeg, .jpg, .jpeg,"
                  type="file"
                  ref={e => this.dropzone = e}
                  onDrop={this.onDrop}
                />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              { preview !== null ? (
                <Button
                  onClick={() => {
                    this.setState({ preview: null });
                  }}
                  color="primary"
                >
                  <ReplayIcon />
                </Button>
              ) : (
                null
              )}

              {formSituacao.paciente !== null && (
                <Grid>
                  {/* { showCamera === true && ( */}
                  <Button
                    onClick={(e) => {
                      if (preview === null) {
                        this.dropzone.onClick(e);
                      } else {
                        this.uploadPicture();
                      }
                    }}
                    disabled={loading}
                    color="primary"
                  >
                    { preview === null ? 'ESCOLHER FOTO' : (loading ? <CircularProgress size={32} color="primary" /> : 'SALVAR')}
                  </Button>
                  {/* )} */}
                </Grid>
              )}
              <Button
                onClick={() => {
                  this.setState({ showModalCamera: false });
                }}
                color="primary"
              >
                FECHAR
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Grid container className={classes.drawerContent}>
          <Grid container item sm={12} md={12} lg={12} justify="flex-end">
            <IconButton onClick={handleClose}>
              <CloseIcon color="inherit" />
            </IconButton>
          </Grid>
          <Grid container spacing={2} item sm={12} md={4} lg={4}>
            {formSituacao.paciente && (
              <Grid item sm={12} md={4} lg={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => this.setState({ openAnamnese: true })}
                >
                  Anamnese
                </Button>
                <Anamnese
                  containerHeight={containerHeight}
                  pacienteId={formSituacao.paciente}
                  open={openAnamnese}
                  handleClose={() => this.setState({ openAnamnese: false })}
                />
              </Grid>
            )}

            <Grid container item sm={12} md={12} lg={12} direction="row" wrap="nowrap" alignItems="center">
              <Checkbox
                color="primary"
                name="desistencia"
                onChange={this.handleChangeCheckbox}
                checked={formSituacao.desistencia}
              />
              <DateTimePicker
                invalidDateMessage="Data inválida"
                cancelLabel="Cancelar"
                clearLabel="Limpar"
                todayLabel="Hoje"
                clearable
                allowKeyboardControl
                ampm={false}
                label="Desistência"
                name="desistenciaData"
                placeholder="Data de desistência"
                value={formSituacao.desistenciaData}
                onChange={this.handleChangeDate('desistenciaData')}
                mask={maskDateTimePicker}
                format="DD/MM/YYYY HH:mm"
                fullWidth
                inputVariant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <CalendarIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid container item sm={12} md={12} lg={12} direction="row" wrap="nowrap" alignItems="center">
              <Checkbox
                color="primary"
                name="confirmado"
                onChange={this.handleChangeCheckbox}
                checked={formSituacao.confirmado}
              />
              <DateTimePicker
                invalidDateMessage="Data inválida"
                cancelLabel="Cancelar"
                clearLabel="Limpar"
                todayLabel="Hoje"
                clearable
                allowKeyboardControl
                ampm={false}
                label="Confirmado"
                name="confirmadoData"
                placeholder="Data da confirmação"
                value={formSituacao.confirmadoData}
                onChange={this.handleChangeDate('confirmadoData')}
                mask={maskDateTimePicker}
                format="DD/MM/YYYY HH:mm"
                fullWidth
                inputVariant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <CalendarIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid container item sm={12} md={12} lg={12} direction="row" wrap="nowrap" alignItems="center">
              <Checkbox
                color="primary"
                name="comparecimento"
                onChange={this.handleChangeCheckbox}
                checked={formSituacao.comparecimento}
              />
              <DateTimePicker
                invalidDateMessage="Data inválida"
                cancelLabel="Cancelar"
                clearLabel="Limpar"
                todayLabel="Hoje"
                clearable
                allowKeyboardControl
                ampm={false}
                label="Comparecimento"
                name="comparecimentoData"
                placeholder="Data de comparecimento"
                value={formSituacao.comparecimentoData}
                onChange={this.handleChangeDate('comparecimentoData')}
                mask={maskDateTimePicker}
                format="DD/MM/YYYY HH:mm"
                fullWidth
                inputVariant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <CalendarIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid container item sm={12} md={12} lg={12} direction="row" wrap="nowrap" alignItems="center">
              <Checkbox
                color="primary"
                name="atendimento"
                onChange={this.handleChangeCheckbox}
                checked={formSituacao.atendimento}
              />
              <DateTimePicker
                invalidDateMessage="Data inválida"
                cancelLabel="Cancelar"
                clearLabel="Limpar"
                todayLabel="Hoje"
                clearable
                allowKeyboardControl
                ampm={false}
                label="Atendimento"
                name="atendimentoData"
                placeholder="Data de atendimento"
                value={formSituacao.atendimentoData}
                onChange={this.handleChangeDate('atendimentoData')}
                mask={maskDateTimePicker}
                format="DD/MM/YYYY HH:mm"
                fullWidth
                inputVariant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <CalendarIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid container item sm={12} md={12} lg={12} direction="row" wrap="nowrap" alignItems="center">
              <Checkbox
                color="primary"
                name="atendido"
                onChange={this.handleChangeCheckbox}
                checked={formSituacao.atendido}
              />
              <DateTimePicker
                invalidDateMessage="Data inválida"
                cancelLabel="Cancelar"
                clearLabel="Limpar"
                todayLabel="Hoje"
                clearable
                allowKeyboardControl
                ampm={false}
                label="Atendido"
                name="atendidoData"
                placeholder="Data de atendimento encerrado"
                value={formSituacao.atendidoData}
                onChange={this.handleChangeDate('atendidoData')}
                mask={maskDateTimePicker}
                format="DD/MM/YYYY HH:mm"
                fullWidth
                inputVariant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <CalendarIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid container spacing={1} direction="row" justify="flex-end">
              <Grid item>
                <Button
                  color="secondary"
                  onClick={() => {
                    this.setState({ openModalDelete: true, horarioAgendaToDelete: horarioAgenda });
                  }}
                  disabled={loading}
                >
                  Excluir
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ openFormAgendamento: true });
                  }}
                  disabled={loading}
                >
                  ALTERAR
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  onClick={() => this.handleClickSaveSituacao(horarioAgenda)}
                  disabled={loading}
                >
                  Salvar
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {!!horarioAgenda.agenda && (
            <Grid container item sm={12} md={8} lg={8} justify="space-evenly">
              <Divider />
              {!!formSituacao.paciente && (
                <Fragment>
                  <Grid item sm={12} md={5} lg={4}>
                    <img
                      className={classes.picture}
                      src={`${baseURL}/s3/imagem/${bucketPacienteS3}/${formSituacao.paciente}?${new Date().getTime()}`}
                      alt="Foto do Paciente"
                      onError={this.addDefaultSrc}
                      onClick={() => this.setState({ showModalCamera: true, showCamera: true })}
                    />
                    <Button
                      style={{ marginBottom: 10 }}
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => this.setState({ showModalCamera: true, showCamera: true })}
                    >
                      ALTERAR/ADICIONAR FOTO
                    </Button>
                  </Grid>
                  <Divider />
                </Fragment>
              )}

              <Grid container item sm={12} md={5} lg={3}>
                <FormModificacaoAgendamento
                  horarioAgenda={horarioAgenda}
                  open={openFormAgendamento}
                  eventos={eventos.map(({ id, descricao }) => ({ id, label: descricao }))}
                  evento={eventos.find(({ id }) => id === formSituacao.evento.id)}
                  handleClose={this.handleCloseNovoAgendamento}
                  onComplete={this.onCompleteAgendamento}
                />
                <FieldsetInfo
                  label="Paciente"
                  info={horarioAgenda.agenda.nomePaciente}
                />
                <FieldsetInfo
                  label="Plano/Convênio"
                  info={(horarioAgenda.agenda.plano ? `${horarioAgenda.agenda.plano.nome} - ${horarioAgenda.agenda.plano.nomeConvenio}` : '')}
                />
                <FieldsetInfo
                  label="Médico"
                  info={horarioAgenda.agenda.id.usuario.nome}
                />
                <FieldsetInfo
                  label="Unidade"
                  info={horarioAgenda.agenda.id.unidade.nome}
                />
                <FieldsetInfo
                  label="Observações"
                  info={horarioAgenda.agenda.observacoes}
                />
              </Grid>
              <Grid container item sm={12} md={5} lg={3}>
                <FieldsetInfo
                  label="Telefone"
                  info={horarioAgenda.agenda.telefone}
                />
                <FieldsetInfo
                  label="Celular"
                  info={horarioAgenda.agenda.celular}
                />
                <FieldsetInfo
                  label="Evento"
                  info={horarioAgenda.agenda.evento.descricao}
                />
                <FieldsetInfo
                  label="Horário"
                  info={moment(`${horarioAgenda.data}T${horarioAgenda.horaInicial}`).format('D [de] MMMM, dddd [às] HH:mm')}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
        <Dialog
          open={openModalDelete}
          onClose={() => this.setState({ openModalDelete: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Excluir agendamento?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Deseja realmente excluir este agendamento?
              &nbsp;
              <strong>Esta operação é irreversível</strong>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openModalDelete: false, horarioAgendaToDelete: null })} color="default" autoFocus>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                this.setState({ openModalDelete: false });
                this.handleClickDeleteAgendamento();
              }}
              color="secondary"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Drawer>
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
)(DetalhesAgendamento);
