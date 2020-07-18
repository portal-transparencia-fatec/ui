
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-undef */
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import ApexCharts from 'apexcharts';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import LoadingIndicator from '../../../components/LoadingIndicator';
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
import { Container } from '../../../styles/global';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles } from '@material-ui/core/styles';
import { rootURL as baseURL } from '../../../services/api';
import { Material } from './styles';
import axios from 'axios';

const Copyright = () => {
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

class Login extends Component {
  state = {
    loading: false,
    email: '',
    senha: '',
  }
  
  componentDidMount() {

  }

  handleChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value })
  }

  handleSubmit = async () =>  {
    const { email, senha } = this.state;
    const { notify, history } = this.props;
      
    try {
      this.setState({ loading: true })
      const { data: { accessToken } } = await axios.post(`${baseURL}/login`, {
        email, senha
      })


      localStorage.setItem('@:accessToken', accessToken);
      localStorage.setItem('@:userInfo', email);

      history.push('/app/servidores')
    } catch (err) {
      notify('Login ou senha inválidos', { variant: 'warning' });
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    const { classes } = this.props;
    const { loading, email, senha } = this.state;
    
    return (
      <Grid>
        <LoadingIndicator loading={loading} />
        <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar a Sessão
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={this.handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type="password"
              id="senha"
              autoComplete="current-password"
              onChange={this.handleChange}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Lembre-me"
            />
            <Button
              disabled={loading}
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={this.handleSubmit}
            >
              Entrar
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="http://219f8c57ffa1.ngrok.io/app/recuperacao" variant="body2">
                  Esqueceu sua senha?
                </Link>
              </Grid>
              <Grid item>
                <Link href="http://219f8c57ffa1.ngrok.io/app/cadastro" variant="body2">
                  {"Você não tem uma conta? Se inscreva!"}
                </Link>
              </Grid>
            </Grid>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
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
  withStyles(Material, { withTheme: true }),
)(Login)