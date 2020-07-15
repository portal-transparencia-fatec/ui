import React, { Component } from 'react';

import {
  TextField,
  Button,
  Dialog,
  IconButton,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Checkbox,
} from '@material-ui/core';
import Search from '@material-ui/icons/Search';
import Slider from '@material-ui/core/Slider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import axios from 'axios';
import { debounce, isEmpty } from 'lodash';
import { compose } from 'redux';
import { connect } from 'react-redux';
import ServidoresService from '../../../services/Servidores'
import NotificationActions from '../../../store/ducks/notifier';
import withStyles from '@material-ui/core/styles/withStyles';
import { Material, Divider } from './styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ModalSelect from '../../../components/ModalSelect';
import moment from 'moment';
import {
  formataDinheiro,
} from '../../../libs/utils';

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import '../../../assets/css/accordion.css';
import CloseIcon from '@material-ui/icons/Close';


import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'react-fusioncharts';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const B = ({ children }) => <strong>{children}</strong>;

class Servidores extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartSalario: {},

      modalDetalhesServidor: false,
      editarAnchorEl: null,
      servidorSelecionado: {},

      regime: '',
      regimes: [],

      cargo: '',
      cargos: [],


      referencia: [100, 100],
      qtdServidores: 0,
      servidores: [],
      search: '',

      page: 0,
      rowsPerPage: 10,
      rowsPerPageOptions: [10, 25, 50, 100],

      referencias: [
        {
          referencia: '01-01-2020',
          value: 0,
          label: 'Jan/2020',
        },
        {
          referencia: '01-02-2020',
          value: 20,
          label: 'Fev/2020',
        },
        {
          referencia: '01-03-2020',
          value: 40,
          label: 'Mar/2020',
        },
        {
          referencia: '01-04-2020',
          value: 60,
          label: 'Abr/2020',
        },
        {
          referencia: '01-05-2020',
          value: 80,
          label: 'Mai/2020',
        },
        {
          referencia: '01-06-2020',
          value: 100,
          label: 'Jun/2020',
        },
      ]
    }

    this.fetchSearch = debounce(this.fetchSearch, 400);

  }

  componentDidMount() {
    const{ referencias, page, rowsPerPage } = this.state;
    
    const value = referencias[referencias.length -1].value;
    this.fetchServidores(page, rowsPerPage)
    this.fetchCargos();
    this.fetchRegimes();
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { modalDetalhesServidor, servidorSelecionado, regime, cargo, referencia, page, rowsPerPage } = this.state;

    if (regime !== prevState.regime || cargo !== prevState.cargo || referencia !== prevState.referencia || page !== prevState.page  || rowsPerPage !== prevState.rowsPerPage) {
      const filters = {
        regime: regime || undefined,
        cargo: cargo|| undefined,
      }

      this.fetchServidores(page, rowsPerPage, filters)
    }


    if (modalDetalhesServidor !== prevState.modalDetalhesServidor) {
      this.fetchGraficoRenda()
    }
  }


  fetchGraficoRenda = async () => {
    const { notify } = this.props;
    const { servidorSelecionado: { rgf } } = this.state;
    try {
      this.setState({ loading: true })
      
      const chartSalario = await ServidoresService.getAllSalariosByRgf(rgf);
      this.setState({ chartSalario });
    } catch (err) {
      notify('Não foi possível realizar a busca', { variant: 'error' })
    } finally {
      this.setState({ loading: false })
    }
  }


  fetchCargos = async () => {
    const { notify } = this.props;

    try {
      this.setState({ loading: true })
      const cargos = await ServidoresService.getAllCargos();
      await this.setState({ cargos: cargos.map(({ cargo }, id) => ({ id, cargo })) });
    } catch (err) {
      notify('Não foi possível buscar a lista de cargos', { variant: 'error' })
    } finally {
      this.setState({ loading: false })
    }
  }

  fetchRegimes = async () => {
    const { notify } = this.props;

    try {
      this.setState({ loading: true })
      const regimes = await ServidoresService.getAllRegimes();
      await this.setState({ regimes: regimes.map(({ regime }, id) => ({ id, regime })) });
    } catch (err) {
      notify('Não foi possível buscar a lista de regimes', { variant: 'error' })
    } finally {
      this.setState({ loading: false })
    }
  }



  fetchServidores = async (page, rowsPerPage, filters) => {
    const { referencia, referencias } = this.state;
    const { notify } = this.props;

    try {
      this.setState({ loading: true })
    

      const dataInicial = referencias.find(item => item.value === referencia[0]).referencia;
      const dataFinal = referencias.find(item => item.value === referencia[1]).referencia;

      const { qtdServidores, servidores } = await ServidoresService.getAll({ page, rowsPerPage, filters, dataInicial, dataFinal });
      this.setState({ qtdServidores, servidores });
    } catch (err) {
      notify('Não foi possível buscar a lista de servidores', { variant: 'error' })
    } finally {
      this.setState({ loading: false })
    }

  }

  handleChangePage = pageName => (event, page) => {
    this.setState({ [pageName]: page });
  };

  handleChangeRowsPerPage = (page, rowsPerPage) => (event) => {
    this.setState({ [page]: 0, [rowsPerPage]: +event.target.value });
  };

  handleChangeSearch = ({ target: { value: searchInput } }) => {
    this.setState({ searchInput })
    this.fetchSearch(searchInput);
  }

  fetchSearch = (search) => {
    this.setState({ search })
  }

  filterServidor = (servidor) => {
    const { search, cargo, cargos, regime, regimes } = this.state;

    if (!String(search).trim() && !cargo && !regime) {
      return true;
    }

    if (new RegExp(search, 'ig').test(servidor.nome)) {
      return true;
    }

    return false;
  }

  handleChangeReferencia = (event, referencia) => {
    console.log(referencia)
    this.setState({ referencia });
  };


  renderAccordion = (props, children) => {
    return (
      <Accordion allowZeroExpanded>
        <AccordionItem>
          <AccordionItemHeading>
            <AccordionItemButton>
              {props}
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            {children}
          </AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    );
  }

  renderFilters = () => {
    return (
      <>
      {this.renderAccordion('Período', this.renderAccordionPeriodo())}
      {this.renderAccordion('Servidor', this.renderAccordionServidor())}
      {this.renderAccordion('Renda', this.renderAccordionRenda())}
      </>
    )
  }

  renderAccordionPeriodo = () => {
    const { referencia, referencias } = this.state;
    return (
      <Grid item sm={12} md={12} lg={12} style={{ padding: '5px' }}>
        <Slider
          value={referencia}
          onChange={this.handleChangeReferencia}
          valueLabelFormat={(value) => moment(referencias.find(item => value === item.value).referencia).date()}
          aria-labelledby="discrete-slider-restrict"
          step={null}
          valueLabelDisplay="auto"
          marks={referencias}
        />
      </Grid>
    )
  }

  renderAccordionServidor = () => {
    const { regime, regimes, cargo, cargos } = this.state;
    return (
      <>
        <Grid item container direction="row" sm={12} md={12} lg={12}>
          <Grid item sm={3} md={3} lg={3} style={{ padding: '5px 5px 0px 0px' }}>
            <TextField
              label="Nome:"
              variant="outlined"
              fullWidth
              value={this.state.searchInput}
              onChange={this.handleChangeSearch}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ 
                shrink: true
              }}
            />
          </Grid>

          <Grid item sm={3} md={3} lg={3} style={{ padding: '5px 5px 0px 0px' }}>
            <TextField
              label="RGF:"
              variant="outlined"
              fullWidth
              value={this.state.searchInput}
              onChange={this.handleChangeSearch}
              InputLabelProps={{ 
                shrink: true
              }}
            />
          </Grid>


          
          <Grid item sm={3} md={3} lg={3} style={{ padding: '5px 5px 0px 0px' }}>
            <ModalSelect
              label="Regimes"
              placeholderFilter="Filtrar..."
              value={regime}
              onChange={regime => this.setState({ regime })}
              options={regimes.map(({ id, regime: label }) => ({
                id: label, label
              }))}
              textfieldProps={{
                variant: 'outlined',
                fullWidth: true,
              }}
            />
          </Grid>


          <Grid item sm={3} md={3} lg={3} style={{ padding: '5px 0px 0px 5px' }}>
            <ModalSelect
              label="Cargos"
              placeholderFilter="Filtrar..."
              value={cargo}
              onChange={cargo => this.setState({ cargo })}
              options={cargos.map(({ id, cargo: label }) => ({
                id: label, label
              }))}
              textfieldProps={{
                variant: 'outlined',
                fullWidth: true,
              }}
            />
          </Grid>             
      </Grid>
    </>
    )
  }


  handleNavigate = () => {
    const { servidorSelecionado: { rgf } } = this.state;
    const { history } = this.props;
    
    history.push(`/app/servidores/comparar/${rgf}`)
  }

  renderAccordionRenda = () => {
    const { regime, regimes, cargo, cargos } = this.state;
    return (
      <>
        <Grid item container direction="row" sm={12} md={12} lg={12}>
          <Grid item sm={6} md={6} lg={6} style={{ padding: '5px 5px 0px 0px' }}>
            <TextField
              label="De:"
              placeholder="R$ 210,00"
              variant="outlined"
              fullWidth
              value={this.state.searchInput}
              onChange={this.handleChangeSearch}
              InputLabelProps={{ 
                shrink: true
              }}
            />
          </Grid>

          <Grid item sm={6} md={6} lg={6} style={{ padding: '5px 5px 0px 0px' }}>
            <TextField
              label="Até:"
              placeholder="R$ 9545,00"
              variant="outlined"
              fullWidth
              value={this.state.searchInput}
              onChange={this.handleChangeSearch}
              InputLabelProps={{ 
                shrink: true
              }}
            />
          </Grid>           
      </Grid>
    </>
    )
  }

  handleClickServidorMenu = servidorSelecionado => ({ currentTarget: editarAnchorEl }) => {
    this.setState({ editarAnchorEl, servidorSelecionado });
  }

  handleCloseServidorMenu = () => {
    this.setState({ modalDetalhesServidor: false, editarAnchorEl: null, servidorSelecionado: {} });
  }

  renderModalDetalhesServidor = () => {
    const { classes } = this.props;
    const { servidorSelecionado,modalDetalhesServidor } = this.state;

    const handleClose = () => { this.setState({ modalDetalhesServidor: false })}
    return (
      <Dialog
        open={modalDetalhesServidor}
        onClose={handleClose}
        maxWidth="100vw"
      >
      <DialogTitle>
        <Grid container direction="row">
          <Grid item sm={4} md={4} lg={4} style={{ width: '10%' }} />
          <Grid item container justify="center" alignItems="center" sm={4} md={4} lg={4} style={{ width: '80%' }} >
            <B>{servidorSelecionado.nome}</B>
          </Grid>
          <Grid item container justify="flex-end" alignItems="center" sm={4} md={4} lg={4} style={{ width: '10%' }}>
            <IconButton
              onClick={handleClose}
            >
              <CloseIcon className={classes.icons} />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ minHeight: '70vh', minWidth: '90vw' }}>
            <Grid container spacing={2} direction="row">

              {!isEmpty(this.state.chartSalario) && (
                <>
                  <Grid item sm={12} md={12} lg={12}>
                    <ReactFC {...this.state.chartSalario} />
                  </Grid>

                  <Grid item sm={12} md={12} lg={12}>
                    <Button
                      fullWidth
                      color="primary"
                      variant="contained"
                      onClick={this.handleNavigate}
                    >
                      Comparar com outros servidores
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>


          </DialogContentText>
        </DialogContent>
      </Dialog>
    )
  }

  render() {
    const { modalDetalhesServidor, servidorSelecionado, editarAnchorEl, qtdServidores, loading, servidores, page, rowsPerPageOptions, rowsPerPage } = this.state;

    const open = Boolean(editarAnchorEl);
    return (
      <Grid container spacing={1} style={{ padding: 10 }}>
        {this.renderModalDetalhesServidor()}
        <Grid item sm={12} md={12} lg={12}>
          <LoadingIndicator loading={loading} />
        </Grid>

        <Grid item sm={12} md={12} lg={12}>
          <Paper style={{ padding: 10 }}>
            <Grid item sm={12} md={12} lg={12} style={{ padding: 10 }}>
              {this.renderAccordion('FILTROS', this.renderFilters())}
            </Grid>

            <Table style={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center">RGF</TableCell>
                  <TableCell align="center">Nome</TableCell>
                  <TableCell align="center">Cargo</TableCell>
                  <TableCell align="center">Regime</TableCell>
                  <TableCell align="center"/>
                  {/* <TableCell align="center">Referencia</TableCell>
                  <TableCell align="center">Salário Bruto</TableCell>
                  <TableCell align="center">Salário Líquido</TableCell>
                  <TableCell align="center">Desconto</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {servidores.filter(this.filterServidor).map(servidor => (
                  <TableRow>
                    <TableCell align="center">{servidor.rgf}</TableCell>
                    <TableCell align="center">{servidor.nome}</TableCell>
                    <TableCell align="center">{servidor.cargo}</TableCell>
                    <TableCell align="center">{servidor.regime}</TableCell>
                    <TableCell align="center" style={{ padding: '0px' }}>
                      <IconButton
                        arial-label="Mais"
                        aria-owns={open ? `menu-${servidor.id}` : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClickServidorMenu(servidor)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>

                    {/* <TableCell align="center">{servidor.referencia}</TableCell>
                    <TableCell align="center">{formataDinheiro(Number(servidor.bruto) || 0)}</TableCell>
                    <TableCell align="center">{formataDinheiro(Number(servidor.liquido) || 0)}</TableCell>
                    <TableCell align="center">{formataDinheiro(Number(servidor.desconto) | 0)}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              labelRowsPerPage="Limite por página"
              component="div"
              count={qtdServidores}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={this.handleChangePage('page')}
              onChangeRowsPerPage={this.handleChangeRowsPerPage('page', 'rowsPerPage')}
            />

            {!!servidorSelecionado && !modalDetalhesServidor && (
              <Menu
                id={`menu-${servidorSelecionado.id}`}
                anchorEl={editarAnchorEl}
                open={open}
                onClose={this.handleCloseServidorMenu}
                PaperProps={{
                  style: {
                    maxHeight: 45 * 4.5,
                    width: 250,
                  },
                }}
              >
                <MenuItem onClick={() => this.setState({ modalDetalhesServidor: true })}>Mais informações</MenuItem>
              </Menu>
            )}

          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(Material, { withTheme: true }),
)(Servidores);