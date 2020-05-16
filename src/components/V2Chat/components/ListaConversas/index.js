import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import List from '@material-ui/core/List';

import ItemConversa from '../ItemConversa';

import Material from './styles';

class ListaConversas extends Component {
  ordenarUltimaAtualizacao = (prev, next) => {
    const [prevUltimaMensagem] = prev.mensagens;
    const [nextUltimaMensagem] = next.mensagens;

    if (!prevUltimaMensagem || !nextUltimaMensagem) return 0;

    if (prevUltimaMensagem.criadaEm < nextUltimaMensagem.criadaEm) {
      return 1;
    }

    if (prevUltimaMensagem.criadaEm > nextUltimaMensagem.criadaEm) {
      return -1;
    }

    return 0;
  }

  filterConversas = (conversa) => {
    const comMensagens = Boolean(conversa.mensagens.length);

    return comMensagens;
  }

  render() {
    const { conversas } = this.props;
    const conversasOrdenadas = [...conversas].filter(this.filterConversas);
    conversasOrdenadas.sort(this.ordenarUltimaAtualizacao);

    return (
      <List>
        {conversasOrdenadas.map(conversa => (
          <ItemConversa key={conversa.id} conversa={conversa} />
        ))}
      </List>
    );
  }
}

export default withStyles(Material)(ListaConversas);
