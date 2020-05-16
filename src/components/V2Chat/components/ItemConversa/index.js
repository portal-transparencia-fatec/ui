import React, { Component } from 'react';
import classnames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import ChatActions from '../../../../store/ducks/chat';

import Material, { ContagemMensagens } from './styles';

class ItemConversa extends Component {
  getSubtitle = (conversa) => {
    const [mensagem] = conversa.mensagens;
    const tamanhoLimite = 40;
    const mensagemPadrao = 'Envie sua primeira mensagem...';

    if (!mensagem) {
      return mensagemPadrao;
    }

    if (mensagem.texto.length > tamanhoLimite) {
      return `${mensagem.texto.substr(0, 37)}...`;
    }

    return mensagem.texto;
  }

  /**
   * Retorna o número de mensagens pendentes
   */
  getCountMensagensPendentes = (conversa) => {
    const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));
    const mensagensPendentes = (conversa.mensagens
      .filter(({ visualizadaEm, remetente }) => (!visualizadaEm
          && usuario.id !== remetente.id))) || [];

    return mensagensPendentes.length;
  }

  render() {
    const { classes, conversa, openCurrentChat } = this.props;

    const mensagensPendentesCount = this.getCountMensagensPendentes(conversa);


    return (
      <>
        <ListItem
          className={classes.listItem}
          button
          divider
          onClick={() => openCurrentChat(conversa.id)}
        >
          <ListItemText
            style={{ flex: 1 }}
            primary={(
              <Typography className={classes.tituloConversa} color="textPrimary">
                {conversa.titulo}
              </Typography>
            )}
            secondary={(
              <Typography
                className={classnames(
                  classes.subtituloConversa,
                  { [classes.negrito]: !!mensagensPendentesCount },
                )}
                component="p"
                color="textSecondary"
              >
                {this.getSubtitle(conversa)}
              </Typography>
            )}
          />
          {!!mensagensPendentesCount && (
            <ContagemMensagens>
              {mensagensPendentesCount > 100 ? '99+' : mensagensPendentesCount}
            </ContagemMensagens>
          )}
        </ListItem>
      </>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  openCurrentChat: conversaId => dispatch(ChatActions.openCurrentChat(conversaId)),
});

export default compose(
  withStyles(Material),
  connect(null, mapDispatchToProps),
)(ItemConversa);


withStyles(Material)(ItemConversa);
