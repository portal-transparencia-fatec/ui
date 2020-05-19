/* eslint-disable no-undef */
import React, { Component, Suspense } from 'react';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Switch, Link } from 'react-router-dom';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import ErrorIcon from '@material-ui/icons/Error';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HomeIcon from '@material-ui/icons/Home';
import ChatIcon from '@material-ui/icons/Chat';
import KatsukaiService from '../../services/api';
import MenuNavigation from '../../components/MenuNavigation';
import CustomRoute from '../../routes/CustomRoute';
import UsuarioActions from '../../store/ducks/usuario';
import ChatActions from '../../store/ducks/chat';
import { Material } from './styles';
import logoBranco from '../../assets/images/logo-branco.png';
import Loading from './Loading';
import Home from './Home';
import LoadingIndicator from '../../components/LoadingIndicator';


import Servidores from './Servidores';

class Application extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      open: true,
      hasError: false,
      loading: false, 
    }
  }

  handleDrawerOpen = () => {
    const { setMenu } = this.props;

    this.setState({ open: true });
    setMenu(true)
  };

  handleDrawerClose = () => {
    const { setMenu } = this.props;
    this.setState({ open: false });
    setMenu(false)
  };
  
  handleClickAnimeMenu = (event) => {
    this.setState({ editarAnchorEl: event.currentTarget });
  }

  handleCloseAnimeMenu = () => {
    this.setState({ editarAnchorEl: null });
  }

  handleChangeSearchAnime = (event) => {
    event.persist();
    this.setState({ searchAnime: event.target.value, event });
  }
  
  fetchSearchAnime = async (event) => {
    const { notify } = this.state;
    try {
      if (event.target.value) {
        this.setState({ loading: true })
        const animes = await KatsukaiService.getAnimes(event.target.value)
        this.setState({ animes })
        this.handleClickAnimeMenu(event)
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    const {
      classes,
      theme,
      match,
      routerTitle,
    } = this.props;

    const { editarAnchorEl, open, hasError, animes, loading } = this.state;

    return (
      <div className={classes.root}>
        <LoadingIndicator loading={loading} />
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar className={classes.toolbar} disableGutters={!open}>
            <IconButton
              color="inherit"
              aria-label="Abrir"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, {
                [classes.hide]: open,
              })}
            >
              <MenuIcon />
            </IconButton>
            {open ? null : <img className={classes.logoTitle} src={logoBranco} alt="V2Saude White" />}
            <Typography className={classes.grow} variant="h6" color="inherit" noWrap>
              {routerTitle}
            </Typography>

            <IconButton component={Link} to="/app">
              <HomeIcon className={classes.barIcons} />
            </IconButton> 
            <Typography component="p" variant="inherit" style={{ visibility: 'hidden' }} />
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={classNames(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: classNames({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
          open={open}
        >
          <div className={classes.toolbar}>
            <div className={classes.toolbarLogo} />
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <Divider />
          <MenuNavigation isOpen={open} />
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Suspense fallback={<Loading />}>
            <Switch>
              <CustomRoute
                exact
                path={`${match.path}/`}
                routeTitle="Início"
                component={Home}
                isMenuOpen={open}
              />
              <CustomRoute
                exact
                path={`${match.path}/servidores`}
                routeTitle="Servidores"
                component={Servidores}
                isMenuOpen={open}
              />
            </Switch>
          </Suspense>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    routerTitle: state.appConfig.router.title || 'Dashboard',
  };
};

const mapDispatchToProps = dispatch => ({
  setMenu: visibility => dispatch(UsuarioActions.setMenu(visibility)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(Material, { withTheme: true })(Application));
