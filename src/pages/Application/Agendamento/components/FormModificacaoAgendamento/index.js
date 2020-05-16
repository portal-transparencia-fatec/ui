/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable max-len */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import '../../../../../assets/css/camera.css';
import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import CardMembership from '@material-ui/icons/CardMembership';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Icon from '@mdi/react';
import {
  mdiClipboardPulseOutline,
  mdiCalendarOutline,
  mdiCalendarClock,
  mdiDoctor,
  mdiAccountBox,
} from '@mdi/js';

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import { apiS3 as api, rootURL as baseURL } from '../../../../../services/api';
import iconPaciente from '../../../../../assets/images/iconPaciente.jpg';

import '../../../../../assets/css/accordion.css';
import ModalSelect from '../../../../../components/ModalSelect';
import PacienteService from '../../../../../services/Paciente';
import EventoService from '../../../../../services/Evento';
import ConvenioService from '../../../../../services/Convenio';
import AgendaService from '../../../../../services/Agenda';

import NotificationActions from '../../../../../store/ducks/notifier';
import Material from './styles';
import {
  InputFormatTelefone,
  InputFormatCelular,
} from '../../../../../components/InputFormat';
import {
  celValidator,
  telValidator,
  celFormatter,
  telFormatter,
} from '../../../../../libs/utils';


const iconColor = '#333';
const iconSize = '24px';
const bucketPacienteS3 = process.env.REACT_APP_V2_S3_PACIENTE;

/**
 * Componente utilizado para criar um agendamento. Utilizado
 * para a criação de um agendamento através da agenda e suas regras
 * ou através dos horários disponíveis que não possui regras
 */
class FormModificacaoAgendamento extends Component {
  static defaultProps = {
    agendamentoLivre: false,
    regras: {},
    planos: [],
    evento: {},
    eventos: [],
    onEdit: () => {},
  };

  static propTypes = {
    paciente: PropTypes.number.isRequired,
    horarioAgenda: PropTypes.shape({
      agenda: PropTypes.shape({}),
      data: PropTypes.string,
      horaInicial: PropTypes.string,
      horaFinal: PropTypes.string,
      startDate: PropTypes.instanceOf(Date),
      endDate: PropTypes.instanceOf(Date),
      medico: PropTypes.shape({
        id: PropTypes.number,
        nome: PropTypes.string,
      }),
    }).isRequired,

    regras: PropTypes.shape({
      id: PropTypes.number,
      restricaoEventos: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        descricao: PropTypes.string,
      })),
      convenios: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        nome: PropTypes.string,
        razaoSocial: PropTypes.string,
        planos: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.number,
          nome: PropTypes.string,
        })),
      })),
    }),

    planos: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      nome: PropTypes.string,
      nomeConvenio: PropTypes.string,
      idConvenio: PropTypes.number,
    })),

    eventos: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      descricao: PropTypes.string,
    })),

    evento: PropTypes.shape({
      id: PropTypes.number,
      descricao: PropTypes.string,
    }),

    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    /**
     * Emite esta funcão quando o agendamento é finalizado (cadastrado)
     */
    onComplete: PropTypes.func.isRequired,
    /**
     * Propriedade que informa se o agendamento que está sendo efetuado
     * está relacionado a lista de horarios/regras da agenda ou se é um
     * agendamento da lista de horários disponíveis
     */
    agendamentoLivre: PropTypes.bool,
    /**
     * Função executada sempre que o formulário é manipulado
     */
    onEdit: PropTypes.func,
  };

  state = {
    loadingPaciente: false,
    pacientes: [],
    planos: [],
    eventos: [],
    isNovoPaciente: false,
    showCamera: true,
  }

  componentDidUpdate = async (prevProps) => {
    const {
      values, onEdit, horarioAgenda, open, setFieldValue,
    } = this.props;

    if (prevProps.open !== open) {
      this.fetchPlanos();
      setFieldValue('celular', celFormatter(horarioAgenda.agenda.celular));
      setFieldValue('email', horarioAgenda.agenda.email);
      setFieldValue('observacoes', horarioAgenda.agenda.observacoes);
      setFieldValue('preferencial', horarioAgenda.agenda.preferencial);
      setFieldValue('enviarConfirmacaoCadastro', horarioAgenda.agenda.enviarConfirmacaoCadastro);
      setFieldValue('evento', horarioAgenda.agenda.evento.id);
      await this.onSearchPaciente(horarioAgenda.agenda.nomePaciente);
      this.handleChangePaciente(horarioAgenda.agenda.paciente ? horarioAgenda.agenda.paciente.id : undefined);
    }

    /**
     * Verifica se os dados do formulário estão
     * sendo manipulados
     */
    if (prevProps.values !== values) {
      onEdit(horarioAgenda);
    }
  }

  getPictureS3 = async (id) => {
    const {
      notify,
    } = this.props;

    try {
      const base64 = await this.getBase64(`${baseURL}/s3/imagem/${bucketPacienteS3}/${id}`);
      this.onTakePhoto(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      this.onTakePhoto();
      notify('Erro ao buscar imagem do usuário', { variant: 'error' });
    }
  }

  getBase64 = url => api
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then(response => new Buffer(response.data, 'binary').toString('base64'))

  /**
   * Carrega os dados iniciais para preencher os
   * selects/inputs do formulário
   */
  loadData = async () => {
    const {
      notify,
      agendamentoLivre,
      evento,
      resetForm,
      values,
      horarioAgenda,
    } = this.props;

    if (agendamentoLivre) {
      /**
       * Caso seja agendamento livre reseta o formulario
       * exceto o evento na qual foi utlizado na consulta
       * dos horarios disponíveis
       */
      resetForm({
        ...values,
        evento: evento.id,
      });
    }

    try {
      const data = await EventoService.getEventos();
      // eslint-disable-next-line no-shadow
      const eventos = data.filter((evento) => {
        const { duracao } = evento;
        if (!duracao) {
          return evento;
        }

        if (moment.duration(duracao).asMinutes() <= moment.duration(horarioAgenda.agenda.evento.duracao).asMinutes()) {
          return evento;
        }
      });
      this.setState({
        /**
         * Mapeia os eventos de acordo com o formato passado para o ModalSelect
         */
        eventos: eventos.map(({ id, descricao, duracao }) => ({ id, label: descricao, duracao })),
      });
    } catch (err) {
      notify('Erro ao buscar os eventos', { variant: 'error' });
    }
  }

  fetchPlanos = async () => {
    const { notify, agendamentoLivre } = this.props;

    /**
     * No caso de agendamento por horarios disponíveis
     * os planos são passados via props
     */
    if (agendamentoLivre) {
      return;
    }

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

  /**
   * Realiza uma chamada a API de acordo com o paciente
   * digitado no ModalSelect, semelhante à funcionalidade
   * de autocomplete
   */
  onSearchPaciente = async (pacienteSearch) => {
    const { notify, agendamentoLivre, planos: [plano] } = this.props;
    this.setState({ loadingPaciente: true });

    /**
     * Limpa os selects de plano e paciente
     */
    if (!String(pacienteSearch).trim()) {
      this.setState({
        pacientes: [],
        planos: [],
        loadingPaciente: false,
      });
      return;
    }

    try {
      let pacientes;

      if (agendamentoLivre) {
        /**
         * Caso seja um agendamento por horarios disponíveis realiza
         * a busca do paciente através do plano do convênio que foi
         * utilizado no filtro da lista de horários
         */
        pacientes = await PacienteService.getByConvenio(plano.idConvenio, pacienteSearch);
      } else {
        pacientes = await PacienteService.getAll(pacienteSearch);
      }

      await this.setState({
        loadingPaciente: false,
        pacientes: pacientes
          .map(paciente => ({ id: paciente.id, label: paciente.nome, ...paciente })),
      });
    } catch (err) {
      this.setState({ loadingPaciente: false });
      notify('Erro ao buscar o paciente', { variant: 'error' });
    }
  }

  onTakePhoto = async (picture) => {
    const { setFieldValue } = this.props;
    setFieldValue('picture', picture);
  }

  handleCameraError = (err) => {
    console.log(err);
    // this.setState({ showCamera: false });
  }

  handleCameraStart = () => {
    const { showCamera } = this.state;
    if (!showCamera) {
      this.setState({ showCamera: true });
    }
  }

  /**
   * Método que lida com a alteração no ModalSelect de paciente
   * recebendo como parâmetro o ID do paciente
   */
  handleChangePaciente = (pacienteId) => {
    const { setFieldValue, planos: [planoSelect], horarioAgenda } = this.props;

    const { pacientes } = this.state;
    setFieldValue('paciente', pacienteId);

    const paciente = pacientes.find(pac => pac.id === pacienteId);

    /**
     * Verifica se o paciente selecionado possui planos de convênio
     */

    setFieldValue('nomePaciente', paciente ? paciente.nome : horarioAgenda.agenda.nomePaciente);
    setFieldValue('telefone', paciente
      ? paciente.telefone
        ? (String(paciente.telefone).length !== 11 ? telFormatter(paciente.telefone) : celFormatter(paciente.telefone))
        : undefined
      : horarioAgenda.agenda.telefone
        ? (String(horarioAgenda.agenda.telefone).length !== 11 ? telFormatter(horarioAgenda.agenda.telefone) : celFormatter(horarioAgenda.agenda.telefone))
        : undefined);

    if (horarioAgenda.agenda.paciente) {
      if (paciente && horarioAgenda.agenda.paciente.id !== pacienteId) {
        setFieldValue('celular', celFormatter(paciente.celular));
      }
    } else {
      setFieldValue('celular', paciente ? celFormatter(paciente.celular) : celFormatter(horarioAgenda.agenda.celular));
    }

    if (pacienteId) {
      this.getPictureS3(pacienteId);
      if (paciente.planos && paciente.planos.length) {
        this.setState({
          planos: paciente.planos
            .map(({
              plano: {
                id, nome, idConvenio, nomeConvenio,
              },
            }) => ({
              id,
              idConvenio,
              label: nome,
              subLabel: nomeConvenio,
            })),
        /**
           * Callback após atribuir o state
           */
        }, () => {
          let planoPayload;
          /**
           * Verifica se os planos foram passados via props
           * pela tela de horarios disponíveis
           */
          if (planoSelect) {
          /**
             * Busca o plano do paciente selecionado anteriormente
             * e seleciona automaticamente no ModalSelect de planos
             * posteriormente
             */
            planoPayload = paciente.planos
              .find(({ plano }) => plano.idConvenio === planoSelect.idConvenio);
          } else {
          /**
             * Seleciona automaticamente o primeiro plano ao ModalSelect
             * de planos posteriormente
             */
            ([planoPayload] = paciente.planos);
          }
          /**
           * Atribui o ID do plano carregado acima no
           * input do ModalSelect de planos
           */
          setFieldValue('plano', planoPayload.plano.id);
        });
      }
    } else {
      this.setState({ isNovoPaciente: true });
      setFieldValue('plano', horarioAgenda.agenda.plano ? horarioAgenda.agenda.plano.id : null);
    }
  }

  /**
   * Lida com o evento do Switch que delega se
   * é um paciente cadastrado no sistema ou um
   * novo paciente
   */
  handleChangeNovoPaciente = (event) => {
    const { resetForm, values } = this.props;

    resetForm({
      ...values,
      plano: '',
      nomePaciente: '',
      paciente: '',
      telefone: '',
      celular: '',
      email: '',
    });

    this.setState({ isNovoPaciente: event.target.checked, planos: [] });

    /**
     * Busca os planos dos convênios do sistema
     * caso seja um novo paciente (paciente sem cadastro)
     */
    if (event.target.checked) {
      this.fetchPlanos();
    }
  }

  /**
   * Renderiza as regras no painel expansível
   */
  renderRegras = () => {
    const { classes, regras } = this.props;

    return (
      <Fragment>
        {/* Verifica se há regras/restrições de convênios fornecidas via props pela agenda */}
        {regras.convenios && regras.convenios.length ? (
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              <Typography className={classes.heading}>Convênios aplicáveis</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <List dense>
                {regras.convenios.map(({ convenio }) => (
                  <ListItem dense key={convenio.id}>
                    <ListItemText primary={convenio.nome} />
                  </ListItem>
                ))}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ) : (
          <ExpansionPanel disabled>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              <Typography className={classes.heading}>Não há regras de convênio</Typography>
            </ExpansionPanelSummary>
          </ExpansionPanel>
        )}

        {/* Verifica se há regras/restrições de eventos fornecidas via props pela agenda */}
        {regras.restricaoEventos && regras.restricaoEventos.length ? (
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              <Typography className={classes.heading}>Eventos aplicáveis</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <List dense>
                {regras.restricaoEventos.map(({ id, descricao }) => (
                  <ListItem dense key={id}>
                    <ListItemText primary={descricao} />
                  </ListItem>
                ))}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ) : (
          <ExpansionPanel disabled>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              <Typography className={classes.heading}>Não há regras de eventos</Typography>
            </ExpansionPanelSummary>
          </ExpansionPanel>
        )}

      </Fragment>
    );
  }

  render() {
    const {
      classes,
      regras,
      open,
      handleClose,
      values,
      errors,
      handleSubmit,
      handleChange,
      handleBlur,
      isSubmitting,
      setFieldValue,
      resetForm,
      horarioAgenda,
      agendamentoLivre,
      planos: propsPlanos,
      eventos: propsEventos,
    } = this.props;
    const {
      loadingPaciente,
      pacientes,
      planos,
      eventos,
      isNovoPaciente,
      showCamera,
    } = this.state;

    let ContainerRegras;

    /**
     * Verifica se é um agendamento com regras
     */
    if (!agendamentoLivre) {
      ContainerRegras = (
        <Grid className={classes.containerExpansion} item sm={12} md={4} lg={3}>
          {regras && regras.id ? (
            this.renderRegras()
          ) : (
            <Typography color="textSecondary">
              Nenhuma regra aplicada a esta agenda
            </Typography>
          )}
        </Grid>
      );
    }


    return (
      <Dialog
        maxWidth="lg"
        fullWidth
        open={open}
        onEntered={this.loadData}
        onClose={handleClose}
        onExited={() => resetForm({
          nomePaciente: '', telefone: '', celular: '', email: '',
        })}
        aria-labelledby="form-novo-agendamento"
      >
        <DialogContent>
          <Grid container spacing={3}>
            {ContainerRegras}
            <Grid
              item
              container
              spacing={2}
              sm={12}
              md={agendamentoLivre ? 12 : 8}
              lg={agendamentoLivre ? 12 : 9}
            >
              <Grid item sm={12} md={12} lg={12}>
                <Typography color="textSecondary">
                  Modifique o formulário abaixo para editar um agendamento
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  fullWidth
                  value={horarioAgenda.medico ? horarioAgenda.medico.nome : ''}
                  label="Médico"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon
                          path={mdiDoctor}
                          size={iconSize}
                          color={iconColor}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={4}>
                <TextField
                  fullWidth
                  value={moment(horarioAgenda.startDate).format('DD/MM/YYYY')}
                  label="Data"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon
                          path={mdiCalendarOutline}
                          size={iconSize}
                          color={iconColor}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={2} md={2} lg={2}>
                <TextField
                  fullWidth
                  value={moment(horarioAgenda.startDate).format('HH:mm')}
                  label="Hora"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon
                          path={mdiCalendarClock}
                          size={iconSize}
                          color={iconColor}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {isNovoPaciente ? (
                null
              ) : (
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <Accordion allowZeroExpanded>
                    <AccordionItem>
                      <AccordionItemHeading>
                        <AccordionItemButton>
                          CAPTURA DE FOTO DO PACIENTE
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel>
                        {(showCamera === true)
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
                                <img className={classes.picture} src={values.picture || iconPaciente} alt="Icone do Paciente" />
                              </Grid>
                            </Grid>
                          ) : (
                            <Typography>Certifique-se que a câmera está devidamente conectada e com as permissões habilitadas.</Typography>
                          )

                        }
                      </AccordionItemPanel>
                    </AccordionItem>
                  </Accordion>
                </Grid>
              )}

              <Grid item sm={10} md={10} lg={5}>
                {isNovoPaciente ? (
                  <TextField
                    error={!!errors.nomePaciente}
                    name="nomePaciente"
                    label="Paciente*"
                    onChange={(event) => {
                      setFieldValue(event.target.name, String(event.target.value).toUpperCase());
                    }}
                    value={values.nomePaciente}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            path={mdiAccountBox}
                            size={iconSize}
                            color={iconColor}
                          />
                        </InputAdornment>
                      ),
                    }}
                    FormHelperTextProps={{
                      error: !!errors.nomePaciente,
                    }}
                    helperText={errors.nomePaciente}
                  />
                ) : (
                  <ModalSelect
                    label="Paciente*"
                    error={!!errors.paciente}
                    empty="Nenhum paciente encontrado..."
                    placeholderFilter="Buscar paciente"
                    value={values.paciente}
                    options={pacientes}
                    onChange={this.handleChangePaciente}
                    autoCompleteAsync
                    onSearchAsync={this.onSearchPaciente}
                    loadingSearch={loadingPaciente}
                    textfieldProps={{
                      variant: 'outlined',
                      fullWidth: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon
                              path={mdiAccountBox}
                              size={iconSize}
                              color={iconColor}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                    inputFilterProps={{
                      Component: props => (
                        <TextField {...props} color="primary" fullWidth autoFocus />
                      ),
                    }}
                  />
                )}
              </Grid>
              <Grid item sm={12} md={2} lg={2}>
                <FormGroup row>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={isNovoPaciente}
                        onChange={this.handleChangeNovoPaciente}
                        color="primary"
                        value="bool"
                      />
                    )}
                    label="Sem cadastro?"
                  />
                </FormGroup>
              </Grid>

              <Grid item sm={12} md={2} lg={2}>
                <FormControlLabel
                  control={(
                    <Switch
                      name="preferencial"
                      onChange={() => setFieldValue('preferencial', !values.preferencial)}
                      color="primary"
                      value={values.preferencial}
                      checked={values.preferencial}
                    />
                    )}
                  label="Preferencial?"
                />
              </Grid>

              <Grid item sm={12} md={2} lg={3}>
                <FormControlLabel
                  control={(
                    <Switch
                      name="enviarConfirmacaoCadastro"
                      onChange={() => setFieldValue('enviarConfirmacaoCadastro', !values.enviarConfirmacaoCadastro)}
                      color="primary"
                      value={values.enviarConfirmacaoCadastro}
                      checked={values.enviarConfirmacaoCadastro}
                    />
                    )}
                  label={(
                    <span>
                      Enviar Confirmação
                      <br />
                      de Cadastro?
                    </span>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={12} lg={4}>
                <TextField
                  inputRef={(input) => { this.telefoneInput = input; }}
                  className={classes.textfield}
                  name="telefone"
                  error={!!errors.telefone}
                  id="telefone"
                  label="Telefone"
                  value={values.telefone}
                  onChange={async (event) => {
                    await handleChange(event);
                    this.telefoneInput.focus();
                  }}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                  InputProps={{
                    inputComponent: values.telefone && values.telefone.length !== 15 ? InputFormatTelefone : InputFormatCelular,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={4}>
                <TextField
                  className={classes.textfield}
                  error={!!errors.celular}
                  name="celular"
                  id="celular"
                  label="Celular*"
                  value={values.celular}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                  InputProps={{
                    inputComponent: InputFormatCelular,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={4}>
                <TextField
                  className={classes.textfield}
                  name="email"
                  id="email"
                  label="E-mail"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <ModalSelect
                  type="planoConvenio"
                  label="Plano do convênio"
                  empty="Lista de planos vazia..."
                  error={!!errors.plano}
                  value={values.plano}
                  options={agendamentoLivre ? propsPlanos : planos}
                  onChange={value => setFieldValue('plano', value)}
                  disabled={agendamentoLivre && !isNovoPaciente}
                  textfieldProps={{
                    variant: 'outlined',
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CardMembership />
                        </InputAdornment>
                      ),
                    },
                    FormHelperTextProps: {
                      error: !!errors.plano,
                    },
                    helperText: errors.plano,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <ModalSelect
                  label="Evento*"
                  empty="Lista de eventos vazia..."
                  error={!!errors.evento}
                  value={values.evento}
                  options={agendamentoLivre ? propsEventos : eventos}
                  onChange={(value) => {
                    // eslint-disable-next-line no-shadow
                    setFieldValue('evento', value);
                  }}
                  disabled={agendamentoLivre}
                  textfieldProps={{
                    variant: 'outlined',
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            path={mdiClipboardPulseOutline}
                            size={iconSize}
                            color={iconColor}
                          />
                        </InputAdornment>
                      ),
                    },
                    FormHelperTextProps: {
                      error: !!errors.evento,
                    },
                    helperText: errors.evento,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={12} lg={12}>
                <TextField
                  className={classes.textfield}
                  name="observacoes"
                  id="observacoes"
                  label="Observações"
                  value={values.observacoes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                  multiline
                  fullWidth
                  rows="4"
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} color="primary">
            Salvar
          </Button>
        </DialogActions>
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
  withFormik({
    displayName: 'FormikNovoAgendamento',
    validateOnChange: true,
    validateOnBlur: false,
    mapPropsToValues: () => ({
      observacoes: '',
      nomePaciente: '',
      paciente: '',
      plano: '',
      evento: '',
      telefone: '',
      celular: '',
      email: '',
      picture: '',
      preferencial: false,
      enviarConfirmacaoCadastro: true,
    }),
    validationSchema: () => Yup.object().shape({
      preferencial: Yup.boolean(),
      enviarConfirmacaoCadastro: Yup.boolean(),
      nomePaciente: Yup.string().required('Campo obrigatório'),
      telefone: Yup.string()
        .test('is-telefone', 'Formato do telefone inválido', (value) => {
          if (typeof value === 'undefined') {
            return true;
          } if (value.length !== 15) {
            return telValidator(value);
          }
          return celValidator(value);
        }),
      celular: Yup.string()
        .required('Campo obrigatório')
        .test('is-celular', 'Formato de celular inválido', celValidator),
    }),
    handleSubmit: async (values, { props, setSubmitting }) => {
      const formAgendamento = {
        ...values,
        statusPagamento: props.horarioAgenda.agenda.statusPagamento,
        horaInicial: props.horarioAgenda.horaInicial,
        grupoAgendamento: props.horarioAgenda.agenda.grupoAgendamento,
        paciente: values.paciente ? values.paciente : undefined,
        unidade: props.unidade.id,
        usuario: props.horarioAgenda.medico.id,
        data: moment(props.horarioAgenda.startDate).format('YYYY-MM-DD'),
        atendido: props.horarioAgenda.agenda.atendido,
        atendimento: props.horarioAgenda.agenda.atendimento,
        compareceu: props.horarioAgenda.agenda.compareceu,
        confirmado: props.horarioAgenda.agenda.confirmado,
        desistencia: props.horarioAgenda.agenda.desistencia,
        dataAtendido: props.horarioAgenda.agenda.dataAtendido,
        dataAtendimento: props.horarioAgenda.agenda.dataAtendimento,
        dataComparecimento: props.horarioAgenda.agenda.dataComparecimento,
        dataConfirmado: props.horarioAgenda.agenda.dataConfirmado,
        dataDesistencia: props.horarioAgenda.agenda.dataDesistencia,
        hora: moment(props.horarioAgenda.startDate).format('HH:mm'),
        encaixe: props.horarioAgenda.agenda.encaixe,
      };

      try {
        const { dados: agendamentos } = await AgendaService.atualizarHorarioAgenda(formAgendamento);
        props.notify('Agendamento atualizado com sucesso', { variant: 'success' });
        props.onComplete(agendamentos);
        props.handleClose();
        if (formAgendamento.paciente && values.picture) {
          const base64 = await values.picture.substring(23);
          await api.post(`/imagem/${bucketPacienteS3}/${values.paciente}`, {
            base64,
          });
        }
      } catch (err) {
        if (err.response && err.response.data.mensagem) {
          props.notify(err.response.data.mensagem, { variant: 'error' });
        } else {
          props.notify('Erro ao atualizar o agendamento', { variant: 'error' });
        }
        setSubmitting(false);
      }
      props.handleClose();
    },
  }),
)(FormModificacaoAgendamento);
