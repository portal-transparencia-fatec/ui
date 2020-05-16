/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
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
import NotificationActions from '../../../../../store/ducks/notifier';

import Material from './styles';
import FinanceiroService from '../../../../../services/Financeiro';

class ListaCondicoesPagamento extends Component {
  state = {
    searchCondicao: '',
    condicaoSelecionada: null,
    editarAnchorEl: null,
  }

  handleClickCondicaoMenu = option => (event) => {
    this.setState({ editarAnchorEl: event.currentTarget, condicaoSelecionada: { ...option } });
  }

  handleCloseCondicaoMenu = () => {
    this.setState({ editarAnchorEl: null, condicaoSelecionada: null });
  }

  filterCondicoes = (option) => {
    const { searchCondicao } = this.state;

    if (!String(searchCondicao).trim()) return true;

    if (new RegExp(searchCondicao, 'ig').test(option.descricao)) {
      return true;
    }

    if (new RegExp(searchCondicao, 'ig').test(option.juros)) {
      return true;
    }

    if (new RegExp(searchCondicao, 'ig').test(option.qtdParcelasDisponiveis)) {
      return true;
    }

    if (new RegExp(searchCondicao, 'ig').test(option.diasEntreParcelas)) {
      return true;
    }

    if (new RegExp(searchCondicao, 'ig').test(option.ativo ? 'ATIVO' : 'INATIVO')) {
      return true;
    }

    return false;
  }

  handleChangeSearch = async (event) => {
    await this.setState(({ searchCondicao: event.target.value }));
  }

  handleToggleCondicaoStatus = (option, index) => async () => {
    const { notify, unidade, onComplete } = this.props;
    try {
      await FinanceiroService.saveCondicaoPagamento({
        ...option,
        ativo: !option.ativo,
        empresaUnidade: unidade.id,
      });
      onComplete();
    } catch (err) {
      console.log(err);
      notify('Não foi possível alterar o status', { variant: 'error' });
    }
  }

  render() {
    const {
      formaPagamentoOptions,
      condicoesPagamento,
      classes,
    } = this.props;

    const {
      condicaoSelecionada,
      searchCondicao,
      editarAnchorEl,
    } = this.state;
    const open = Boolean(editarAnchorEl);

    return (
      <Grid>
        <TextField
          label="Procurar..."
          value={searchCondicao}
          onChange={this.handleChangeSearch}
          margin="normal"
          type="search"
          fullWidth
        />
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell align="center">Descrição</TableCell>
              <TableCell align="center">Forma de Pagamento</TableCell>
              <TableCell align="center">Juros</TableCell>
              <TableCell align="center">Qtd. Parcelas Disponíveis</TableCell>
              <TableCell align="center">Qtd. Dias Entre Parcelas</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          <TableBody>
            {condicoesPagamento.filter(this.filterCondicoes).map((option, index) => (
              <TableRow hover key={option.id}>
                <TableCell align="center">{option.descricao}</TableCell>
                <TableCell align="center">
                  {Object.keys(formaPagamentoOptions).filter(key => formaPagamentoOptions[key] === option.formaPagamento)}
                </TableCell>
                <TableCell align="center">{`${option.juros}%`}</TableCell>
                <TableCell align="center">{option.qtdParcelasDisponiveis}</TableCell>

                <TableCell align="center">{option.diasEntreParcelas}</TableCell>
                <TableCell className={classNames({ [classes.inactive]: !option.ativo })} align="center">
                  <Chip
                    style={{ width: 100 }}
                    {...({ deleteIcon: option.ativo ? <DoneIcon /> : undefined })}
                    label={option.ativo ? 'ATIVO' : 'INATIVO'}
                    color={option.ativo ? 'primary' : 'secondary'}
                    onClick={this.handleToggleCondicaoStatus(option, index)}
                    onDelete={this.handleToggleCondicaoStatus(option, index)}
                    clickable
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    arial-label="Mais"
                    aria-owns={open ? `menu-${option.id}` : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClickCondicaoMenu(option)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!!condicaoSelecionada && (
          <Menu
            id={`menu-${condicaoSelecionada.id}`}
            anchorEl={editarAnchorEl}
            open={open}
            onClose={this.handleCloseCondicaoMenu}
            PaperProps={{
              style: {
                maxHeight: 45 * 4.5,
                width: 250,
              },
            }}
          >
            <MenuItem button component={Link} to={`/app/condicoes-pagamento/${condicaoSelecionada.id}`} onClick={this.handleCloseCondicaoMenu}>Editar</MenuItem>
          </Menu>
        )}
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  const unidadeAtual = state.user.unidades.find(unid => unid.current);

  return {
    unidade: unidadeAtual.unidade || {},
  };
};

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(Material)(ListaCondicoesPagamento));
