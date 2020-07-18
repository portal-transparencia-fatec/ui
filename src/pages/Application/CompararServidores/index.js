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
import { Material, CustomButton } from './styles';
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
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'react-fusioncharts';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const B = ({ children, ...props }) => <strong {...props}>{children}</strong>;

class CompararServidores extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartBruto: {},
      chartLiquido: {},
      chartDesconto: {},

      servidoresSelecionados: [],

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
      rowsPerPage: 5707,
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
    const { rgf } = this.props.match.params;

    // if(rgf) {
    //   this.fetchGraficoByRgf(rgf)
    // }
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { modalDetalhesServidor, servidorSelecionado, regime, cargo, referencia, page, rowsPerPage } = this.state;

    if (regime !== prevState.regime || cargo !== prevState.cargo || referencia !== prevState.referencia || page !== prevState.page  || rowsPerPage !== prevState.rowsPerPage) {
      const filters = {
        regime: regime || undefined,
        cargo: cargo|| undefined,
      }

      // this.fetchServidores(page, rowsPerPage, filters)
    }
  }


  fetchGraficoServidores = async () => {
    const { servidoresSelecionados } = this.state;

    const rgfs = servidoresSelecionados.map(({ rgf }) => rgf);

    try {
      this.setState({ loading: true })
      const { chartBruto, chartLiquido, chartDesconto, } =  await ServidoresService.getAllSalariosByRgfs(rgfs);
      await this.setState({ modalSelectServidor: false, chartBruto, chartLiquido, chartDesconto })
    
      this.refs.graficos.scrollIntoView({ behavior: "smooth"})
    } catch (err) {
      console.log(err)
    }
  }



  fetchGraficoByRgf = async (rgf) => {
    const { notify } = this.props;
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

  fetchSearch = async (nome) => {
    try {
      if(nome.length >= 5) {
        const { servidores } = await ServidoresService.getAllByNome(nome);
        this.setState({ servidores })
      }
    } catch (err) {
      console.log(err)
    }
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


  handleServidoresChange = (event, servidorSelecionado) => {
    this.setState({ servidoresSelecionados: [...this.state.servidoresSelecionados, servidorSelecionado ] })
  }

  handleDeleteServidor = (index) => {
    const { servidoresSelecionados } = this.state;

    servidoresSelecionados.splice(index, 1);
    this.setState({ servidoresSelecionados })
  }

  renderModalSelectServidores = () => {
    const { classes } = this.props; 
    const { modalSelectServidor } = this.state;

    const handleClose = () => { this.setState({ modalSelectServidor: false })}
    return (
      <Dialog
        open={modalSelectServidor}
        onClose={handleClose}
        maxWidth="100vw"
      >
      <DialogTitle>
        <Grid container direction="row">
          <Grid item container justify="flex-start" alignItems="center" sm={10} md={10} lg={10} style={{ width: '90%', fontSize: '20px', color: 'rgba(14, 70, 116)' }} >
            Adicionar Servidor
          </Grid>
          <Grid item container justify="flex-end" alignItems="center" sm={2} md={2} lg={2} style={{ width: '10%' }}>
            <IconButton
              onClick={handleClose}
              className={classes.teste}
              style={{ backgroundColor: 'rgba(14, 70, 116)', color: '#fff' }}
            >
              <CloseIcon className={classes.icons} />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ minHeight: '70vh', minWidth: '40vw', maxWidth: '40vw' }}>
            <Grid container spacing={1} alignItems="center" justify="center">
              <Grid item sm={12} md={12} lg={12}>
                <TextField
                  label="Nome:"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ 
                    shrink: true
                  }}
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
                />
              </Grid>

              {!isEmpty(this.state.servidoresSelecionados) && (
                <Grid item sm={12} md={12} lg={12}>
                  <Grid item container direction="row" alignItems="center" sm={12} md={12} lg={12} style={{ backgroundColor: 'rgba(240, 240, 240)', border: '0.5px solid rgba(191, 191, 191)', minHeight: '50px', borderRadius: '2.5px' }}>
                    {this.state.servidoresSelecionados.map((servidor, index) => (
                      <Chip
                        style={{ margin: 4 }}
                        key={index}
                        label={`${servidor.nome} (${servidor.rgf})`}
                        onDelete={() => this.handleDeleteServidor(index)}
                        className={classes.chip}
                      />
                    ))}
                  </Grid>
                </Grid>
              )}

              <Grid item sm={12} md={12} lg={12}>
                <Grid item sm={12} md={12} lg={12} style={{ backgroundColor: '#fff', border: '0.5px solid rgba(191, 191, 191)', minHeight: '55vh', borderRadius: '2.5px', overflow: 'hidden' }}>
                  {this.state.servidores.map((servidor, index) => (
                    <Grid item container spacing={2} direction="row" sm={12} md={12} lg={12} style={{ borderTop: '0.5px solid rgba(191, 191, 191)', minHeight: '12vh', maxHeight: '12vh', overflow: 'hidden' }}>
                      <Grid item  container justify="center" alignItems="center" sm={10} md={10} lg={10}>
                        <Grid item  container direction="row" justify="flex-start" alignItems="center" sm={12} md={12} lg={12} style={{ flexWrap: 'nowrap', padding: '0px 5px' }}>
                          <Typography style={{ textTransform: 'capitalize', color: 'rgb(56, 158, 148)' }}>{`${String(servidor.nome)} `}</Typography>
                          <Typography style={{ fontSize: '30px', margin: '0px 5px'}}>—</Typography>
                          <Typography>{` ${servidor.cargo}`}</Typography>
                        </Grid>

                        <Grid item  container justify="flex-start" alignItems="center" sm={12} md={12} lg={12} style={{ padding: '0 5px' }}>
                          <Typography style={{ fontSize: '18px', fontWeight: 'bold' }}>{formataDinheiro(Number(servidor.liquido))}</Typography>
                          <Typography style={{ fontSize: '20px', margin: '0px 5px'}}>»</Typography>
                          <Typography>{` (${servidor.rgf})`}</Typography>
                        </Grid>
                      
                      </Grid>

                      <Grid item container justify="center" alignItems="center" sm={2} md={2} lg={2}>
                        {this.state.servidoresSelecionados.includes(servidor) ? (
                        <Button
                          fullWidth
                          variant="outlined"
                          size="medium"
                          color="secondary"
                          type="button"
                          onClick={() => this.handleDeleteServidor(index)}
                          
                        >
                          Remover
                        </Button>
                        ): (
                          <Button
                            fullWidth
                            variant="contained"
                            size="medium"
                            color="primary"
                            type="button"
                            onClick={() => this.setState({ servidoresSelecionados: [...this.state.servidoresSelecionados, servidor ]})}
                            // style={{ backgroundColor: 'rgba(14, 70, 116)', color: '#fff' }}
                          >
                            Adicionar
                          </Button> 
                        )}
                        
                      </Grid>
                    </Grid>
                  ))}
                  
                </Grid>
              </Grid>
            </Grid>
            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Grid item container justify="flex-end" sm={12} md={12} lg={12}>
            <Grid item sm={12} md={12} lg={12}>
              <Button
                disabled={!!(this.state.servidoresSelecionados.length < 2)}
                fullWidth
                variant="contained"
                size="medium"
                color="primary"
                type="button"
                onClick={this.fetchGraficoServidores}
            
              >
                Comparar
              </Button>  
            </Grid>  
          </Grid>
        </DialogActions>
      </Dialog>
    )
  }

  render() {
    const { modalDetalhesServidor, servidorSelecionado, editarAnchorEl, qtdServidores, loading, servidores, page, rowsPerPageOptions, rowsPerPage } = this.state;

    const open = Boolean(editarAnchorEl);
    return (
      <Grid container spacing={1} style={{ padding: 10, height: '100%' }}>
        {this.renderModalSelectServidores()}
        <Grid item sm={12} md={12} lg={12}>
          <Paper style={{ padding: 10, height: '100%' }}>
            <Grid item sm={12} md={12} lg={12}>
              <Typography style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>COMPARADOR DE SERVIDORES</Typography>
            </Grid>

            <Grid item container direction="row" spacing="center" justify="center" sm={12} md={12} lg={12} style={{ margin: '20px 0px' }}>
              <Typography style={{ fontSize: '40px', fontWeight: 'bold', color: 'rgba(14, 70, 116)'  }}>
                Compare
              </Typography>

              <Typography style={{ fontSize: '40px', color: 'rgba(14, 70, 116, 0.7)' }}>
                &nbsp;servidores!
              </Typography>

            </Grid>


            <Grid item container direction="column" spacing="center" justify="center" alignItems="center" sm={12} md={12} lg={12}>
              <Typography style={{ fontSize: '20px', color: '#909090'  }}>
                Você pode comparar até 5 servidores!
              </Typography>

              <Typography style={{ fontSize: '20px', color: '#909090' }}>
                Vamos ranqueá-las com base nos seus indicadores
              </Typography>
            </Grid>

            <Grid  item container alignItems="center" justify="center" sm={12} md={12} lg={12} style={{ height: '50vh' }}>
              <CustomButton onClick={() => this.setState({ modalSelectServidor: true })}>
                <AddIcon />
              </CustomButton>
            </Grid>

            <Grid ref='graficos'>
              {!isEmpty(this.state.chartBruto) && (
                    <Grid item sm={12} md={12} lg={12}>
                      <Paper style={{ padding: 10, height: '100%', backgroundColor: 'rgba(14, 70, 116)' }}>
                            <Grid item sm={12} md={12} lg={12}>
                              <ReactFC {...this.state.chartBruto} />
                            </Grid>
                      </Paper>
                    </Grid>
                  )}

                  {!isEmpty(this.state.chartLiquido) && (
                    <Grid item sm={12} md={12} lg={12}>
                      <Paper style={{ padding: 10, height: '100%', backgroundColor: 'rgba(14, 70, 116)' }}>
                            <Grid item sm={12} md={12} lg={12}>
                              <ReactFC {...this.state.chartLiquido} />
                            </Grid>
                      </Paper>
                    </Grid>
                  )}

                  {!isEmpty(this.state.chartBruto) && (
                    <Grid item sm={12} md={12} lg={12}>
                      <Paper style={{ padding: 10, height: '100%', backgroundColor: 'rgba(14, 70, 116)'}}>
                            <Grid item sm={12} md={12} lg={12}>
                              <ReactFC {...this.state.chartDesconto} />
                            </Grid>
                      </Paper>
                    </Grid>
                  )}
              </Grid>
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
)(CompararServidores);