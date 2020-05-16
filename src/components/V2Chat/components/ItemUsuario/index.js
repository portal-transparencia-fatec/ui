import React, { Component } from 'react';
import classnames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import ChatActions from '../../../../store/ducks/chat';

import Material from './styles';

class ItemUsuario extends Component {
  getAvatarLetter = (usuario) => {
    const { nome } = usuario;

    return String(nome).substr(0, 2).toUpperCase();
  }

  render() {
    const { classes, usuario, openCurrentChat } = this.props;

    return (
      <ListItem
        button
        divider
        onClick={() => openCurrentChat(usuario.conversaPrivada.id)}
      >
        <ListItemAvatar>
          <Avatar className={classnames({ [classes.avatar]: !!usuario.conectado })}>
            {this.getAvatarLetter(usuario)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={(
            <Typography className={classes.tituloUsuario} color="textPrimary">
              {usuario.nome}
            </Typography>
          )}
          secondary={(
            <Typography component="span" className={classes.subtituloUsuario} color="textSecondary">
              {usuario.conectado ? 'online' : 'offline'}
            </Typography>
          )}
        />
      </ListItem>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  openCurrentChat: conversaId => dispatch(ChatActions.openCurrentChat(conversaId)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(Material),
)(ItemUsuario);
