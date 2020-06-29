import React, { Component } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import NotificationActions from '../../../store/ducks/notifier';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Material } from './styles';
import UsuariosService from '../../../services/Usuarios'

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Equipe J © '}
      <Link color="inherit" href="">
        Portal da Transparência
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


class Cadastro extends Component {

  state = {
    loading: false,
    email: '',
    senha: '',
    nome: '',
    sobrenome: '',
  }
  

  handleChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value })
  }

  handleSubmit = async () => {
    const { email, senha, nome, sobrenome } = this.state;
    const { notify, history } = this.props;

    try {
      if(email && senha && nome && sobrenome) {
        this.setState({ loading: true })
        await UsuariosService.salvar({
          email,
          senha,
          nome,
          sobrenome
        })
        notify('Usuário criado com sucesso!', { variant: 'success' })  
        history.push('/app/login')
      } else {
        notify('Preencha todos os campos!', { variant: 'warning' })
      }
    } catch (err) {
      notify('Ocorreu um erro tentar realizar o cadastro', { variant: 'error' })
    } finally {
      this.setState({ loading: false }) 
    }
  }

  render() {
    const { loading } = this.state;
    const { classes } = this.props
    
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Digite suas informações
          </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  name="nome"
                  variant="outlined"
                  required
                  fullWidth
                  id="nome"
                  label="Nome"
                  autoFocus
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="sobrenome"
                  label="Sobrenome"
                  name="sobrenome"
                  autoComplete="sobrenome"
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Endereço de Email"
                  name="email"
                  autoComplete="email"
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="senha"
                  label="Senha"
                  type="password"
                  id="password"
                  onChange={this.handleChange}
                  autoComplete="current-password"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="Eu aceito receber e-mails com notificações sobre novidades no site."
                />
              </Grid>
            </Grid>
            <Button
              disabled={loading}
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={this.handleSubmit}
            >
              Criar Conta
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="http://localhost:3000/app/login" variant="body2">
                  Você já tem uma conta? Clique para entrar.
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={5}>
          <Copyright />
        </Box>
      </Container>
    );
  } 
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(Material, { withTheme: true }),
)(Cadastro)