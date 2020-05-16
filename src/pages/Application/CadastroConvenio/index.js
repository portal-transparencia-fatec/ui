/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { withFormik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import ListaConvenios from './components/ListaConvenios';
import NotificationActions from '../../../store/ducks/notifier';
import ConvenioService from '../../../services/Convenio';
import { InputFormatCnpj } from '../../../components/InputFormat';
import { cnpjValidator, cnpjFormatter } from '../../../libs/utils';

import Material from './styles';
import { Container } from '../../../styles/global';

class CadastroConvenio extends Component {
  state = {
    activeStep: 0,
    updateConvenios: false,
  }

  componentDidMount() {
    this.fetchConvenio();
  }

  componentDidUpdate(prevProps) {
    const { match: { params }, status, setStatus } = this.props;

    if (prevProps.match.params.convenioId !== params.convenioId) {
      this.fetchConvenio();
    }

    if (status && status.updateConvenios) {
      this.setState({ updateConvenios: status.updateConvenios });
      setStatus({ updateConvenios: !status.updateConvenios });
    }
  }

  onCompleteUpdate = () => {
    const { updateConvenios } = this.state;
    this.setState({ updateConvenios: !updateConvenios, activeStep: 0 });
  }

  isExistedConvenio = () => {
    const { match: { params: { convenioId } } } = this.props;
    return convenioId && !!Number(convenioId);
  }

  fetchConvenio = async () => {
    this.setState({ activeStep: 0 });
    const {
      setFieldValue, notify, history, match,
    } = this.props;

    if (this.isExistedConvenio()) {
      try {
        const convenio = await ConvenioService.getById(match.params.convenioId);

        if (convenio) {
          setFieldValue('ativo', convenio.ativo);
          setFieldValue('cnpj', convenio.cnpj ? cnpjFormatter(convenio.cnpj) : undefined);
          setFieldValue('nome', convenio.nome);
          setFieldValue('razaoSocial', convenio.razaoSocial);
          setFieldValue('planos', convenio.planos.map(({ id, nome }) => ({ id, nome })));
        } else {
          throw new Error();
        }
      } catch (err) {
        notify('Não foi possível buscar os dados do convenio', { variant: 'error' });
        const [url] = match.path.split('/:convenioId');
        history.replace(url);
      }
    }
  }

  handleClickStepNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1,
    }));
  }

  handleClickStepBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  render() {
    const {
      classes,
      values,
      errors,
      handleChange,
      handleSubmit,
      isSubmitting,
    } = this.props;
    const { activeStep, updateConvenios } = this.state;

    return (
      <Container>
        <Grid container spacing={2}>
          <Grid item sm={12} md={12} lg={12}>
            <Paper className={classes.paper} elevation={5}>
              <form autoComplete="off" onSubmit={handleSubmit}>

                <Stepper activeStep={activeStep}>
                  <Step>
                    <StepLabel
                      error={(!!errors.nome || !!errors.cnpj || !!errors.razaoSocial)}
                      optional={(!!errors.nome || !!errors.cnpj || !!errors.razaoSocial) ? (
                        <Typography variant="caption" color="error">
                          {(!!errors.nome && `Nome - ${errors.nome}`)
                          || (errors.cnpj && `CNPJ - ${errors.cnpj}`)
                          || (errors.razaoSocial && `Razão social - ${errors.razaoSocial}`)}
                        </Typography>
                      ) : undefined}
                    >
                      Dados do convênio
                    </StepLabel>
                  </Step>

                  <Step>
                    <StepLabel
                      error={!!errors.planos}
                    >
                      Registro de planos
                    </StepLabel>
                  </Step>
                </Stepper>

                {(() => {
                  switch (activeStep) {
                    case 0:
                      return (
                        <Grid container spacing={2}>
                          <Grid item sm={12} md={8} lg={8}>
                            <TextField
                              fullWidth
                              name="nome"
                              error={!!errors.nome}
                              id="nome"
                              label="Nome*"
                              value={values.nome}
                              onChange={handleChange}
                              variant="outlined"
                              type="text"
                              autoFocus
                            />
                          </Grid>
                          <Grid item sm={12} md={4} lg={4}>
                            <TextField
                              fullWidth
                              id="cnpj"
                              name="cnpj"
                              error={!!errors.cnpj}
                              label="CNPJ"
                              value={values.cnpj}
                              onChange={handleChange}
                              variant="outlined"
                              type="text"
                              InputProps={{
                                inputComponent: InputFormatCnpj,
                              }}
                            />
                          </Grid>
                          <Grid item sm={12} md={8} lg={4}>
                            <TextField
                              fullWidth
                              id="razaoSocial"
                              name="razaoSocial"
                              error={!!errors.razaoSocial}
                              label="Razão social*"
                              value={values.razaoSocial}
                              onChange={handleChange}
                              variant="outlined"
                              type="text"
                            />
                          </Grid>
                          <Grid item sm={4} md={4} lg={4}>
                            <FormGroup row>
                              <FormControlLabel
                                control={(
                                  <Switch
                                    checked={values.ativo}
                                    name="ativo"
                                    onChange={handleChange}
                                    color="primary"
                                    value="bool"
                                  />
                              )}
                                label={values.ativo ? 'Ativo' : 'Inativo'}
                              />
                            </FormGroup>
                          </Grid>
                          <Grid item sm={4} md={4} lg={4}>
                            <FormGroup row>
                              <FormControlLabel
                                control={(
                                  <Switch
                                    checked={values.particular}
                                    name="particular"
                                    onChange={handleChange}
                                    color="primary"
                                    value="bool"
                                  />
                              )}
                                label={values.particular ? 'Particular' : 'Convênio'}
                              />
                            </FormGroup>
                          </Grid>
                        </Grid>
                      );
                    case 1:
                      return (
                        <FieldArray
                          name="planos"
                          render={arrayHelpers => (
                            <Grid container spacing={2}>
                              {
                                values.planos && values.planos.length > 0 ? (
                                  values.planos.map((plano, index) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <Grid key={index} container item sm={12} md={12} lg={12}>
                                      <Grid item sm={10} md={10} lg={10}>
                                        <TextField
                                          fullWidth
                                          name={`planos[${index}].nome`}
                                          error={errors.planos && errors.planos[index]
                                            ? !!errors.planos[index]
                                            : false
                                          }
                                          label={`Plano ${index + 1}*`}
                                          value={plano.nome}
                                          onChange={handleChange}
                                          variant="outlined"
                                          type="text"
                                          onKeyPress={(event) => {
                                            if (event.key === 'Enter') {
                                              event.preventDefault();
                                              arrayHelpers.push({ id: undefined, nome: '' });
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Grid item sm={2} md={2} lg={2}>
                                        <IconButton onClick={() => arrayHelpers.remove(index)}>
                                          <RemoveCircleIcon size={28} />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  ))
                                ) : null
                              }
                              <Grid item sm={12} md={12} lg={12}>
                                <Button
                                  color="primary"
                                  onClick={() => arrayHelpers.push({ id: undefined, nome: '' })}
                                >
                                  Adicionar plano
                                </Button>
                              </Grid>

                            </Grid>
                          )}
                        />
                      );
                    default:
                      return null;
                  }
                })()}

                <Grid container spacing={3} alignItems="stretch">
                  <Grid item>
                    <Button
                      className={classes.button}
                      disabled={activeStep === 0}
                      onClick={this.handleClickStepBack}
                    >
                      Voltar
                    </Button>
                  </Grid>

                  <Grid item>
                    <Button
                      className={classes.button}
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      onClick={async () => {
                        if (activeStep === 1) {
                          handleSubmit();
                        } else {
                          this.handleClickStepNext();
                        }
                      }}
                    >
                      {activeStep === 1 ? 'Finalizar' : 'Próximo'}
                    </Button>
                  </Grid>
                </Grid>


              </form>
            </Paper>
          </Grid>
          <Grid item sm={12} md={12} lg={12}>
            <Paper className={classes.paper} elevation={5}>
              <ListaConvenios
                onUpdateConvenios={updateConvenios}
                onCompleteUpdate={this.onCompleteUpdate}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
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
    displayName: 'CadastroConvenio',
    validateOnBlur: false,
    validateOnChange: false,
    mapPropsToValues: () => ({
      ativo: true,
      particular: false,
      cnpj: '',
      nome: '',
      razaoSocial: '',
      planos: [],
    }),
    validationSchema: Yup.object().shape({
      ativo: Yup.boolean().required('Campo obrigatório'),
      particular: Yup.boolean().required('Campo obrigatório'),
      cnpj: Yup.string()
        .test('is-cnpj', 'Formato de CNPJ inválido', (value) => {
          if (typeof value === 'undefined') {
            return true;
          }
          return cnpjValidator(value);
        }),
      nome: Yup.string().required('Campo obrigatório'),
      razaoSocial: Yup.string().required('Campo obrigatório'),
    }),
    handleSubmit: async (values, {
      props, resetForm, setSubmitting, setStatus,
    }) => {
      let convenioForm = {
        ...values,
        cnpj: values.cnpj || undefined,
      };

      const { match: { params: { convenioId } } } = props;
      if (convenioId && !!Number(convenioId)) {
        convenioForm = {
          ...convenioForm,
          id: convenioId,
        };
      }

      try {
        await ConvenioService.save(convenioForm);
        props.notify('Cadastro salvo com sucesso', { variant: 'success' });
        resetForm();
        await setStatus({ updateConvenios: true });
        const [url] = props.match.path.split('/:convenioId');
        props.history.replace(url);
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
)(CadastroConvenio);
