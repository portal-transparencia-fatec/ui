import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import MoreVertIcon from '@material-ui/icons/MoreVert';

import EventoService from '../../../../../services/Evento';

import NotificationActions from '../../../../../store/ducks/notifier';
import { cnpjFormatter } from '../../../../../libs/utils';

import Material from './styles';

class ListaEventosConvenios extends Component {
  static propTypes = {
    eventoId: PropTypes.number.isRequired,
    onDeleteConvenioEvento: PropTypes.func.isRequired,
    conveniosEventos: PropTypes.arrayOf(PropTypes.shape({
      codigo: PropTypes.string,
      id: PropTypes.number,
      convenio: PropTypes.shape({
        id: PropTypes.number,
        nome: PropTypes.string,
        razaoSocial: PropTypes.string,
        cnpj: PropTypes.string,
      }),
    })).isRequired,
  }

  state = {
    searchConvenioEvento: '',
    eventoConvenioSelecionado: null,
    tableRowAnchorEl: null,
  }

  handleChangeSearch = async (event) => {
    await this.setState(({ searchConvenioEvento: event.target.value }));
  }

  isFiltered = (convenioEvento) => {
    const { searchConvenioEvento } = this.state;

    if (!String(searchConvenioEvento).trim()) {
      return true;
    }

    if (new RegExp(searchConvenioEvento, 'ig').test(convenioEvento.codigo)) {
      return true;
    }

    if (new RegExp(searchConvenioEvento, 'ig').test(convenioEvento.convenio.nome)) {
      return true;
    }

    if (new RegExp(searchConvenioEvento, 'ig').test(convenioEvento.convenio.razaoSocial)) {
      return true;
    }

    return false;
  }

  handleClickTableRowMenu = convenioEvento => (event) => {
    this.setState({
      tableRowAnchorEl: event.currentTarget,
      eventoConvenioSelecionado: convenioEvento,
    });
  }

  handleCloseTableRowMenu = () => {
    this.setState({
      tableRowAnchorEl: null,
      eventoConvenioSelecionado: null,
    });
  }

  handleClickMenuDelete = async () => {
    const { eventoConvenioSelecionado: eventoConvenio } = this.state;
    this.handleCloseTableRowMenu();
    const { notify, eventoId, onDeleteConvenioEvento } = this.props;

    try {
      await EventoService.deleteConvenioEvento(eventoId, eventoConvenio.convenio.id);
      notify('Excluído com sucesso');
      onDeleteConvenioEvento(eventoConvenio.id);
    } catch (err) {
      if (err.response && err.response.data.mensagem) {
        notify(err.response.data.mensagem, { variant: 'error' });
      } else {
        notify('Não foi possível excluir este código', { variant: 'error' });
      }
    }
  }

  render() {
    const { classes, conveniosEventos } = this.props;
    const {
      searchConvenioEvento,
      eventoConvenioSelecionado,
      tableRowAnchorEl,
    } = this.state;

    return (
      <Grid container direction="column">
        <Paper elevation={0}>
          <Grid container alignItems="center">
            <Grid item sm={12} md={7} lg={7}>
              <TextField
                className={classes.textfield}
                label="Procurar..."
                value={searchConvenioEvento}
                onChange={this.handleChangeSearch}
                margin="normal"
                type="search"
              />
            </Grid>
          </Grid>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell align="left">Código</TableCell>
                <TableCell align="left">Nome</TableCell>
                <TableCell align="left">Razão Social</TableCell>
                <TableCell align="left">CNPJ</TableCell>
                <TableCell align="left" />
              </TableRow>
            </TableHead>
            <TableBody>
              {conveniosEventos.filter(this.isFiltered).map(convenioEvento => (
                <TableRow hover key={convenioEvento.id}>
                  <TableCell>{convenioEvento.codigo}</TableCell>
                  <TableCell align="left">{convenioEvento.convenio.nome}</TableCell>
                  <TableCell align="left">{convenioEvento.convenio.razaoSocial}</TableCell>
                  <TableCell align="left">{cnpjFormatter(convenioEvento.convenio.cnpj)}</TableCell>
                  <TableCell align="right">
                    <>
                      <IconButton
                        arial-label="Mais"
                        aria-owns={tableRowAnchorEl ? `menu-${convenioEvento.id}` : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClickTableRowMenu(convenioEvento)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!!eventoConvenioSelecionado && (
            <Menu
              id={`menu-${eventoConvenioSelecionado.id}`}
              anchorEl={tableRowAnchorEl}
              open={!!tableRowAnchorEl}
              onClose={this.handleCloseTableRowMenu}
              PaperProps={{
                style: {
                  maxHeight: 45 * 4.5,
                  width: 250,
                },
              }}
            >
              <MenuItem button onClick={this.handleClickMenuDelete}>Excluir</MenuItem>
            </Menu>
          )}
        </Paper>
      </Grid>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default connect(null, mapDispatchToProps)(withStyles(Material)(ListaEventosConvenios));
