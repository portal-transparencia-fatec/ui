/* eslint-disable react/no-did-update-set-state */
/* eslint-disable consistent-return */
/* eslint-disable func-names */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withFormik, form } from 'formik';
import * as Yup from 'yup';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CircularProgress from '@material-ui/core/CircularProgress';

import ModalSelect from '../../../components/ModalSelect';
import { numberValidator } from '../../../libs/utils';
import ListaCondicoesPagamento from './components/ListaCondicoesPagamento';
import NotificationActions from '../../../store/ducks/notifier';
import UsuarioActions from '../../../store/ducks/usuario';
import FinanceiroService from '../../../services/Financeiro';
import { Material } from './styles';

class CadastroCondicoesPagamento extends Component {
  state = {
    condicoesPagamento: [],
    formaPagamentoOptions: {
      // DINHEIRO: 'DINHEIRO',
      CRÉDITO: 'CARTAO_CREDITO',
      // DÉBITO: 'CARTAO_DEBITO',
      CHEQUE: 'CHEQUE',
    },
    formaPagamento: [],
  }

  componentDidMount = async () => {
    const { formaPagamentoOptions } = this.state;

    const { match: { params: { condicaoId } }, resetForm } = this.props;
    if (condicaoId) {
      resetForm();
      this.fetchCondicaoPagamento(condicaoId);
    }

    await Promise.all(
      Object.keys(formaPagamentoOptions).map(async (option) => {
        await this.fetchCondicoesPagamento(option);
      }),
    );

    await this.fetchFormasPagamento();
  }

  async componentDidUpdate(prevProps) {
    const { formaPagamentoOptions } = this.state;
    const {
      match: { params: { condicaoId } }, resetForm, unidade, status,
    } = this.props;
    if (condicaoId && (prevProps.match.params.condicaoId !== condicaoId)) {
      resetForm();
      this.fetchCondicaoPagamento(condicaoId);
    }

    if ((unidade !== prevProps.unidade) || (status && status.updateCondicoesPagamento)) {
      resetForm();
      this.setState({ condicoesPagamento: [] });
      await Promise.all(
        Object.keys(formaPagamentoOptions).map(async (option) => {
          await this.fetchCondicoesPagamento(option);
        }),
      );

      await this.fetchFormasPagamento();
    }
  }

  fetchFormasPagamento = async () => {
    const { formaPagamentoOptions } = this.state;
    this.setState({ formaPagamento: Object.keys(formaPagamentoOptions).filter(key => key) });
  }

  handleComplete = async () => {
    const { formaPagamentoOptions } = this.state;

    this.setState({ condicoesPagamento: [] });
    await Promise.all(
      Object.keys(formaPagamentoOptions).map(async (option) => {
        await this.fetchCondicoesPagamento(option);
      }),
    );
  }

  fetchCondicoesPagamento = async (option) => {
    const { unidade, notify } = this.props;
    const { formaPagamentoOptions } = this.state;
    try {
      let data = await FinanceiroService.searchCondicaoPagamento({
        ativo: true,
        formaPagamento: formaPagamentoOptions[option],
        empresaUnidade: unidade.id,
      });

      data.map(async (condicaoPagamento) => {
        await this.setState({ condicoesPagamento: [...this.state.condicoesPagamento, condicaoPagamento] });
      });

      data = await FinanceiroService.searchCondicaoPagamento({
        ativo: false,
        formaPagamento: formaPagamentoOptions[option],
        empresaUnidade: unidade.id,
      });

      data.map(async (condicaoPagamento) => {
        await this.setState({ condicoesPagamento: [...this.state.condicoesPagamento, condicaoPagamento] });
      });
    } catch (err) {
      console.log(err);
      if (err && err.response) {
        notify(err.response.data, { variant: 'warning', autoHideDuration: 5000 });
      } else {
        notify('Não foi possível buscar as informações referentes à condição de pagamento.', { variant: 'error', autoHideDuration: 5000 });
      }
    }
  }

  fetchCondicaoPagamento = async (condicaoId) => {
    const { notify, setFieldValue } = this.props;
    try {
      let condicao = await FinanceiroService.searchByIdCondicaoPagamento(condicaoId);

      if (!condicao) {
        condicao = await FinanceiroService.searchByIdCondicaoPagamento(condicaoId);
      }

      if (condicao) {
        setFieldValue('ativo', condicao.ativo);
        setFieldValue('formaPagamento', condicao.formaPagamento);
        setFieldValue('descricao', condicao.descricao);
        setFieldValue('qtdParcelasDisponiveis', condicao.qtdParcelasDisponiveis);
        setFieldValue('juros', condicao.juros);
        setFieldValue('diasEntreParcelas', condicao.diasEntreParcelas);
        setFieldValue('id', condicao.id);
      }
    } catch (err) {
      notify('Não foi possível buscar as informações referentes à condição de pagamento.', { variant: 'error', autoHideDuration: 5000 });
    }
  }

  isExistedCondicao = () => {
    const { values: { id } } = this.props;
    return id;
  }

  render() {
    const {
      condicoesPagamento, formaPagamentoOptions,
    } = this.state;
    const {
      classes,
      values,
      errors,
      handleChange,
      handleBlur,
      handleSubmit,
      isSubmitting,
      setFieldValue,
      history,
      resetForm,
    } = this.props;

    return (
      <Grid container>
        <Grid item sm={12} md={12} lg={12}>
          <Paper className={classes.paper} elevation={5}>
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <Grid container spacing={2}>
                <Grid item sm={12} md={12} lg={12}>
                  <TextField
                    error={!!errors.descricao}
                    name="descricao"
                    label="Descrição*"
                    value={values.descricao}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    type="text"
                    fullWidth
                  />
                </Grid>

                <Grid item sm={12} md={3} lg={4}>
                  <ModalSelect
                    error={!!errors.formaPagamento}
                    label="Forma de Pagamento*"
                    empty="Lista de formas de pagamento vazia..."
                    value={values.formaPagamento}
                    options={Object.keys(formaPagamentoOptions).map(key => ({
                      id: formaPagamentoOptions[key],
                      label: key,
                    }))}
                    onChange={value => setFieldValue('formaPagamento', value)}
                    textfieldProps={{
                      fullWidth: true,
                    }}
                  />
                </Grid>

                <Grid item sm={12} md={3} lg={2}>
                  <TextField
                    error={!!errors.diasEntreParcelas}
                    name="diasEntreParcelas"
                    label="Qtd. Dias Entre Parcelas*"
                    value={values.diasEntreParcelas}
                    onChange={(event) => {
                      if (numberValidator(event.target.value)) {
                        handleChange(event);
                      }
                    }}
                    type="number"
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{ min: '1' }}
                  />
                </Grid>

                <Grid item sm={12} md={3} lg={2}>
                  <TextField
                    error={!!errors.qtdParcelasDisponiveis}
                    name="qtdParcelasDisponiveis"
                    label="Qtd. Parcelas Disponíveis*"
                    value={values.qtdParcelasDisponiveis}
                    onChange={(event) => {
                      if (numberValidator(event.target.value)) {
                        handleChange(event);
                      }
                    }}
                    type="number"
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{ min: '1' }}
                  />
                </Grid>

                <Grid item sm={12} md={3} lg={2}>
                  <TextField
                    error={!!errors.juros}
                    name="juros"
                    label="Juros em % *"
                    value={values.juros}
                    onChange={(event) => {
                      if (numberValidator(event.target.value)) {
                        handleChange(event);
                      }
                    }}
                    type="number"
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{ min: '0', max: '100' }}
                  />
                </Grid>

                <Grid item container sm={12} md={2} lg={2} justify="center" alignItems="center">
                  <FormGroup row>
                    <FormControlLabel
                      control={(
                        <Switch
                          error={!!errors.ativo}
                          checked={values.ativo}
                          name="ativo"
                          onChange={handleChange}
                          color="primary"
                          value="bool"
                        />
                      )}
                      label={values.ativo ? (
                        <>
                        CONDIÇÃO
                          <strong>&nbsp;ATIVA*</strong>
                        </>
                      ) : (
                        <>
                        CONDIÇÃO
                          <strong>&nbsp;INATIVA*</strong>
                        </>
                      )}
                    />
                  </FormGroup>
                </Grid>

                {this.isExistedCondicao() && (
                  <Grid item sm={12} md={12} lg={12}>
                    <Button
                      onClick={() => {
                        resetForm();
                        history.replace('/app/condicoes-pagamento');
                      }}
                      fullWidth
                      size="medium"
                      color="default"
                      type="button"
                    >
                      Cancelar edição
                    </Button>
                  </Grid>
                )}
                <Grid item sm={12} md={12} lg={12}>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    fullWidth
                    variant="contained"
                    size="medium"
                    color="secondary"
                    type="submit"
                  >
                    {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Salvar'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item sm={12} md={12} lg={12}>
          <Paper className={classes.paper} elevation={5}>
            <ListaCondicoesPagamento
              condicoesPagamento={condicoesPagamento}
              formaPagamentoOptions={formaPagamentoOptions}
              onComplete={this.handleComplete}
            />
          </Paper>
        </Grid>
      </Grid>
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
  setUsuario: (usuario, index) => dispatch(UsuarioActions.setUsuario(usuario, index)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Material),
  withFormik({
    displayName: 'CadastroCondicoesPagamento',
    validateOnChange: false,
    validateOnBlur: false,
    mapPropsToValues: () => ({
      id: undefined,
      ativo: true,
      descricao: '',
      formaPagamento: '',
      juros: 0,
      diasEntreParcelas: 1,
      qtdParcelasDisponiveis: 1,
      formaPagamentoOptions: {
        CRÉDITO: 'CARTAO_CREDITO',
        CHEQUE: 'CHEQUE',
      },
    }),
    validationSchema: props => Yup.object().shape({
      ativo: Yup.boolean().required('Campo obrigatório'),
      descricao: Yup.string().required('Campo obrigatório'),
      formaPagamento: Yup.string().required('Campo obrigatório'),
      juros: Yup.number().required('Campo obrigatório').min(0, 'Valor inválido').max(100, 'Valor inválido'),
      diasEntreParcelas: Yup.number().required('Campo obrigatório').min(1, 'Valor inválido'),
      qtdParcelasDisponiveis: Yup.number().required('Campo obrigatório').min(1, 'Valor inválido'),
    }),
    handleSubmit: async (values, { props, setSubmitting, setStatus }) => {
      try {
        await FinanceiroService.saveCondicaoPagamento({
          ...values,
          empresaUnidade: props.unidade.id,
        });
        props.notify('Condição de pagamento salva com sucesso', { variant: 'success' });
        const [url] = props.match.path.split('/:condicaoId');
        setStatus({ updateCondicoesPagamento: true });
        props.history.push(`${url}`);
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
)(CadastroCondicoesPagamento);
