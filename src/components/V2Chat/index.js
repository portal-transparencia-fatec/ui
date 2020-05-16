import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import SwipeableViews from 'react-swipeable-views';

import withStyles from '@material-ui/core/styles/withStyles';
import Zoom from '@material-ui/core/Zoom';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';


import CloseIcon from '@material-ui/icons/Close';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import ListaUsuarios from './components/ListaUsuarios';
import ListaConversas from './components/ListaConversas';
import Chat from './components/Chat';

import ChatActions from '../../store/ducks/chat';

import Material from './styles';

class V2Chat extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    connectChat: PropTypes.func.isRequired,
  }

  state = {
    tabIndex: 0,
  }

  componentDidMount() {
    this.connect();
  }

  componentDidUpdate(prevProps) {
    const { isConnected, loadData } = this.props;

    /**
     * Recarrega os dados do chat caso o status
     * da conexão WS reestabeleça
     */
    if (prevProps.isConnected !== isConnected && isConnected) {
      loadData();
    }
  }

  /**
   * Estabelece a conexão WS através do redux/redux-saga
   */
  connect = () => {
    const { connectChat } = this.props;
    connectChat();
  }

  /**
   * Disconecta o WS
   */
  disconnect = () => {
    const { disconnectChat } = this.props;
    disconnectChat();
  }

  onChangeTabs = (event, tabIndex) => {
    this.setState({ tabIndex });
  }

  onChangeSwipeable = (tabIndex) => {
    this.setState({ tabIndex });
  }

  /**
   * Renderiza a tela de conversa
   */
  renderChatScreen = () => {
    const {
      classes,
      onClose,
      currentChat: conversa,
      closeCurrentChat,
    } = this.props;
    return (
      <>
        <AppBar position="static" color="primary">
          <Toolbar className={classes.toolbar} disableGutters>
            <IconButton
              onClick={() => closeCurrentChat()}
            >
              <ArrowBackIcon className={classes.icons} />
            </IconButton>
            <Typography className={classes.titleChatToolbar} component="span" color="textPrimary">
              {conversa.titulo}
            </Typography>
            <IconButton
              onClick={onClose}
            >
              <CloseIcon className={classes.icons} />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Chat conversaId={conversa.id} />
      </>
    );
  }

  /**
   * Renderiza a tela inicial do chat
   */
  renderInitialScreen = () => {
    const {
      classes,
      theme,
      onClose,
      usuarios,
      conversas,
    } = this.props;
    const { tabIndex } = this.state;

    return (
      <>
        <AppBar position="static" color="primary">
          <Toolbar className={classes.toolbar} disableGutters>
            <IconButton
              onClick={onClose}
            >
              <CloseIcon className={classes.icons} />
            </IconButton>
          </Toolbar>
          <Tabs
            value={tabIndex}
            onChange={this.onChangeTabs}
            variant="scrollable"
            scrollButtons="on"
          >
            <Tab label="Conversas" />
            <Tab label="Usuários" />
            <Tab label="Suporte" />
          </Tabs>
        </AppBar>
        <div className={classes.content}>
          <SwipeableViews
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
            }}
            containerStyle={{
              display: 'flex',
              flex: 1,
            }}
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={tabIndex}
            onChangeIndex={this.onChangeSwipeable}
          >
            <ListaConversas conversas={conversas} />
            <ListaUsuarios usuarios={usuarios.empresa} />
            <ListaUsuarios usuarios={usuarios.suporte} />
          </SwipeableViews>
        </div>
      </>
    );
  }

  render() {
    const {
      classes,
      open,
      onClose,
      isConnected,
      currentChat,
    } = this.props;

    let ContentComponent;

    /**
     * Mostra uma tela de erro caso o
     * usuário não esteja conectado
     */
    if (!isConnected) {
      return open ? (
        <div className={classes.root}>
          <Zoom in={open}>
            <Paper elevation={4} className={classes.paper}>
              <AppBar position="static" color="primary">
                <Toolbar className={classes.toolbar} disableGutters>
                  <IconButton
                    onClick={onClose}
                  >
                    <CloseIcon className={classes.icons} />
                  </IconButton>
                </Toolbar>
              </AppBar>
              <div className={classes.content}>
                <span>Houve um problema...</span>
              </div>
            </Paper>
          </Zoom>
        </div>
      ) : null;
    }

    /**
     * Verifica se foi selecionado uma conversa
     * para renderizar o componente de Chat
     */
    if (!currentChat) {
      ContentComponent = this.renderInitialScreen();
    } else {
      ContentComponent = this.renderChatScreen();
    }

    return open ? (
      <div className={classes.root}>
        <Zoom in={open}>
          <Paper elevation={4} className={classes.paper}>
            {ContentComponent}
          </Paper>
        </Zoom>
      </div>
    ) : null;
  }
}

const mapStateToProps = ({
  chat: {
    isConnected, connecting, conversas, usuarios,
  },
}) => {
  /**
   * Carrega a conversa atual selecionada
   */
  const currentChat = conversas.find(conversa => conversa.current);
  return {
    isConnected,
    connecting,
    conversas,
    usuarios,
    currentChat,
  };
};

const mapDispatchToProps = dispatch => ({
  connectChat: () => dispatch(ChatActions.connect()),
  loadData: () => dispatch(ChatActions.loadData()),
  closeCurrentChat: () => dispatch(ChatActions.closeCurrentChat()),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Material, { withTheme: true }),
)(V2Chat);
