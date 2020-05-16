import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import withStyles from '@material-ui/core/styles/withStyles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import FormGroup from '@material-ui/core/FormGroup';
import Chip from '@material-ui/core/Chip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import DoneIcon from '@material-ui/icons/Done';

import ConvenioService from '../../../../../services/Convenio';
import NotificationActions from '../../../../../store/ducks/notifier';
import Material from './styles';
import { cnpjFormatter } from '../../../../../libs/utils';


class ListaConvenios extends Component {
  state = {
    convenios: [],
    searchConvenio: '',
    statusConvenio: true,
    convenioSelecionado: null,
    editarAnchorEl: null,
  }

  componentDidMount() {
    this.fetchConvenios();
  }

  componentDidUpdate(prevProps) {
    const { onUpdateConvenios, onCompleteUpdate } = this.props;
    if (onUpdateConvenios && prevProps.onUpdateConvenios !== onUpdateConvenios) {
      this.fetchConvenios();
      onCompleteUpdate();
    }
  }

  handleClickConvenioMenu = convenio => (event) => {
    this.setState({ editarAnchorEl: event.currentTarget, convenioSelecionado: convenio });
  }

  handleCloseConvenioMenu = () => {
    this.setState({ editarAnchorEl: null, convenioSelecionado: null });
  }

  fetchConvenios = async () => {
    const { notify } = this.props;

    try {
      const convenios = await ConvenioService.getAll();

      this.setState({ convenios });
    } catch (err) {
      console.log(err);
      notify('Não foi possível carregar os convênios', { variant: 'error' });
    }
  }

  handleChangeSearch = async (event) => {
    await this.setState(({ searchConvenio: event.target.value }));
  }

  handleChangeSwitch = async (event) => {
    await this.setState(({ statusConvenio: event.target.checked }));
    this.filterStatusConvenio();
  }

  filterStatusConvenio = async () => {
    const { statusConvenio } = this.state;
    const convenios = await ConvenioService.getAll('', statusConvenio);

    this.setState({ convenios });
  }

  isFiltered = (convenio) => {
    const { searchConvenio } = this.state;

    if (!String(searchConvenio).trim()) {
      return true;
    }

    if (new RegExp(searchConvenio, 'ig').test(convenio.nome)) {
      return true;
    }

    if (new RegExp(searchConvenio, 'ig').test(convenio.razaoSocial)) {
      return true;
    }

    return false;
  }

  handleToggleConvenioStatus = (convenio, index) => async () => {
    const { notify } = this.props;

    try {
      const convenioResponse = await ConvenioService.atualizarStatus(convenio.id);

      this.setState((state) => {
        const { convenios } = state;
        convenios[index] = convenioResponse;
        return {
          convenios,
        };
      });
    } catch (err) {
      notify('Não foi possível alterar o status.', { error: true });
    }
  }

  render() {
    const { classes } = this.props;
    const {
      convenios,
      convenioSelecionado,
      searchConvenio,
      statusConvenio,
      editarAnchorEl,
    } = this.state;
    const open = Boolean(editarAnchorEl);

    return (
      <Grid container direction="column">
        <Paper elevation={0}>
          <Grid container alignItems="center">
            <Grid item sm={12} md={7} lg={7}>
              <TextField
                className={classes.textfield}
                label="Procurar..."
                value={searchConvenio}
                onChange={this.handleChangeSearch}
                margin="normal"
                type="search"
              />
            </Grid>
            <Grid item sm={12} md={1} lg={1}>
              <FormGroup>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={statusConvenio}
                      name="status"
                      onChange={this.handleChangeSwitch}
                      color="primary"
                      value="bool"
                    />
                  )}
                  label="Ativo?"
                />
              </FormGroup>
            </Grid>
          </Grid>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="left">Razão Social</TableCell>
                <TableCell align="left">CNPJ</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="left" />
              </TableRow>
            </TableHead>
            <TableBody>
              {convenios.map((convenio, index) => (
                this.isFiltered(convenio) && (
                  <TableRow hover key={convenio.id}>
                    <TableCell>{convenio.nome}</TableCell>
                    <TableCell align="left">{convenio.razaoSocial}</TableCell>
                    <TableCell align="left">{cnpjFormatter(convenio.cnpj)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        style={{ width: 100 }}
                        {...({ deleteIcon: convenio.ativo ? <DoneIcon /> : undefined })}
                        label={convenio.ativo ? 'ATIVO' : 'INATIVO'}
                        color={convenio.ativo ? 'primary' : 'secondary'}
                        onDelete={this.handleToggleConvenioStatus(convenio, index)}
                        onClick={this.handleToggleConvenioStatus(convenio, index)}
                        clickable
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="left">
                      <>
                        <IconButton
                          arial-label="Mais"
                          aria-owns={open ? `menu-${convenio.id}` : undefined}
                          aria-haspopup="true"
                          onClick={this.handleClickConvenioMenu(convenio)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
          {/* <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={usuarios.length}
            rowsPerPage={10}
            page={1}
            backIconButtonProps={{
              'aria-label': 'Anterior',
            }}
            nextIconButtonProps={{
              'aria-label': 'Próximo',
            }}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({
              from, page, to, count,
            }) => (`${page === 1 ? 1 : from} - ${to} de ${count}`)}
            onChangePage={() => {}}
            onChangeRowsPerPage={() => {}}
          /> */}
        </Paper>
        {!!convenioSelecionado && (
          <Menu
            id={`menu-${convenioSelecionado.id}`}
            anchorEl={editarAnchorEl}
            open={open}
            onClose={this.handleCloseConvenioMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 250,
              },
            }}
          >
            <MenuItem button component={Link} to={`/app/convenios/${convenioSelecionado.id}`} onClick={this.handleCloseConvenioMenu}>Editar</MenuItem>
          </Menu>
        )}
      </Grid>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default connect(null, mapDispatchToProps)(withStyles(Material)(ListaConvenios));
