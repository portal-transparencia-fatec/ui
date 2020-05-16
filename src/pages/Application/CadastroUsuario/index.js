// /* eslint-disable func-names */
// /* eslint-disable array-callback-return */
// /* eslint-disable no-param-reassign */
// import React, { Component, Fragment } from 'react';
// import { compose } from 'redux';
// import { connect } from 'react-redux';
// import { withFormik, form } from 'formik';
// import * as Yup from 'yup';

// import withStyles from '@material-ui/core/styles/withStyles';
// import Grid from '@material-ui/core/Grid';
// import Typography from '@material-ui/core/Typography';
// import Paper from '@material-ui/core/Paper';
// import TextField from '@material-ui/core/TextField';
// import Button from '@material-ui/core/Button';
// import Switch from '@material-ui/core/Switch';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import CircularProgress from '@material-ui/core/CircularProgress';

// import ModalSelect from '../../../components/ModalSelect';
// import { numberValidator } from '../../../libs/utils';
// import ListaUsuarios from './components/ListaUsuarios';
// import NotificationActions from '../../../store/ducks/notifier';
// import UsuarioActions from '../../../store/ducks/usuario';
// import UsuarioService from '../../../services/Usuario';
// import EstadoService from '../../../services/Estado';
// import PermissaoService from '../../../services/Permissao';
// import NotificacaoService from '../../../services/Notificacao';
// import EmpresaUnidadeService from '../../../services/EmpresaUnidade';
// // import ProdoctorService from '../../../services/Prodoctor';

// import { Material } from './styles';

// class CadastroUsuario extends Component {
//   state = {
//     estados: [],
//     permissoes: [],
//     notificacoes: [],
//     unidades: [],
//     // usuariosProdoctor: [],
//   }

//   componentDidMount = async () => {
//     this.fetchEstados();
//     await this.fetchPermissoesSistema();
//     await this.fetchNotificacoesSistema();
//     this.fetchUnidades();
//     this.fetchUsuario();
//   }

//   componentDidUpdate(prevProps) {
//     const { match, resetForm/* , values */ } = this.props;
//     if (match.params.userId && (prevProps.match.params.userId !== match.params.userId)) {
//       resetForm();
//       this.fetchUsuario();
//     }
//   }

//   fetchPermissoesSistema = async () => {
//     const permissoes = await PermissaoService.getAll();
//     this.setState({ permissoes });
//   }

//   fetchNotificacoesSistema = async () => {
//     const notificacoes = await NotificacaoService.getAll();
//     this.setState({ notificacoes });
//   }

//   fetchEstados = async () => {
//     const estados = await EstadoService.all();

//     this.setState({ estados });
//   }

//   fetchUnidades = async () => {
//     const unidades = await EmpresaUnidadeService.getAll();

//     this.setState({ unidades });
//   }

//   isExistedUser = () => {
//     const { match: { params } } = this.props;
//     return params.userId && !!Number(params.userId);
//   }

//   unidadePossuiProdoctor = () => {
//     const { values } = this.props;
//     const { unidades } = this.state;

//     return unidades
//       .find(({ id, possuiProdoctor }) => (values.unidades.some(unidadeId => id === unidadeId))
//       && possuiProdoctor);
//   }

//   fetchUsuario = async () => {
//     const { match: { params }, history, setFieldValue } = this.props;
//     const { permissoes, notificacoes } = this.state;
//     const payloadPermissoes = [];
//     const payloadNotificacoes = [];
//     if (this.isExistedUser()) {
//       try {
//         const usuario = await UsuarioService.getById(params.userId);

//         usuario.permissoes.filter(({ id }) => {
//           permissoes.map((item) => {
//             if (id === item.id) {
//               payloadPermissoes.push(item);
//             }
//           });
//         });

//         usuario.permissoes.filter(({ id }) => {
//           notificacoes.map((item) => {
//             if (id === item.id) {
//               payloadNotificacoes.push(item);
//             }
//           });
//         });

//         setFieldValue('ativo', usuario.ativo);
//         setFieldValue('nome', usuario.nome);
//         setFieldValue('email', usuario.email);
//         setFieldValue('permissoes', payloadPermissoes.map(permissao => permissao.id));
//         setFieldValue('notificacoes', payloadNotificacoes.map(notificaco => notificaco.id));
//         setFieldValue('unidades', usuario.unidades.map(({ unidade }) => unidade.id));
//         setFieldValue('medico', usuario.medico);
//         setFieldValue('registroProfNumero', usuario.registroProfNumero);
//         setFieldValue('registroProfConselho', usuario.registroProfConselho);
//         setFieldValue('registroProfUf', usuario.registroProfUf);
//       } catch {
//         history.replace('/app/usuarios');
//       }
//     }
//   }

//   render() {
//     const {
//       permissoes, unidades, notificacoes, estados,
//     } = this.state;
//     const {
//       classes,
//       values,
//       errors,
//       handleChange,
//       handleBlur,
//       handleSubmit,
//       isSubmitting,
//       setFieldValue,
//       history,
//       resetForm,
//       match: { params: { userId } },
//     } = this.props;
//     const unidadePossuiProdoctor = this.unidadePossuiProdoctor();

//     return (
//       <Grid container>
//         <Grid item sm={12} md={12} lg={12}>
//           <Paper className={classes.paper} elevation={5}>
//             <form
//               autoComplete="off"
//               onSubmit={handleSubmit}
//             >
//               {/* <Typography className={classes.textInfo} component="p" color="textPrimary">
//                   Se a unidade constar no Prodoctor, selecione o usuário do Prodoctor para
//                   &nbsp;vincular com o cadastro no sistema
//               </Typography> */}
//               <Typography className={classes.textInfo} component="p" color="textPrimary">
//                   Insira o código referente ao usuário para vincular com o cadastro no sistema
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid
//                   item
//                   sm={12}
//                   md={unidadePossuiProdoctor ? 6 : 12}
//                   lg={unidadePossuiProdoctor ? 6 : 12}
//                 >
//                   <ModalSelect
//                     id="select-unidades"
//                     label="Unidades*"
//                     multiple
//                     empty="Carregando..."
//                     error={!!errors.unidades}
//                     value={values.unidades}
//                     options={unidades.map(perm => ({ id: perm.id, label: perm.nome }))}
//                     onChange={value => setFieldValue('unidades', value)}
//                     textfieldProps={{
//                       variant: 'outlined',
//                       fullWidth: true,
//                     }}
//                   />
//                 </Grid>
//                 {unidadePossuiProdoctor && (
//                   <Grid item sm={12} md={6} lg={6}>
//                     {/* <ModalSelect
//                       id="select-usuariosProdoctor"
//                       label="Usuários Prodoctor*"
//                       empty="Carregando..."
//                       error={!!errors.codigoLegado}
//                       value={values.codigoLegado}
//                       options={usuariosProdoctor.map(({ codigo, nome }) => ({
//                         id: codigo, label: nome,
//                       }))}
//                       onChange={value => setFieldValue('codigoLegado', value)}
//                       textfieldProps={{
//                         variant: 'outlined',
//                         fullWidth: true,
//                       }}
//                     /> */}
//                     <TextField
//                       name="codigoLegado"
//                       label="Código de Integração"
//                       placeholder="Código do usuário. Ex: 45"
//                       value={values.codigoLegado}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       variant="outlined"
//                       type="number"
//                       fullWidth
//                     />
//                   </Grid>
//                 )}
//               </Grid>
//               <Typography className={classes.textInfo} component="p" color="textPrimary">
//                   Preencha os campos abaixos para cadastrar ou alterar um usuário.
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item sm={12} md={12} lg={12}>
//                   <TextField
//                     error={!!errors.nome}
//                     name="nome"
//                     label="Nome*"
//                     value={values.nome}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     variant="outlined"
//                     type="text"
//                     fullWidth
//                   />
//                 </Grid>
//                 <Grid item sm={12} md={6} lg={12}>
//                   <TextField
//                     error={!!errors.email}
//                     name="email"
//                     label="E-mail*"
//                     value={values.email}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     variant="outlined"
//                     type="email"
//                     fullWidth
//                     InputProps={{
//                       readOnly: !!userId,
//                     }}
//                   />
//                 </Grid>
//                 <Grid item sm={12} md={3} lg={userId ? 12 : 6}>
//                   <TextField
//                     error={!!errors.novaSenha}
//                     name="novaSenha"
//                     label={userId ? 'Nova senha' : 'Senha*'}
//                     value={values.novaSenha}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     variant="outlined"
//                     type="password"
//                     fullWidth
//                   />
//                 </Grid>
//                 {!this.isExistedUser() && (
//                 <Fragment>
//                   <Grid item sm={12} md={3} lg={6}>
//                     <TextField
//                       error={!!errors.confirmarSenha}
//                       name="confirmarSenha"
//                       label="Confirmar senha*"
//                       value={values.confirmarSenha}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       variant="outlined"
//                       type="password"
//                       fullWidth
//                     />
//                   </Grid>
//                 </Fragment>
//                 )}
//                 <Grid item sm={12} md={8} lg={4}>
//                   <ModalSelect
//                     id="select-permissoes"
//                     label="Permissões*"
//                     multiple
//                     empty="Carregando..."
//                     error={!!errors.permissoes}
//                     value={values.permissoes}
//                     options={permissoes.map(perm => ({
//                       id: perm.id,
//                       label: perm.descricao,
//                       // subLabel: perm.nome,
//                     }))}
//                     onChange={value => setFieldValue('permissoes', value)}
//                     textfieldProps={{
//                       variant: 'outlined',
//                       fullWidth: true,
//                     }}
//                   />
//                 </Grid>
//                 <Grid item sm={12} md={8} lg={4}>
//                   <ModalSelect
//                     id="select-notificacoes"
//                     label="Notificações"
//                     multiple
//                     empty="Carregando..."
//                     error={!!errors.notificacoes}
//                     value={values.notificacoes}
//                     options={notificacoes.map(item => ({
//                       id: item.id,
//                       label: item.descricao,
//                     }))}
//                     onChange={value => setFieldValue('notificacoes', value)}
//                     textfieldProps={{
//                       variant: 'outlined',
//                       fullWidth: true,
//                     }}
//                   />
//                 </Grid>
//                 <Grid item sm={12} md={2} lg={2}>
//                   <FormGroup row>
//                     <FormControlLabel
//                       control={(
//                         <Switch
//                           checked={values.ativo}
//                           name="ativo"
//                           onChange={handleChange}
//                           color="primary"
//                           value="bool"
//                         />
//                       )}
//                       label={values.ativo ? 'Usuário ativo' : 'Usuário inativo'}
//                     />
//                   </FormGroup>
//                 </Grid>
//                 <Grid item sm={12} md={2} lg={2}>
//                   <FormGroup row>
//                     <FormControlLabel
//                       control={(
//                         <Switch
//                           checked={values.medico}
//                           name="medico"
//                           onChange={handleChange}
//                           color="primary"
//                           value="bool"
//                         />
//                       )}
//                       label="Médico?"
//                     />
//                   </FormGroup>
//                 </Grid>
//                 {!!values.medico && (
//                   <>
//                     <Grid item sm={12} md={4} lg={4}>
//                       <TextField
//                         id="registroProfNumero"
//                         name="registroProfNumero"
//                         error={!!errors.registroProfNumero}
//                         label="Registro Profissional Nº*"
//                         value={values.registroProfNumero}
//                         onChange={(event) => {
//                           if (numberValidator(event.target.value)) {
//                             handleChange(event);
//                           }
//                         }}
//                         onBlur={handleBlur}
//                         variant="outlined"
//                         fullWidth
//                         type="text"
//                       />
//                     </Grid>
//                     <Grid item sm={12} md={4} lg={4}>
//                       <TextField
//                         id="registroProfConselho"
//                         name="registroProfConselho"
//                         error={!!errors.registroProfConselho}
//                         label="Registro Profissional Conselho*"
//                         value={values.registroProfConselho}
//                         onChange={handleChange}
//                         onBlur={handleBlur}
//                         variant="outlined"
//                         fullWidth
//                         type="text"
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4} md={4} lg={4}>
//                       <ModalSelect
//                         label="Registro Profissional UF*"
//                         error={!!errors.registroProfUf}
//                         empty="Carregando..."
//                         placeholderFilter="Filtrar estados..."
//                         value={values.registroProfUf}
//                         options={estados.map(estado => ({ id: estado.uf, label: estado.uf }))}
//                         onChange={value => setFieldValue('registroProfUf', value)}
//                         textfieldProps={{
//                           variant: 'outlined',
//                           fullWidth: true,
//                           className: classes.textfield,
//                         }}
//                       />
//                     </Grid>
//                   </>
//                 )}
//                 {this.isExistedUser() && (
//                   <Grid item sm={12} md={12} lg={12}>
//                     <Button
//                       onClick={() => {
//                         resetForm();
//                         history.replace('/app/usuarios');
//                       }}
//                       fullWidth
//                       size="medium"
//                       color="default"
//                       type="button"
//                     >
//                       Cancelar edição
//                     </Button>
//                   </Grid>
//                 )}
//                 <Grid item sm={12} md={12} lg={12}>
//                   <Button
//                     onClick={handleSubmit}
//                     disabled={isSubmitting}
//                     fullWidth
//                     variant="contained"
//                     size="medium"
//                     color="secondary"
//                     type="submit"
//                   >
//                     {isSubmitting ? <CircularProgress size={32} color="primary" /> : 'Salvar'}
//                   </Button>
//                 </Grid>
//               </Grid>
//             </form>
//           </Paper>
//         </Grid>

//         <Grid item sm={12} md={12} lg={12}>
//           <Paper className={classes.paper} elevation={5}>
//             <ListaUsuarios />
//           </Paper>
//         </Grid>
//       </Grid>
//     );
//   }
// }

// const mapDispatchToProps = dispatch => ({
//   notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
//   setUsuario: (usuario, index) => dispatch(UsuarioActions.setUsuario(usuario, index)),
// });

// export default compose(
//   connect(null, mapDispatchToProps),
//   withStyles(Material),
//   withFormik({
//     displayName: 'CadastroUsuario',
//     validateOnChange: false,
//     validateOnBlur: false,
//     mapPropsToValues: () => ({
//       nome: '',
//       email: '',
//       novaSenha: '',
//       confirmarSenha: '',
//       permissoes: [],
//       notificacoes: [],
//       unidades: [],
//       medico: false,
//       ativo: true,
//       codigoLegado: '',
//       registroProfNumero: '',
//       registroProfConselho: '',
//       registroProfUf: '',
//     }),
//     validationSchema: props => Yup.object().shape({
//       ativo: Yup.boolean().required('Campo obrigatório'),
//       nome: Yup.string().required('Campo obrigatório'),
//       email: Yup.string()
//         .required('Campo obrigatório')
//         .email('E-mail inválido'),
//       ...(!(props.match.params.userId && !!Number(props.match.params.userId))
//         ? {
//           novaSenha: Yup.string()
//             .required('Campo obrigatório')
//             .min(3, 'Mínimo 3 caracteres'),
//           confirmarSenha: Yup.string()
//             .required('Campo obrigatório')
//             .min(3, 'Mínimo 3 caracteres')
//             .oneOf([Yup.ref('novaSenha'), null], 'Senhas não conferem'),
//         } : {}),
//       medico: Yup.boolean().required('Campo obrigatório'),
//       permissoes: Yup.array()
//         .required('Campo obrigatório')
//         .min(1, 'Mínimo de 1 permissão'),
//       notificacoes: Yup.array(),
//       unidades: Yup.array()
//         .required('Campo obrigatório')
//         .min(1, 'Mínimo de 1 unidade'),
//       codigoLegado: Yup.number().nullable(),
//       registroProfNumero: Yup.string().nullable()
//         .test(
//           'is-registroProfNumero',
//           'Formato inválido',
//           function (value) {
//             if (this.parent.medico) {
//               if (typeof value === 'undefined') {
//                 return false;
//               }
//             }
//             return true;
//           },
//         ),
//       registroProfConselho: Yup.string().nullable()
//         .test(
//           'is-registroProfConselho',
//           'Formato inválido',
//           function (value) {
//             if (this.parent.medico) {
//               if (typeof value === 'undefined') {
//                 return false;
//               }
//             }
//             return true;
//           },
//         ),
//       registroProfUf: Yup.string().nullable()
//         .test(
//           'is-registroProfUf',
//           'Formato inválido',
//           function (value) {
//             if (this.parent.medico) {
//               if (typeof value === 'undefined') {
//                 return false;
//               }
//             }
//             return true;
//           },
//         ),

//     }),
//     handleSubmit: async (values, { props, setSubmitting, resetForm }) => {
//       values = { ...values };
//       values.permissoes = [...values.permissoes, ...values.notificacoes];
//       const { userId } = props.match.params;
//       const isEdit = userId && !!Number(userId);
//       const userForm = {
//         ...values,
//         id: isEdit ? Number(userId) : undefined,
//       };
//       try {
//         const usuario = await UsuarioService.save(userForm);
//         props.notify('Cadastro salvo com sucesso', { variant: 'success' });
//         const [url] = props.match.path.split('/:userId');
//         resetForm();
//         props.history.replace(`${url}`);
//         props.setUsuario(usuario);
//       } catch (err) {
//         if (err && err.response) {
//           props.notify(err.response.data, { variant: 'warning' });
//         } else {
//           props.notify('Houve um problema ao salvar', { variant: 'error' });
//         }
//         setSubmitting(false);
//       }
//     },
//   }),
// )(CadastroUsuario);


/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/no-unescaped-entities */
import React, { Component, Fragment } from 'react';
import ApexCharts from 'apexcharts';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import {
  RootRef,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import moment from 'moment';
import {
  telFormatter,
  celFormatter,
} from '../../../libs/utils';

import NotificationActions from '../../../store/ducks/notifier';
import Material from './styles';
import { Container } from '../../../styles/global';
import DashboardService from '../../../services/Dashboard';

class Home extends Component {
  render() {
    const { classes, isMenuOpen } = this.props;

    return (
      <Grid>
        <Grid container sm={12} lg={12} md={12} direction="row" wrap="wrap">
          <Grid container direction="row" sm={12} md={12} lg={isMenuOpen ? 3 : 2} style={{  border: '10px solid #000', height: '46vh', overflow: 'hidden', backgroundColor: '#212121', borderRadius: 15 }}>
            <Grid item sm={12} lg={12} md={12} style={{height: `calc(38vh - 20px)` }}>
              <div
                style={{
                  padding: 3,
                  zIndex: 99999,
                  position: 'absolute',
                  bottom: '31vw',
                  color: '#fff',
                  backgroundColor: 'rgba(28, 28, 28, 0.9)',
                  borderRadius: '2px',
                }}
              >
                24:00
              </div>
              <img 
                src="https://goyabu.com/capas/tamayomi-episodios.jpg"
                style={{
                  width: '100%', height: `calc(38vh - 20px)`, }}
              />
            </Grid>

            <Grid item sm={12} lg={12} md={12} style={{ height: '8.5vh' }}>
              <Grid item sm={12} lg={12} md={12} style={{ height: '4.5vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textTransform: 'uppercase', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap' }}>
                Shironeko Project: Z2222222222ero Chronicle
              </Grid>

              <Grid item sm={12} lg={12} md={12} style={{ height: '4vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#909090', whiteSpace: 'nowrap' }}>
                86 views &bull; 2 dias atrás
              </Grid>
            </Grid>
          </Grid>         
          
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isMenuOpen: state.user.isMenuOpen,
  };
};

// const mapDispatchToProps = dispatch => ({
//   notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
// });

export default compose(
  connect(mapStateToProps, null),
  withStyles(Material, { withTheme: true }),
)(Home);
