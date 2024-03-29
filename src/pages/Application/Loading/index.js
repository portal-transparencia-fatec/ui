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

  // Funcao que é carregada quando o componente for renderizado
  // em tela
  async componentDidMount() {
    const data = await axios.get('http://www.licitacao.pmmc.com.br/Transparencia/vencimentos2');
    console.log(data);
    // await this.setState({ servidores });
  }

  state = {
    nome: 'André',
    servidores: [],
  }

  render() {
    
    return (
      <Grid container spacing={3} style={{ padding: 20 }}>
        <Grid item sm={12} md={12} lg={12}>
          <TextField
            label="Pesquise pelo nome do funcionário"
            variant="outlined"
            fullWidth
          />
        </Grid>

        <Grid item sm={12} md={12} lg={12}>
          <Paper>
            {this.state.animais}
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
                {this.state.servidores.map(servidor => (
                  <TableRow>
                    <TableCell align="center">{servidor.nome}</TableCell>
                    <TableCell align="center">RGF</TableCell>
                    <TableCell align="center">Cargo</TableCell>
                    <TableCell align="center">Regime</TableCell>
                    <TableCell align="center">Salário Bruto</TableCell>
                    <TableCell align="center">Salário Líquido</TableCell>
                    <TableCell align="center">Desconto</TableCell>
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