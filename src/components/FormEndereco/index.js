import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';

import Search from '@material-ui/icons/Search';
import ModalSelect from '../ModalSelect';
import ConsultaCEP from '../../services/ConsultaCEP';
import EstadoService from '../../services/Estado';
import CidadeService from '../../services/Cidade';

import { InputFormatCep } from '../InputFormat';
import NotificationActions from '../../store/ducks/notifier';
import { cepValidator } from '../../libs/utils';

import Material from './styles';

class FormEndereco extends Component {
  static propTypes = {
    paperElevation: PropTypes.number,
    handleChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    paperElevation: 0,
  };

  state = {
    estados: [],
    cidades: [],
    loadingSearch: false,
  }

  componentDidMount() {
    this.fetchEstados();
  }

  componentDidUpdate(prevProps) {
    const { values } = this.props;

    if (values.uf !== prevProps.values.uf) {
      this.fetchCidades();
    }
  }

  fetchEstados = async () => {
    const estados = await EstadoService.all();

    this.setState({ estados });
  }

  handleClickSearchCep = async () => {
    const { setFieldValue, values } = this.props;
    try {
      if (cepValidator(values.cep)) {
        this.setState({ loadingSearch: true });
        const enderecoBuscado = await ConsultaCEP.consulta(values.cep);

        if (enderecoBuscado) {
          setFieldValue('uf', enderecoBuscado.uf);
          setFieldValue('endereco', `${enderecoBuscado.tipoLogradouro} ${enderecoBuscado.logradouro}`);
          setFieldValue('enderecoBairro', enderecoBuscado.bairro);
          const cidadeBuscada = String(enderecoBuscado.cidade).toUpperCase();
          const cidades = await CidadeService.getByUf(enderecoBuscado.uf);
          await this.setState({ cidades });
          const cidade = cidades.find(city => city.nome === cidadeBuscada);

          if (cidade) {
            setFieldValue('cidade', cidade.codigoIbge);
          }
        }
      }
    } catch (err) {
      const { notify } = this.props;
      notify('Serviço de CEP indiponível', { variant: 'error' });
    } finally {
      this.setState({ loadingSearch: false });
    }
  }

  fetchCidades = async () => {
    const { values, setFieldValue, notify } = this.props;

    try {
      if (values.uf) {
        const cidades = await CidadeService.getByUf(values.uf);
        await this.setState({ cidades });
        const cidade = cidades.find(city => city.nome === values.cidade);

        if (cidade) {
          setFieldValue('cidade', cidade.codigoIbge);
        }
      }
    } catch (err) {
      setFieldValue('cidade', '');
      this.setState({ cidades: [] });
      notify('Não foi possível buscar as cidades', { variant: 'error' });
    }
  }

  render() {
    const {
      classes,
      paperElevation,
      values,
      handleChange,
      handleBlur,
      errors,
      setFieldValue,
      notify,
    } = this.props;
    const {
      estados,
      cidades,
      loadingSearch,
    } = this.state;

    return (
      <Grid container className={classes.container} alignItems="flex-start">
        <Grid container item justify="center" alignItems="flex-start">
          <Paper className={classes.paper} elevation={paperElevation}>
            <Typography className={classes.textInstructions} component="p" variant="body1" color="textSecondary">
              Preencha os dados abaixo de endereço.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3} md={3} lg={3}>
                <TextField
                  className={classes.textfield}
                  error={!!errors.cep}
                  id="cep"
                  name="cep"
                  label="CEP*"
                  value={values.cep}
                  onChange={async (e) => {
                    const { target: { value } } = e;
                    await handleChange(e);
                    if (values.cep !== value && value.length === 9) {
                      this.handleClickSearchCep();
                    }
                  }}
                  onBlur={handleBlur}
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      if (values.cep.length === 9) {
                        event.preventDefault();
                        this.handleClickSearchCep();
                      } else {
                        notify('Digite o CEP completo.', { variant: 'warning' });
                      }
                    }
                  }}
                  variant="outlined"
                  type="text"
                  InputProps={{
                    inputComponent: InputFormatCep,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Pesquisar por CEP"
                          onClick={() => {
                            if (values.cep.length === 9) {
                              this.handleClickSearchCep();
                            } else {
                              notify('Digite o CEP completo.', { variant: 'warning' });
                            }
                          }}
                          disabled={loadingSearch}
                        >
                          {loadingSearch ? <CircularProgress size={32} color="primary" /> : <Search />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={9} md={9} lg={9}>
                <TextField
                  className={classes.textfield}
                  error={!!errors.endereco}
                  id="endereco"
                  name="endereco"
                  label="Endereço*"
                  value={values.endereco}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                />
              </Grid>
              <Grid item xs={12} sm={4} md={4} lg={4}>
                <ModalSelect
                  label="Estado*"
                  error={!!errors.uf}
                  empty="Carregando..."
                  placeholderFilter="Filtrar estados..."
                  value={values.uf}
                  options={estados.map(estado => ({ id: estado.uf, label: estado.nome }))}
                  onChange={value => setFieldValue('uf', value)}
                  textfieldProps={{
                    variant: 'outlined',
                    fullWidth: true,
                    className: classes.textfield,
                  }}
                />
              </Grid>
              <Grid item xs={9} sm={6} md={6} lg={6}>
                <ModalSelect
                  label="Cidade*"
                  error={!!errors.cidade}
                  empty="Carregando..."
                  placeholderFilter="Filtrar cidades..."
                  value={values.cidade}
                  options={cidades.map(city => ({ id: city.codigoIbge, label: city.nome }))}
                  onChange={value => setFieldValue('cidade', value)}
                  textfieldProps={{
                    variant: 'outlined',
                    fullWidth: true,
                    className: classes.textfield,
                  }}
                />
              </Grid>
              <Grid item xs={3} sm={2} md={2} lg={2}>
                <TextField
                  className={classes.textfield}
                  error={!!errors.enderecoNumero}
                  id="enderecoNumero"
                  name="enderecoNumero"
                  label="Número*"
                  value={values.enderecoNumero}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="number"
                />
              </Grid>
              <Grid item xs={4} sm={4} md={4} lg={4}>
                <TextField
                  className={classes.textfield}
                  error={!!errors.enderecoBairro}
                  id="enderecoBairro"
                  name="enderecoBairro"
                  label="Bairro*"
                  value={values.enderecoBairro}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                />
              </Grid>
              <Grid item xs={8} sm={8} md={8} lg={8}>
                <TextField
                  className={classes.textfield}
                  id="enderecoComplemento"
                  name="enderecoComplemento"
                  label="Complemento"
                  value={values.enderecoComplemento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  type="text"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default connect(null, mapDispatchToProps)(withStyles(Material)(FormEndereco));
