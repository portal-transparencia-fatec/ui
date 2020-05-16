import React, { Component, Fragment } from 'react';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import NumberFormat from 'react-number-format';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import NotificationActions from '../../../store/ducks/notifier';
import EventoService from '../../../services/Evento';
import ConvenioService from '../../../services/Convenio';
import ModalSelect from '../../../components/ModalSelect';
import ListaEventosConvenios from './components/ListaEventosConvenios';

import Material, { Form } from './styles';


function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.floatValue,
          },
        });
      }}
      decimalSeparator=","
      thousandSeparator="."
      allowNegative="false"
      prefix="R$"
    />
  );
}

class CadastroEventoConvenio extends Component {
  state = {
    anchorElMenuEvento: null,
    eventos: [],
    convenios: [],
    conveniosEventos: [],
  }

  componentDidMount() {
    this.fetchEventos();
    this.fetchConvenios();
  }

  fetchEventos = async () => {
    const { notify, setFieldValue } = this.props;

    try {
      const eventos = await EventoService.getEventos();

      await this.setState({ eventos });
      if (eventos.length) {
        const [evento] = eventos;
        await setFieldValue('evento', evento.id);
        this.fetchConveniosEventos();
      }
    } catch (err) {
      notify('Erro ao buscar os eventos', { variant: 'error' });
    }
  }

  fetchConvenios = async () => {
    const { notify } = this.props;
    try {
      const convenios = await ConvenioService.getAll();

      this.setState({ convenios });
    } catch (err) {
      notify('Erro ao buscar lista de convênios', { variant: 'error' });
    }
  }

  fetchConveniosEventos = async () => {
    const { notify, values } = this.props;
    try {
      const conveniosEventos = await EventoService.getConveniosEventos(values.evento);

      this.setState({ conveniosEventos });
    } catch (err) {
      notify('Erro ao buscar códigos dos convênios', { variant: 'error' });
    }
  }

  onChangeSelectEvento = async ({ id }) => {
    const { setFieldValue } = this.props;

    await setFieldValue('evento', id);
    this.fetchConveniosEventos();
    this.setState({ anchorElMenuEvento: null });
  }

  handleDeleteEventoConvenio = (eventoConvenioId) => {
    const { conveniosEventos } = this.state;

    this.setState({
      conveniosEventos: conveniosEventos.filter(({ id }) => eventoConvenioId !== id),
    });
  }

  render() {
    const {
      classes,
      values,
      errors,
      handleChange,
      handleSubmit,
      setFieldValue,
      isSubmitting,
    } = this.props;
    const {
      anchorElMenuEvento,
      eventos,
      convenios,
      conveniosEventos,
    } = this.state;

    return (
      <Fragment>
        <Toolbar
          className={classes.toolbar}
        >
          {values.evento && (
            <div className={classes.rootSelectEvento}>
              <List
                disablePadding
              >
                <ListItem
                  button
                  dense
                  aria-haspopup="true"
                  aria-controls="evento-menu"
                  aria-label="Evento"
                  onClick={event => this.setState({ anchorElMenuEvento: event.currentTarget })}
                >
                  <ListItemText
                    primary={(
                      <Fragment>
                        <Typography
                          component="span"
                          className={classes.listItemTextPrimary}
                          color="textPrimary"
                        >
                          Evento
                          <strong className={classes.listItemTextSecondary}>
                            {` - ${eventos.find(evento => evento.id === values.evento).descricao}`}
                          </strong>
                        </Typography>
                      </Fragment>
                    )}
                  />
                  <ArrowDropDownIcon style={{ color: '#FFF' }} />
                </ListItem>
              </List>
              <Menu
                id="evento-menu"
                anchorEl={anchorElMenuEvento}
                open={Boolean(anchorElMenuEvento)}
                PaperProps={{
                  style: {
                    maxHeight: 300,
                  },
                }}
                onClose={() => this.setState({ anchorElMenuEvento: null })}
              >
                {eventos.map(evento => (
                  <MenuItem
                    key={evento.id}
                    selected={evento.id === values.evento}
                    onClick={() => this.onChangeSelectEvento(evento)}
                  >
                    {evento.descricao}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          )}
        </Toolbar>
        <Grid className={classes.container}>
          <Grid style={{ height: 'fit-content' }} container item spacing={1} direction="column" justify="center" alignItems="flex-start">
            <Paper className={classes.paper} elevation={5}>
              <Grid container direction="column">
                <Grid item>
                  <Typography style={{ alignSelf: 'flex-start' }} component="p" variant="body2">
                    Preencha os campos abaixos para cadastrar ou alterar um evento.
                  </Typography>
                  <Form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item sm={12} md={8} lg={8}>
                        <TextField
                          error={!!errors.codigo}
                          name="codigo"
                          label="Código*"
                          type="text"
                          variant="outlined"
                          onChange={handleChange}
                          value={values.codigo}
                          fullWidth
                        />
                      </Grid>
                      <Grid item sm={12} md={4} lg={4}>
                        <ModalSelect
                          label="Convênio*"
                          error={!!errors.convenio}
                          placeholderFilter="Filtrar convênios..."
                          value={values.convenio}
                          options={convenios.map(({ id, nome }) => ({ id, label: nome }))}
                          onChange={value => setFieldValue('convenio', value)}
                          textfieldProps={{
                            variant: 'outlined',
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12}>
                        <TextField
                          fullWidth
                          label="Valor*"
                          variant="outlined"
                          error={!!errors.valor}
                          value={values.valor}
                          onChange={({ target }) => setFieldValue('valor', target.value)}
                          InputProps={{
                            inputComponent: NumberFormatCustom,
                          }}
                        />
                      </Grid>
                      <Grid item sm={12} md={12} lg={12}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Salvar
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                </Grid>
              </Grid>
            </Paper>
            <Paper className={classes.paper} elevation={5}>
              <ListaEventosConvenios
                eventoId={Number(values.evento)}
                onDeleteConvenioEvento={this.handleDeleteEventoConvenio}
                conveniosEventos={conveniosEventos}
              />
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(Material),
  withFormik({
    mapPropsToValues: () => ({
      convenio: '',
      evento: '',
      codigo: '',
      valor: '',
    }),
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      convenio: Yup.number().required('Campo obrigatório'),
      evento: Yup.number().required('Campo obrigatório'),
      codigo: Yup.string().required('Campo obrigatório'),
      valor: Yup.number().required('Campo obrigatório'),
    }),
    handleSubmit: async (values, { resetForm, setSubmitting, props }) => {
      try {
        await EventoService.saveConvenioEvento({ ...values });
        props.notify('Salvo com sucesso', { variant: 'success' });
        resetForm({
          convenio: '', codigo: '', evento: values.evento, valor: '',
        });
      } catch (err) {
        if (err.response && err.response.data.mensagem) {
          props.notify(err.response.data.mensagem, { variant: 'error' });
        } else {
          props.notify('Erro ao salvar os dados', { variant: 'error' });
        }
        setSubmitting(false);
      }
    },
  }),
)(CadastroEventoConvenio);
