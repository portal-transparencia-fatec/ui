import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';

export default class Servidores extends Component {
  async componentDidMount() {
    const {data: servidores } = await axios.get('http://a8131c26.ngrok.io/servidores/');
    this.setState({ servidores });
  }

  state = {
    nome: 'André',
    servidores: [],

    search: '',
  }

  filterServidor = (servidor) => {
    const { search } = this.state;

    if (!String(search).trim()) {
      return true;
    }

    if (new RegExp(search, 'ig').test(servidor.nome)) {
      return true;
    }

    if (new RegExp(search, 'ig').test(servidor.rgf)) {
      return true;
    }

    if (new RegExp(search, 'ig').test(servidor.cargo)) {
      return true;
    }

    return false;
  }

  render() {
    
    return (
      <Grid container spacing={3} style={{ padding: 20 }}>
        <Grid item sm={12} md={12} lg={12}>
          <TextField
            label="Pesquisar..."
            variant="outlined"
            fullWidth
            value={this.state.search}
            onChange={(event) => this.setState({ search: event.target.value })}
          />
        </Grid>

        <Grid item sm={12} md={12} lg={12}>
          <Paper>
            <Table style={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Nome</TableCell>
                  <TableCell align="center">RGF</TableCell>
                  <TableCell align="center">Cargo</TableCell>
                  <TableCell align="center">Regime</TableCell>
                  <TableCell align="center">Salário Bruto</TableCell>
                  <TableCell align="center">Salário Líquido</TableCell>
                  <TableCell align="center">Desconto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.servidores.filter(this.filterServidor).map(servidor => (
                  <TableRow>
                    <TableCell align="center">{servidor.nome}</TableCell>
                    <TableCell align="center">{servidor.rgf}</TableCell>
                    <TableCell align="center">{servidor.cargo}</TableCell>
                    <TableCell align="center">{servidor.regime}</TableCell>
                    <TableCell align="center">{servidor.bruto}</TableCell>
                    <TableCell align="center">{servidor.liquido}</TableCell>
                    <TableCell align="center">{servidor.desconto}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          </Paper>
        </Grid>
      </Grid>
    );
  }
}