import React, { Component } from 'react';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import MagicDropzone from 'react-magic-dropzone';
import '../../../assets/css/Dropzone.css';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import GenericFileService from '../../../services/GenericFile';
import { InputFormatCnpj, InputFormatTelefone } from '../../../components/InputFormat';
import FormEndereco from '../../../components/FormEndereco';
import ModalSelect from '../../../components/ModalSelect';
import NotificationActions from '../../../store/ducks/notifier';
import EmpresaUnidadeService from '../../../services/EmpresaUnidade';
import EmpresaService from '../../../services/Empresa';
import {
  cnpjValidator,
  telValidator,
  cnpjFormatter,
  telFormatter,
  numberValidator,
} from '../../../libs/utils';

import Material from './styles';
import { Container } from '../../../styles/global';

const reader = new FileReader();
const bucketFileS3 = process.env.REACT_APP_V2_S3_FILES;

class CadastroEmpresaUnidade extends Component {
  state = {
    empresas: [],
  }

  componentDidMount() {
    this.fetchLogoEmpresa();
    this.fetchEmpresas();
    this.fetchEmpresaUnidade();
  }

  fetchEmpresas = async () => {
    const { notify } = this.props;
    try {
      const empresas = await EmpresaService.getAll();

      this.setState({ empresas });
    } catch (err) {
      notify('Não foi possível buscar as empresas', { variant: 'error' });
    }
  }

  fetchLogoEmpresa = async () => {
    const { setFieldValue, match: { params: { unidadeId } } } = this.props;
    try {
      if (this.isExistedEmpresaUnidade()) {
        let blob = await GenericFileService.downloadFile({
          bucketFileS3,
          filename: 'file',
          key: `logos/empresa/${unidadeId}`,
        });

        blob = new Blob([blob], { type: 'image/png' });
        setFieldValue('logo', window.URL.createObjectURL(blob));
      }
    } catch (err) {
      console.log(err);
    }
  }

  uploadFileS3 = async (file) => {
    const { match: { params: { unidadeId } } } = this.props;
    try {
      file.append('_method', 'PUT');
      await GenericFileService.uploadFile({
        bucketFileS3,
        filename: 'file',
        file,
        key: `logos/empresa/${unidadeId}`,
      });
      file.delete('_method');
    } catch (err) {
      console.log(err);
    }
  }

  isExistedEmpresaUnidade = () => {
    const { match: { params: { unidadeId } } } = this.props;
    return unidadeId && !!Number(unidadeId);
  }

  onDrop = async (data) => {
    const { setFieldValue } = this.props;
    try {
      const logo = new FormData();
      reader.onload = async () => {
        const { result: dataUri } = reader;

        fetch(dataUri)
          .then(res => res.blob())
          .then(async (blob) => {
            const file = new Blob([blob], { type: blob.type });
            await logo.append('file', file, 'file');
            this.uploadFileS3(logo);
            setFieldValue('logo', dataUri);
          });
      };
      reader.readAsDataURL(data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchEmpresaUnidade = async () => {
    const { setFieldValue, notify, match } = this.props;

    if (this.isExistedEmpresaUnidade()) {
      try {
        const unidade = await EmpresaUnidadeService.getById(match.params.unidadeId);
        if (unidade) {
          setFieldValue('razaoSocial', unidade.razaoSocial || '');
          setFieldValue('nome', unidade.nome || '');
          setFieldValue('identificador', unidade.identificador || '');
          setFieldValue('email', unidade.email || '');
          setFieldValue('ativo', unidade.ativo || true);
          setFieldValue('cnpj', cnpjFormatter(unidade.cnpj) || '');
          setFieldValue('telefone', telFormatter(unidade.telefone) || '');
          setFieldValue('empresa', unidade.idEmpresa || '');
          setFieldValue('endereco', unidade.endereco || '');
          setFieldValue('enderecoBairro', unidade.enderecoBairro || '');
          setFieldValue('enderecoComplemento', unidade.enderecoComplemento || '');
          setFieldValue('enderecoNumero', Number(unidade.enderecoNumero) || '');
          setFieldValue('cep', String(unidade.cep) || '');
          setFieldValue('uf', (unidade.cidade && unidade.cidade.estado.uf) || '');
          setFieldValue('cidade', (unidade.cidade && unidade.cidade.codigoIbge) || '');
          setFieldValue('possuiProdoctor', Object.prototype.hasOwnProperty.call(unidade, 'possuiProdoctor') && unidade.possuiProdoctor);
        } else {
          throw new Error();
        }
      } catch (err) {
        notify('Não foi possível buscar os dados da unidade', { variant: 'error' });
        this.refreshPage();
      }
    }
  }

  refreshPage = () => {
    const { history, match, resetForm } = this.props;
    const [url] = match.path.split('/:unidadeId');
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
      setFieldValue,
      isSubmitting,
    } = this.props;
    const { empresas } = this.state;

    return (
      <Container>
        <Grid container spacing={2}>
          <Paper className={classes.paper} elevation={5}>
            <form autoComplete="off" onSubmit={handleSubmit}>
              <Typography className={classes.textInstructions} component="p" color="textSecondary">
                    Insira abaixo os dados da unidade.
              </Typography>
              <Grid container spacing={2}>
                <Grid item sm={12} md={5} lg={5}>
                  <TextField
                    name="razaoSocial"
                    error={!!errors.razaoSocial}
                    id="razaoSocial"
                    label="Razão social*"
                    value={values.razaoSocial}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    type="text"
                  />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                  <TextField
                    name="nome"
                    error={!!errors.nome}
                    id="nome"
                    label="Nome*"
                    value={values.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    type="text"
                    autoFocus
                  />
                </Grid>
                <Grid item sm={12} md={2} lg={2}>
                  <TextField
                    id="identificador"
                    name="identificador"
                    error={!!errors.identificador}
                    label="Identificador*"
                    value={values.identificador}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    type="text"
                  />
                </Grid>
                <Grid item container justify="center" alignItems="center" sm={12} md={2} lg={2}>
                  <FormGroup row>
                    <FormControlLabel
                      control={(
                        <Switch
                          checked={values.possuiProdoctor}
                          name="possuiProdoctor"
                          onChange={handleChange}
                          color="primary"
                          value="bool"
                        />
                      )}
                      label={values.possuiProdoctor ? 'Integração ativa' : 'Integração inativa'} 
                    />
                  </FormGroup>
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="center">
                <Grid item sm={10} md={9} lg={9}>
                  <TextField
                    id="email"
                    name="email"
                    error={!!errors.email}
                    label="E-mail*"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    type="email"
                  />
                </Grid>
                <Grid item container justify="center" alignItems="center" sm={2} md={3} lg={3}>
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
                      label={values.ativo ? 'Empresa ativa' : 'Empresa inativa'}
                    />
                  </FormGroup>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item sm={12} md={4} lg={4}>
                  <TextField
                    id="cnpj"
                    name="cnpj"
                    error={!!errors.cnpj}
                    label="CNPJ*"
                    value={values.cnpj}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    type="text"
                    InputProps={{
                      inputComponent: InputFormatCnpj,
                    }}
                  />
                </Grid>
                <Grid item sm={12} md={4} lg={4}>
                  <TextField
                    id="telefone"
                    name="telefone"
                    error={!!errors.telefone}
                    label="Telefone*"
                    value={values.telefone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    type="text"
                    InputProps={{
                      inputComponent: InputFormatTelefone,
                    }}
                  />
                </Grid>
                <Grid item sm={12} md={4} lg={2}>
                  <TextField
                    id="cnes"
                    name="cnes"
                    error={!!errors.cnes}
                    label="CNES*"
                    value={values.cnes}
                    onChange={(event) => {
                      if (numberValidator(event.target.value)) {
                        handleChange(event);
                      }
                    }}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    type="text"
                  />
                </Grid>

                <Grid item sm={12} md={4} lg={2}>
                  <ModalSelect
                    label="Empresa*"
                    empty="Carregando..."
                    error={!!errors.empresa}
                    value={values.empresa}
                    options={empresas.map(({ id, nome }) => ({
                      id,
                      label: nome,
                    }))}
                    onChange={value => setFieldValue('empresa', value)}
                    textfieldProps={{
                      variant: 'outlined',
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item container justify="center" alignItems="center" sm={12} md={12} lg={12}>
                  <MagicDropzone
                    className="DropzoneUnidadeLogo"
                    accept="image/jpeg, image/png, .jpg, .jpeg, .png"
                    onDrop={logo => this.onDrop(logo.find(Boolean))}
                  >
                    <Grid className="DropzoneUnidadeLogo-content">
                      {values.logo ? (
                        <>
                          <Grid>Solte o logotipo aqui ou clique para fazer o envio.</Grid>
                          <img key={values.logo} alt="" className="DropzoneUnidadeLogo-img" src={values.logo} />
                        </>
                      ) : (
                        <Grid>Solte o logotipo aqui ou clique para fazer o envio.</Grid>
                      )}
                    </Grid>
                  </MagicDropzone>
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
            </form>
          </Paper>
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
    displayName: 'CadastroEmpresaUnidade',
    validateOnBlur: false,
    validateOnChange: false,
    mapPropsToValues: () => ({
      logo: '',
      razaoSocial: '',
      nome: '',
      identificador: '',
      possuiProdoctor: false,
      email: '',
      ativo: true,
      cnpj: '',
      telefone: '',
      empresa: '',
      endereco: '',
      enderecoBairro: '',
      enderecoComplemento: '',
      enderecoNumero: '',
      cep: '',
      cidade: '',
      uf: '',
      cnes: '',
    }),
    validationSchema: Yup.object().shape({
      razaoSocial: Yup.string().required('Campo obrigatório'),
      nome: Yup.string().required('Campo obrigatório'),
      identificador: Yup.string().required('Campo obrigatório'),
      possuiProdoctor: Yup.boolean().required('Campo obrigatório'),
      email: Yup.string().required('Campo obrigatório').email('E-mail inválido'),
      ativo: Yup.boolean().required('Campo obrigatório'),
      cnpj: Yup.string().required('Campo obrigatório').test('is-cnpj', 'Formato de CNPJ inválido', cnpjValidator),
      telefone: Yup.string().required('Campo obrigatório').test('is-telefone', 'Formato de telefone inválido', telValidator),
      empresa: Yup.number().required('Campo obrigatório'),
      endereco: Yup.string().required('Campo obrigatório'),
      enderecoBairro: Yup.string().required('Campo obrigatório'),
      enderecoNumero: Yup.number().required('Campo obrigatório'),
      cep: Yup.string().required('Campo obrigatório'),
      cidade: Yup.number().required('Campo obrigatório'),
      uf: Yup.string().required('Campo obrigatório'),
      cnes: Yup.string().required('Campo obrigatório'),
    }),
    handleSubmit: async (values, { props, resetForm, setSubmitting }) => {
      const unidadeForm = {
        ...values,
        enderecoNumero: String(values.enderecoNumero),
      };
      const { match: { params: { unidadeId } } } = props;

      try {
        if (unidadeId && !!Number(unidadeId)) {
          await EmpresaUnidadeService.save({ ...unidadeForm, id: unidadeId });
        } else {
          await EmpresaUnidadeService.save(unidadeForm);
        }
        props.notify('Cadastro salvo com sucesso', { variant: 'success' });
        const { history, match } = props;
        const [url] = match.path.split('/:unidadeId');
        resetForm();
        history.replace(`${url}/novo`);
      } catch (err) {
        setSubmitting(false);
        props.notify('Houve um problema ao salvar', { variant: 'error' });
      }
    },
  }),
)(CadastroEmpresaUnidade);
