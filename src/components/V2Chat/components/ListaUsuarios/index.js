import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import List from '@material-ui/core/List';

import ItemUsuario from '../ItemUsuario';

import Material from './styles';

class ListaUsuarios extends Component {
  ordenarOnline = (prev, next) => {
    if (!prev.conectado && Boolean(next.conectado)) {
      return 1;
    }

    if (Boolean(prev.conectado) && !next.conectado) {
      return -1;
    }

    if (prev.nome > next.nome) {
      return 1;
    }

    if (prev.nome < next.nome) {
      return -1;
    }

    return 0;
  }

  render() {
    const { usuarios } = this.props;
    const usuariosOrdenados = [...usuarios];
    usuariosOrdenados.sort(this.ordenarOnline);

    return (
      <List>
        {usuariosOrdenados.map(usuario => (
          <ItemUsuario key={usuario.id} usuario={usuario} />
        ))}
      </List>
    );
  }
}

export default withStyles(Material)(ListaUsuarios);
