import React, { Component } from 'react';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

import ListaEmpresas from './components/ListaEmpresas';

import NotificationActions from '../../../store/ducks/notifier';
import EmpresaService from '../../../services/Empresa';

import Material, { Form } from './styles';

class CadastroEmpresa extends Component {
  componentDidMount() {
    this.fetchEmpresa();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    if (prevProps.match.params.empresaId !== match.params.empresaId) {
      this.fetchEmpresa();
    }
  }

  isExistedEmpresa = () => {
    const { match: { params: { empresaId } } } = this.props;
    return empresaId && !!Number(empresaId);
  }

  fetchEmpresa = async () => {
    const { setFieldValue, notify, match } = this.props;

    if (this.isExistedEmpresa()) {
      try {
        const empresa = await EmpresaService.getById(match.params.empresaId);

        if (empresa) {
          setFieldValue('nome', empresa.nome);
          setFieldValue('identificador', empresa.identificador);
        } else {
          throw new Error();
        }
      } catch (err) {
        notify('Não foi possível buscar os dados da empresa', { variant: 'error' });
        this.refreshPage();
      }
    }
  }

  refreshPage = () => {
    const { history, match, resetForm } = this.props;
    const [url] = match.path.split('/:empresaId');
    resetForm();
    history.replace(`${url}/novo`);
  }

  render() {
    const {
      classes,
      values,
      errors,
      handleChange,
      handleBlur,
      handleSubmit,
      isSubmitting,
    } = this.props;

    return (
      <Grid container className={classes.container} alignItems="flex-start">
        <Grid container item justify="center" alignItems="flex-start">
          <Paper className={classes.paper} elevation={5}>
            <Form autoComplete="off" onSubmit={handleSubmit}>
              <Typography className={classes.textInstructions} component="p" variant="body1">
                    Insira abaixo os dados da empresa.
              </Typography>
              <Grid container spacing={2} justify="space-between" direction="row" alignItems="center">
                <Grid item sm={12} md={9} lg={9}>
                  <TextField
                    className={classes.textfield}
                    name="nome"
                    error={!!errors.nome}
                    id="nome"
                    label="Nome*"
                    value={values.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    margin="normal"
                    variant="outlined"
                    type="text"
                    autoFocus
                  />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                  <TextField
                    className={classes.textfield}
                    id="identificador"
                    name="identificador"
                    error={!!errors.identificador}
                    label="Identificador*"
                    value={values.identificador}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    margin="normal"
                    variant="outlined"
                    type="text"
                  />
                </Grid>
                {this.isExistedEmpresa() && (
                  <Grid item sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      onClick={this.refreshPage}
                      variant="contained"
                      color="default"
                      type="button"
                    >
                      Cancelar edição
                    </Button>
                  </Grid>
                )}
                <Grid item sm={12} md={12} lg={12}>
                  <Button
                    fullWidth
                    onClick={handleSubmit}
                    variant="contained"
                    color="secondary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Salvar'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
            <ListaEmpresas />
          </Paper>
        </Grid>
      </Grid>
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
    displayName: 'CadastroEmpresa',
    validateOnBlur: false,
    validateOnChange: false,
    mapPropsToValues: () => ({
      nome: '',
      identificador: '',
    }),
    validationSchema: Yup.object().shape({
      nome: Yup.string().required('Campo obrigatório'),
      identificador: Yup.string().required('Campo obrigatório'),
    }),
    handleSubmit: async (values, { props, resetForm, setSubmitting }) => {
      const { match: { params: { empresaId } } } = props;
      const empresaForm = {
        ...values,
      };

      try {
        if (empresaId && !!Number(empresaId)) {
          await EmpresaService.save({ ...empresaForm, id: empresaId });
        } else {
          await EmpresaService.save(empresaForm);
        }
        props.notify('Cadastro salvo com sucesso', { variant: 'success' });
        resetForm();
      } catch (err) {
        setSubmitting(false);
        props.notify('Houve um problema ao salvar', { variant: 'error' });
      }
    },
  }),
)(CadastroEmpresa);
