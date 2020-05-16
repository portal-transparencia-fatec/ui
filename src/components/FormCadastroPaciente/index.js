import React, { Component } from 'react';
import moment from 'moment';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import FormEndereco from '../FormEndereco';
import ModalSelect from '../ModalSelect';
import {
  InputFormatCpf,
  InputFormatData,
  InputFormatTelefone,
  InputFormatCelular,
} from '../InputFormat';
import NotificationActions from '../../store/ducks/notifier';
import PacienteService from '../../services/Paciente';
import ConvenioService from '../../services/Convenio';
import {
  weightHeightFormatter,
  decimalValidator,
  cepFormatter,
  telFormatter,
  celFormatter,
  textValidator,
  cpfValidator,
  telValidator,
  celValidator,
  dateValidator,
} from '../../libs/utils';

import Material, { Form } from './styles';

class FormCadastroPaciente extends Component {
  static defaultProps = {
    handleFormSubmit: () => {},
    paciente: {},
  };

  state = {
    convenios: [],
    planos: [],
    sexoOptionsDisplay: [
      'MASCULINO',
      'FEMININO',
    ],
  }

  componentDidMount() {
    this.fetchConvenios();
  }

  componentDidUpdate(prevProps) {
    const { paciente } = this.props;
    if (prevProps.paciente && prevProps.paciente.id !== paciente.id) {
      this.setPaciente();
    }
  }

  setPaciente = () => {
    const { paciente, setFieldValue, resetForm } = this.props;

    if (paciente && paciente.id) {
      resetForm();
      setFieldValue('peso', paciente.peso);
      setFieldValue('altura', paciente.altura);
      setFieldValue('nome', paciente.nome);
      setFieldValue('codigoLegado', paciente.codigoLegado);
      setFieldValue('cpf', String(paciente.cpf));
      setFieldValue('dataNascimento', paciente.dataNascimento);
      setFieldValue('sexo', paciente.sexo);
      setFieldValue('telefone', String(paciente.telefone).length !== 11 ? telFormatter(paciente.telefone) : celFormatter(paciente.telefone));
      setFieldValue('celular', String(paciente.celular));
      setFieldValue('email', paciente.email);
      setFieldValue('endereco', paciente.endereco);
      setFieldValue('enderecoBairro', paciente.enderecoBairro);
      setFieldValue('enderecoComplemento', paciente.enderecoComplemento);
      setFieldValue('enderecoNumero', Number(paciente.enderecoNumero));
      setFieldValue('planos', paciente.planos);
      setFieldValue('cep', cepFormatter(paciente.cep));
      setFieldValue('uf', paciente.uf);
      setFieldValue('cidade', paciente.cidade);
    } else {
      resetForm();
    }
  }

  fetchConvenios = async () => {
    const { notify } = this.props;
    try {
      const convenios = await ConvenioService.getAll(undefined, true);

      this.setState({
        convenios: convenios
          .map(conv => ({
            ...conv,
            filtroPlanos: conv.planos.map(({ nome }) => nome).join(', '),
          })),
        planos: convenios
          .map(({ id, nome, planos }) => planos
            .map(plano => ({
              id: plano.id, nome: plano.nome, idConvenio: id, nomeConvenio: nome,
            })))
          .reduce((previous, next) => [...previous, ...next]),
      });
    } catch (err) {
      notify('Erro ao buscar convênios', { variant: 'error' });
    }
  }

  onSelectPlanoConvenio = async (plano, optionSelect) => {
    const { planos } = this.state;
    const { values, setFieldValue } = this.props;

    const selectedPlanos = planos
      .filter(p => values.planos.some(planoId => planoId === p.id));

    const sameConvenioPlano = selectedPlanos.find(p => p.idConvenio === plano.idConvenio);

    if (sameConvenioPlano) {
      const index = values.planos.findIndex(planoId => planoId === sameConvenioPlano.id);
      values.planos.splice(index, 1);
      await setFieldValue('planos', values.planos);
    } else {
      optionSelect({ id: plano.id });
    }
  }

  render() {
    const {
      classes,
      values,
      errors,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      isSubmitting,
    } = this.props;
    const { sexoOptionsDisplay, convenios, planos } = this.state;

    return (
      <Form autoComplete="off" onSubmit={handleSubmit}>
        <Typography className={classes.textInstructions} component="p" variant="body1" color="textSecondary">
          Insira abaixo os dados do paciente.
        </Typography>
        <Grid container spacing={2}>
          <Grid item container justify="center" alignItems="center" sm={12} md={12} lg={12}>
            <TextField
              className={classes.textfield}
              name="nome"
              error={!!errors.nome}
              id="nome"
              label="Nome completo*"
              value={values.nome}
              onChange={(event) => {
                if (textValidator(event.target.value)) {
                  handleChange(event);
                }
              }}
              onBlur={handleBlur}
              variant="outlined"
              type="text"
              autoFocus
            />
          </Grid>
          <Grid item sm={12} md={4} lg={4}>
            <TextField
              className={classes.textfield}
              id="cpf"
              name="cpf"
              error={!!errors.cpf}
              label="CPF*"
              value={values.cpf}
              onChange={handleChange}
              onBlur={handleBlur}
              variant="outlined"
              type="text"
              InputProps={{
                inputComponent: InputFormatCpf,
              }}
            />
          </Grid>
          <Grid item sm={12} md={4} lg={4}>
            <TextField
              label="Debugger"
              className={classes.textfield}
              // name="dataNascimento"
              // error={!!errors.dataNascimento}
              // id="dataNascimento"
              // label="Data de nascimento*"
              // value={values.dataNascimento}
              // onChange={handleChange}
              // onBlur={handleBlur}
              // variant="outlined"
              // type="text"
              // InputProps={{
              //   inputComponent: InputFormatData,
              // }}
            />
          </Grid>
          <Grid item sm={12} md={4} lg={4}>
            <ModalSelect
              label="Sexo*"
              error={!!errors.sexo}
              placeholderFilter="Filtrar..."
              value={values.sexo}
              onChange={value => setFieldValue('sexo', value)}
              options={sexoOptionsDisplay.map(sexoOption => ({
                id: sexoOption,
                label: sexoOption,
              }))}
              textfieldProps={{
                variant: 'outlined',
                fullWidth: true,
              }}
            />
          </Grid>
          <Grid item sm={12} md={6} lg={6}>
            <TextField
              className={classes.textfield}
              inputRef={(input) => { this.telefoneInput = input; }}
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
          <Grid item sm={12} md={6} lg={6}>
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
          <Grid item sm={12} md={12} lg={12}>
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
          <Grid item sm={12} md={12} lg={8}>
            <ModalSelect
              label="Plano do convênio*"
              multiple
              error={!!errors.planos}
              empty="Carregando..."
              placeholderFilter="Filtrar plano do convênio"
              value={values.planos}
              options={planos
                .map(plano => ({ id: plano.id, label: plano.nome, subLabel: plano.nomeConvenio }))
              }
              onChange={value => setFieldValue('planos', value)}
              textfieldProps={{
                variant: 'outlined',
                fullWidth: true,
                className: classes.textfield,
              }}
            >
              {(options, value, filter, onSelect) => (
                convenios.filter(filter).map(conv => (
                  <ExpansionPanel key={conv.id}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography className={classes.heading}>{conv.nome}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <List dense style={{ width: '100%' }}>
                        {conv.planos.map(plano => (
                          <ListItem
                            key={plano.id}
                            role={undefined}
                            dense
                            button
                            style={{ width: '100%' }}
                            onClick={() => this.onSelectPlanoConvenio(plano, onSelect)}
                          >
                            <Checkbox
                              checked={value.some(val => (val === plano.id) || (val === val.label))}
                              tabIndex={-1}
                              color="primary"
                              disableRipple
                            />
                            <ListItemText primary={plano.nome} />
                          </ListItem>
                        ))}
                      </List>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                ))
              )}
            </ModalSelect>
          </Grid>
          <Grid item sm={12} md={12} lg={2}>
            <TextField
              className={classes.textfield}
              name="altura"
              id="altura"
              label="Altura"
              error={!!errors.altura}
              value={values.altura}
              onChange={(event) => {
                event.target.value = weightHeightFormatter(event.target.value);
                handleChange(event);
              }}
              onBlur={handleBlur}
              variant="outlined"
              type="text"
            />
          </Grid>
          <Grid item sm={12} md={12} lg={2}>
            <TextField
              className={classes.textfield}
              name="peso"
              id="peso"
              label="Peso"
              error={!!errors.peso}
              value={values.peso}
              onChange={(event) => {
                event.target.value = weightHeightFormatter(event.target.value);
                handleChange(event);
              }}
              onBlur={handleBlur}
              variant="outlined"
              type="text"
            />
          </Grid>
        </Grid>
        <FormEndereco
          values={values}
          handleChange={handleChange}
          handleBlur={handleBlur}
          errors={errors}
          setFieldValue={setFieldValue}
        />
        <Button
          className={classes.button}
          onClick={handleSubmit}
          variant="contained"
          size="medium"
          color="secondary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Salvar'}
        </Button>
      </Form>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withRouter,
  withStyles(Material),
  withFormik({
    displayName: 'FormCadastroPaciente',
    validateOnBlur: false,
    validateOnChange: false,
    enableReinitialize: true,
    mapPropsToValues: () => ({
      altura: '',
      peso: '',
      codigoLegado: '',
      nome: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      telefone: '',
      celular: '',
      email: '',
      endereco: '',
      enderecoBairro: '',
      enderecoComplemento: '',
      enderecoNumero: '',
      cep: '',
      cidade: '',
      uf: '',
      planos: [],
    }),
    validationSchema: Yup.object().shape({
      altura: Yup.string()
        .test('is-altura', 'Formato inválido', (value) => {
          if (typeof value === 'undefined') {
            return true;
          }
          if ((value).indexOf('.') !== -1) {
            return decimalValidator(value);
          }
          return true;
        }),
      peso: Yup.string()
        .test('is-peso', 'Formato inválido', (value) => {
          if (typeof value === 'undefined') {
            return true;
          }
          if ((value).indexOf('.') !== -1) {
            return decimalValidator(value);
          }
          return true;
        }),
      nome: Yup.string().required('Campo obrigatório'),
      cpf: Yup.string()
        .required('Campo obrigatório')
        .test('is-cpf', 'Formato do CPF inválido', cpfValidator),
      dataNascimento: Yup.string()
        .required('Campo obrigatório')
        .test('is-dataNascimento', 'Data de nascimento inválida', value => !!value && dateValidator(value)),
      sexo: Yup.string().required('Campo obrigatório'),
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
      endereco: Yup.string().required('Campo obrigatório'),
      enderecoBairro: Yup.string().required('Campo obrigatório'),
      enderecoNumero: Yup.number().required('Campo obrigatório'),
      cep: Yup.string().min(9, 'Campo obrigatório'),
      cidade: Yup.number().required('Campo obrigatório'),
      uf: Yup.string().required('Campo obrigatório'),
      planos: Yup
        .array()
        .min(1, 'Selecione ao menos 1 plano'),
    }),
    handleSubmit: async (values, { props, resetForm, setSubmitting }) => {
      const { pacienteId } = props.match.params;
      const pacienteForm = {
        ...values,
        id: pacienteId && !!Number(pacienteId) ? pacienteId : undefined,
        dataNascimento: moment(values.dataNascimento, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        enderecoNumero: String(values.enderecoNumero),
      };

      try {
        const paciente = await PacienteService.save(pacienteForm);
        props.notify('Cadastro salvo com sucesso', { variant: 'success' });
        resetForm();
        if (props.handleFormSubmit) {
          props.handleFormSubmit(paciente);
        }
        if (props.onCompleteUpdate) {
          props.onCompleteUpdate();
        }
      } catch (err) {
        if (err && err.response) {
          props.notify(err.response.data, { variant: 'warning' });
        } else {
          props.notify('Houve um problema ao salvar', { variant: 'error' });
        }
        setSubmitting(false);
      }
    },
  }),
)(FormCadastroPaciente);
