/* eslint-disable func-names */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';

import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { DatePicker, TimePicker } from '@material-ui/pickers';

import CalendarIcon from '@material-ui/icons/CalendarToday';
import IconButton from '@material-ui/core/IconButton';

import CardMembership from '@material-ui/icons/CardMembership';
import Icon from '@mdi/react';
import {
  mdiClipboardPulseOutline,
  mdiDoctor,
  mdiAccountBox,
} from '@mdi/js';

import ModalSelect from '../../../../../components/ModalSelect';
import UsuarioService from '../../../../../services/Usuario';
import PacienteService from '../../../../../services/Paciente';
import EventoService from '../../../../../services/Evento';
import ConvenioService from '../../../../../services/Convenio';
import AgendaService from '../../../../../services/Agenda';
import NotificationActions from '../../../../../store/ducks/notifier';
import Material from './styles';
import {
  InputmaskDateTimePicker,
  InputFormatTelefone,
  InputFormatCelular,
} from '../../../../../components/InputFormat';

const iconColor = '#333';
const iconSize = '24px';

/**
 * Formulario responsável por cadastrar
 * um encaixe na agenda
 */
class FormNovoEncaixe extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
  }

  state = {
    loading: false,
    medicos: [],
    pacientes: [],
    planos: [],
    eventos: [],
    isNovoPaciente: false,
  }

  handleChangeDate = input => (date) => {
    const { setFieldValue } = this.props;
    setFieldValue(input, date);
  }

  loadData = async () => {
    const { notify, unidade } = this.props;

    try {
      const [medicos, eventos] = await Promise.all([
        UsuarioService.search(true, true, unidade.id),
        EventoService.getEventos(),
      ]);

      this.setState({
        medicos,
        eventos: eventos.map(({ id, descricao }) => ({ id, label: descricao })),
      });
    } catch (err) {
      notify('Não foi possível buscar os dados para o encaixe', { variant: 'error' });
    }
  }

  fetchPlanos = async () => {
    const { notify } = this.props;
    this.setState({ loading: true });

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
    } finally {
      this.setState({ loading: false });
    }
  }

  onSearchPaciente = async (pacienteSearch) => {
    const { notify } = this.props;
    this.setState({ loading: true });

    if (!String(pacienteSearch).trim()) {
      this.setState({
        pacientes: [],
        planos: [],
        loading: false,
      });
      return;
    }

    try {
      const pacientes = await PacienteService.getAll(pacienteSearch);

      this.setState({
        loading: false,
        pacientes: pacientes
          .map(paciente => ({ id: paciente.id, label: paciente.nome, ...paciente })),
      });
    } catch (err) {
      this.setState({ loading: false });
      notify('Erro ao buscar o paciente', { variant: 'error' });
    }
  }

  handleChangePaciente = (value) => {
    const { setFieldValue } = this.props;
    const { pacientes } = this.state;
    setFieldValue('paciente', value);

    const paciente = pacientes.find(pac => pac.id === value);

    setFieldValue('nomePaciente', paciente.nome);
    setFieldValue('telefone', paciente.telefone);
    setFieldValue('celular', paciente.celular);
    setFieldValue('email', paciente.email);

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
      }, () => {
        const [planoPayload] = paciente.planos;
        setFieldValue('plano', planoPayload.plano.id);
      });
    }
  }

  handleChangeNovoPaciente = ({ target: { checked: isNovoPaciente } }) => {
    const { resetForm, values, setFieldValue } = this.props;

    resetForm({
      ...values,
      plano: '',
      nomePaciente: '',
      paciente: '',
      telefone: '',
      celular: '',
      email: '',
    });

    this.setState({ isNovoPaciente, planos: [] });
    setFieldValue('isNovoPaciente', isNovoPaciente);
    /**
     * Busca todos os planos caso o paciente
     * não possui cadastro no sistema
     */
    if (isNovoPaciente) {
      this.fetchPlanos();
    }
  }

  render() {
    const {
      open,
      handleClose,
      resetForm,
      setFieldValue,
      values,
      errors,
      handleSubmit,
      handleChange,
      isSubmitting,
      classes,
    } = this.props;
    const {
      loading,
      medicos,
      pacientes,
      planos,
      eventos,
      isNovoPaciente,
      handleBlur,
    } = this.state;

    return (
      <Dialog
        maxWidth="lg"
        fullWidth
        open={open}
        onEntered={this.loadData}
        onClose={handleClose}
        onExited={() => resetForm()}
        aria-labelledby="form-novo-encaixe"
      >
        <DialogTitle>Agendar Encaixe</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid
              item
              container
              spacing={2}
              sm={12}
              md={12}
              lg={12}
            >
              <Grid item sm={12} md={12} lg={12}>
                <Typography color="textSecondary">
                  Preencha o formulário abaixo para salvar um novo encaixe
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <ModalSelect
                  label="Médico*"
                  empty="Lista de médicos vazia..."
                  error={!!errors.usuario}
                  value={values.usuario}
                  options={medicos.map(({ id, nome }) => ({ id, label: nome }))}
                  onChange={value => setFieldValue('usuario', value)}
                  textfieldProps={{
                    variant: 'outlined',
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon
                            path={mdiDoctor}
                            size={iconSize}
                            color={iconColor}
                          />
                        </InputAdornment>
                      ),
                    },
                    FormHelperTextProps: {
                      error: !!errors.usuario,
                    },
                    helperText: errors.usuario,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <DatePicker
                  invalidDateMessage="Data inválida"
                  cancelLabel="Cancelar"
                  clearLabel="Limpar"
                  todayLabel="Hoje"
                  clearable
                  allowKeyboardControl
                  ampm={false}
                  label="Data*"
                  placeholder="DD/MM/YYYY"
                  value={values.data}
                  error={!!errors.data}
                  onChange={date => setFieldValue('data', date)}
                  mask={InputmaskDateTimePicker}
                  format="DD/MM/YYYY"
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
              <Grid item xs={6} sm={2} md={2} lg={2}>
                <TimePicker
                  error={!!errors.hora}
                  name="hora"
                  label="Hora*"
                  value={values.hora}
                  onChange={this.handleChangeDate('hora')}
                  invalidDateMessage="Hora inválida"
                  cancelLabel="Cancelar"
                  clearLabel="Limpar"
                  todayLabel="Hoje"
                  clearable
                  allowKeyboardControl
                  ampm={false}
                  placeholder="Hora*"
                  mask={InputmaskDateTimePicker}
                  format="HH:mm"
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
                    loadingSearch={loading}
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
                      FormHelperTextProps: {
                        error: !!errors.paciente,
                      },
                      helperText: errors.paciente,
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
                      name="entrada"
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
                      Enviar Confirmação de Cadastro?
                    </span>
                  )}
                />
              </Grid>

              <Grid item sm={12} md={12} lg={4}>
                <TextField
                  name="telefone"
                  error={!!errors.telefone}
                  id="telefone"
                  label="Telefone"
                  fullWidth
                  value={values.telefone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                  InputProps={{
                    inputComponent: InputFormatTelefone,
                  }}
                />
              </Grid>
              <Grid item sm={12} md={12} lg={4}>
                <TextField
                  error={!!errors.celular}
                  name="celular"
                  id="celular"
                  label="Celular*"
                  fullWidth
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
              <Grid item sm={12} md={12} lg={4}>
                <TextField
                  name="email"
                  id="email"
                  label="E-mail"
                  fullWidth
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <ModalSelect
                  label="Plano do convênio*"
                  empty="Lista de planos vazia..."
                  error={!!errors.plano}
                  value={values.plano}
                  options={planos}
                  onChange={value => setFieldValue('plano', value)}
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
                  options={eventos}
                  onChange={value => setFieldValue('evento', value)}
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
    displayName: 'FormikNovoEncaixe',
    validateOnChange: false,
    validateOnBlur: false,
    mapPropsToValues: () => ({
      usuario: '',
      data: null,
      hora: null,
      nomePaciente: '',
      paciente: '',
      plano: '',
      evento: '',
      telefone: '',
      celular: '',
      email: '',
      preferencial: false,
      enviarConfirmacaoCadastro: true,
      isNovoPaciente: false,
    }),
    validationSchema: () => Yup.object().shape({
      preferencial: Yup.boolean(),
      enviarConfirmacaoCadastro: Yup.boolean(),
      usuario: Yup.string().required('Campo obrigatório'),
      data: Yup.date()
        .required('Campo obrigatório'),
      hora: Yup.string()
        .required('Campo obrigatório'),
      paciente: Yup.number().test('is-Paciente', 'Campo obrigatório', function (value) {
        if (!this.parent.isNovoPaciente) {
          if (typeof value === 'undefined') {
            return false;
          }
        }
        return true;
      }),
      nomePaciente: Yup.string().test('is-NomePaciente', 'Campo obrigatório', function (value) {
        if (this.parent.isNovoPaciente) {
          if (typeof value === 'undefined') {
            return false;
          }
        }
        return true;
      }),
      plano: Yup.number(),
      evento: Yup.number()
        .required('Campo obrigatório'),
    }),
    handleSubmit: async (values, { props, setSubmitting, resetForm }) => {
      const data = moment(values.data, 'DD/MM/YYYY').format('YYYY-MM-DD');
      const hora = moment(values.hora).format('HH:mm');
      if (moment(`${data}T${values.hora}`).isBefore(new Date())) {
        props.notify('Horário de agendamento inválido', { variant: 'error' });
        setSubmitting(false);
        return;
      }

      const formEncaixe = {
        ...values,
        paciente: values.paciente ? values.paciente : undefined,
        unidade: props.unidade.id,
        data,
        hora,
        atendido: false,
        atendimento: false,
        compareceu: false,
        confirmado: false,
        encaixe: true,
        statusPagamento: 'AGUARDANDO',
      };

      try {
        const { dados: encaixe } = await AgendaService.saveHorarioAgenda(formEncaixe);
        props.notify('Encaixe salvo com sucesso', { variant: 'success' });
        props.onComplete(encaixe);
        props.handleClose();
        resetForm();
      } catch (err) {
        if (err.response && err.response.data.mensagem) {
          props.notify(err.response.data.mensagem, { variant: 'error' });
        } else {
          props.notify('Erro ao salvar o encaixe', { variant: 'error' });
        }
        setSubmitting(false);
      }
    },
  }),
)(FormNovoEncaixe);
