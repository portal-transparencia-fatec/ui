import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter, Link } from 'react-router-dom';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import MoreVertIcon from '@material-ui/icons/MoreVert';

import NotificationActions from '../../../../../store/ducks/notifier';
import EmpresaService from '../../../../../services/Empresa';

import { cnpjFormatter, telFormatter } from '../../../../../libs/utils';

import Material from './styles';

class ListaEmpresas extends Component {
  state = {
    searchEmpresaFiltro: '',
    searchUnidadeFiltro: '',
    empresas: [],
    unidades: [],
    anchorElMenuEmpresa: null,
    empresaSelecionada: null,
  }

  componentDidMount() {
    this.fetchEmpresas();
  }

  fetchEmpresas = async () => {
    const { notify } = this.props;

    try {
      const empresas = await EmpresaService.getAll();

      this.setState({ empresas });
    } catch (err) {
      notify('Não foi possível buscar as empresas', { variant: 'error' });
    }
  }

  handleClickButtonMenu = empresa => (event) => {
    this.setState({
      empresaSelecionada: empresa,
      anchorElMenuEmpresa: event.currentTarget,
    });
  }

  handleClickCloseMenu = () => {
    this.setState({
      empresaSelecionada: null,
      anchorElMenuEmpresa: null,
    });
  }

  handleClickRowEmpresa = empresa => (event) => {
    if (['BUTTON', 'svg', 'path'].includes(event.target.tagName)) return;
    this.setState({ unidades: empresa.unidades });
  }

  handleDoubleClickRowUnidade = (unidade) => {
    const { history } = this.props;
    history.push(`/app/empresa/unidade/${unidade.id}`);
  }

  filtroEmpresas = (empresa) => {
    const { searchEmpresaFiltro } = this.state;

    if (!String(searchEmpresaFiltro).trim()) {
      return true;
    }

    if (new RegExp(searchEmpresaFiltro, 'ig').test(empresa.nome)) {
      return true;
    }

    if (new RegExp(searchEmpresaFiltro, 'ig').test(empresa.identificador)) {
      return true;
    }

    return false;
  }

  filtroUnidades = (unidade) => {
    const { searchUnidadeFiltro } = this.state;

    if (!String(searchUnidadeFiltro).trim()) {
      return true;
    }

    if (new RegExp(searchUnidadeFiltro, 'ig').test(unidade.nome)) {
      return true;
    }

    if (new RegExp(searchUnidadeFiltro, 'ig').test(unidade.razaoSocial)) {
      return true;
    }

    if (new RegExp(searchUnidadeFiltro, 'ig').test(unidade.cnpj)) {
      return true;
    }

    if (new RegExp(searchUnidadeFiltro, 'ig').test(unidade.telefone)) {
      return true;
    }

    return false;
  }

  render() {
    const { classes } = this.props;
    const {
      empresas,
      unidades,
      searchEmpresaFiltro,
      searchUnidadeFiltro,
      anchorElMenuEmpresa,
      empresaSelecionada,
    } = this.state;

    return (
      <Grid container spacing={3}>
        <Grid item sm={12} md={4} lg={4}>
          <TextField
            label="Procurar empresa..."
            value={searchEmpresaFiltro}
            onChange={event => this.setState({ searchEmpresaFiltro: event.target.value })}
            margin="normal"
            type="search"
            fullWidth
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Nome</TableCell>
                <TableCell align="left">Identificador</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {!!empresas.length && empresas.filter(this.filtroEmpresas).map(empresa => (
                <Tooltip
                  key={empresa.id}
                  title="Visualizar unidades"
                  placement="top"
                  enterDelay={600}
                  leaveDelay={100}
                >
                  <TableRow
                    className={classes.tableRow}
                    hover
                    onClick={this.handleClickRowEmpresa(empresa)}
                  >
                    <TableCell align="left">{empresa.nome}</TableCell>
                    <TableCell align="left">{empresa.identificador}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        arial-label="Mais"
                        aria-owns={anchorElMenuEmpresa ? `menu-${empresa.id}` : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClickButtonMenu(empresa)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid item sm={12} md={8} lg={8}>
          <TextField
            label="Procurar unidade..."
            value={searchUnidadeFiltro}
            onChange={event => this.setState({ searchUnidadeFiltro: event.target.value })}
            margin="normal"
            type="search"
            fullWidth
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Nome</TableCell>
                <TableCell align="left">Razão Social</TableCell>
                <TableCell align="right">CNPJ</TableCell>
                <TableCell align="right">Telefone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!!unidades.length && unidades.filter(this.filtroUnidades).map(unidade => (
                <Tooltip
                  key={unidade.id}
                  title="2 cliques para editar"
                  placement="top"
                  enterDelay={600}
                  leaveDelay={100}
                >
                  <TableRow
                    className={classes.tableRow}
                    hover
                    onDoubleClick={() => this.handleDoubleClickRowUnidade(unidade)}
                  >
                    <TableCell align="left">{unidade.nome}</TableCell>
                    <TableCell align="left">{unidade.razaoSocial}</TableCell>
                    <TableCell align="right">{cnpjFormatter(unidade.cnpj)}</TableCell>
                    <TableCell align="right">
                      {unidade.telefone ? telFormatter(unidade.telefone) : 'N/A'}
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))}
            </TableBody>
          </Table>
        </Grid>
        {!!empresaSelecionada && (
          <Menu
            id={`menu-${empresaSelecionada.id}`}
            anchorEl={anchorElMenuEmpresa}
            open={!!anchorElMenuEmpresa}
            onClose={this.handleClickCloseMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 250,
              },
            }}
          >
            <MenuItem button component={Link} to={`/app/empresa/${empresaSelecionada.id}`} onClick={this.handleClickCloseMenu}>Editar</MenuItem>
          </Menu>
        )}
      </Grid>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withRouter,
  withStyles(Material),
)(ListaEmpresas);
