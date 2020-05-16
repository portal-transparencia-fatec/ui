import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import DoneIcon from '@material-ui/icons/Done';

import { connect } from 'react-redux';
import UsuarioActions from '../../../../../store/ducks/usuario';
import NotificationActions from '../../../../../store/ducks/notifier';
import UsuarioService from '../../../../../services/Usuario';

import Material from './styles';

class ListaUsuarios extends Component {
  state = {
    searchUsuario: '',
    usuarioSelecionado: null,
    editarAnchorEl: null,
  }

  handleClickUsuarioMenu = usuario => (event) => {
    this.setState({ editarAnchorEl: event.currentTarget, usuarioSelecionado: { ...usuario } });
  }

  handleCloseUsuarioMenu = () => {
    this.setState({ editarAnchorEl: null, usuarioSelecionado: null });
  }

  filterUsuarios = (usuario) => {
    const { searchUsuario } = this.state;

    if (!String(searchUsuario).trim()) return true;

    if (new RegExp(searchUsuario, 'ig').test(usuario.nome)) {
      return true;
    }

    if (new RegExp(searchUsuario, 'ig').test(usuario.email)) {
      return true;
    }

    return false;
  }

  handleChangeSearch = async (event) => {
    await this.setState(({ searchUsuario: event.target.value }));
  }

  handleToggleUsuarioStatus = (usuario, index) => async () => {
    const { notify, setUsuario } = this.props;

    try {
      const responseUsuario = await UsuarioService.atualizarStatus(usuario.id);

      setUsuario(responseUsuario, index);
    } catch (err) {
      notify('Não foi possível alterar o status', { variant: 'error' });
    }
  }

  render() {
    const { classes, usuarios } = this.props;
    const {
      usuarioSelecionado,
      searchUsuario,
      editarAnchorEl,
    } = this.state;
    const open = Boolean(editarAnchorEl);

    return (
      <Grid>
        <TextField
          label="Procurar..."
          value={searchUsuario}
          onChange={this.handleChangeSearch}
          margin="normal"
          type="search"
          fullWidth
        />
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="left">E-mail</TableCell>
              <TableCell align="left">Médico</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Permissões e Notificações</TableCell>
              <TableCell align="left" />
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.filter(this.filterUsuarios).map((usuario, index) => (
              <TableRow hover key={usuario.id}>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell align="left">{usuario.email}</TableCell>
                <TableCell className={classNames({ [classes.inactive]: !usuario.medico })} align="left">{usuario.medico ? 'SIM' : 'NÃO'}</TableCell>
                <TableCell className={classNames({ [classes.inactive]: !usuario.ativo })} align="left">
                  <Chip
                    style={{ width: 100 }}
                    {...({ deleteIcon: usuario.ativo ? <DoneIcon /> : undefined })}
                    label={usuario.ativo ? 'ATIVO' : 'INATIVO'}
                    color={usuario.ativo ? 'primary' : 'secondary'}
                    onClick={this.handleToggleUsuarioStatus(usuario, index)}
                    onDelete={this.handleToggleUsuarioStatus(usuario, index)}
                    clickable
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="left">{usuario.permissoes.map(({ descricao }) => descricao).join(', ')}</TableCell>
                <TableCell align="left">
                  <IconButton
                    arial-label="Mais"
                    aria-owns={open ? `menu-${usuario.id}` : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClickUsuarioMenu(usuario)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!!usuarioSelecionado && (
          <Menu
            id={`menu-${usuarioSelecionado.id}`}
            anchorEl={editarAnchorEl}
            open={open}
            onClose={this.handleCloseUsuarioMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 250,
              },
            }}
          >
            <MenuItem button component={Link} to={`/app/usuarios/${usuarioSelecionado.id}`} onClick={this.handleCloseUsuarioMenu}>Editar</MenuItem>
          </Menu>
        )}
      </Grid>
    );
  }
}

const mapStateToProps = ({ user: { usuarios } }) => ({
  usuarios,
});

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
  setUsuario: (usuario, index) => dispatch(UsuarioActions.setUsuario(usuario, index)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(Material)(ListaUsuarios));
