import React, { Component } from 'react';
import moment from 'moment';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import withStyles from '@material-ui/core/styles/withStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import ScheduleIcon from '@material-ui/icons/Schedule';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

import ChatService from '../../../../services/Chat';

import Material, {
  Wrapper,
  Container,
  Content,
  Metadata,
  DateDisplay,
  AnexoButton,
} from './styles';

class ItemMensagem extends Component {
  getRemetenteNome = (mensagem, usuarioLogado) => {
    if (mensagem.remetente.id === usuarioLogado.id) {
      return 'VOCÊ';
    }

    return mensagem.remetente.nome;
  }

  /**
   * Ícone de display da visualização da mensagem
   */
  getStatusVisibility = (mensagem) => {
    const { classes } = this.props;

    if (mensagem.criadaEm && !mensagem.enviadaEm) {
      return (
        <ScheduleIcon className={classes.visibilityIcon} />
      );
    }

    if (mensagem.enviadaEm && !mensagem.visualizadaEm) {
      return (
        <DoneIcon className={classes.visibilityIcon} />
      );
    }

    if (mensagem.visualizadaEm) {
      return (
        <DoneAllIcon className={classes.visibilityIcon} />
      );
    }

    return null;
  }

  /**
   * Verifica se houve mudança de dia
   */
  isDayChange = (prevDate, nextDate) => moment(prevDate).isBefore(nextDate, 'day')

  /**
   * Display das mensagens na mudança de dia
   */
  getDateDisplay = (date) => {
    if (moment(date).isBetween(moment().startOf('day'), moment().endOf('day'))) {
      return 'Hoje';
    }

    if (moment(date).isBetween(moment().subtract(1, 'day').startOf('day'), moment().subtract(1, 'day').endOf('day'))) {
      return 'Ontem';
    }

    return moment(date).format('dddd[, ]DD/MM/YYYY');
  }

  handleDateDisplay = (mensagem, index) => {
    const { mensagens } = this.props;

    if (index === 0) {
      return this.getDateDisplay(mensagem.criadaEm);
    }

    if (this.isDayChange(mensagens[index - 1].criadaEm, mensagem.criadaEm)) {
      return this.getDateDisplay(mensagem.criadaEm);
    }

    return null;
  }

  /**
   * Realiza o download do anexo
   */
  handleDownloadAnexo = async (anexo) => {
    const file = await ChatService.downloadAnexo(anexo);

    const blob = new Blob([file], { type: anexo.tipo });
    saveAs(blob, anexo.nome);
  }

  /**
   * Realiza o download zipado de todos os anexos
   */
  handleDownloadTodosAnexos = async () => {
    const { mensagem: { anexos } } = this.props;
    const zip = new JSZip();

    await Promise.all(
      anexos.map(async (anexo) => {
        const file = await ChatService.downloadAnexo(anexo);

        const blob = new Blob([file], { type: anexo.tipo });
        zip.file(anexo.nome, blob);
      }),
    );

    const zipped = await zip.generateAsync({ type: 'blob' });
    saveAs(zipped, `${+new Date()}-anexos.zip`);
  }

  getAnexoNome = (filename) => {
    const tamanhoLimite = 32;

    if (filename.length > tamanhoLimite) {
      return `${filename.substr(0, 29)}...`;
    }

    return filename;
  }

  render() {
    const { classes, mensagem, index } = this.props;
    const usuarioLogado = JSON.parse(localStorage.getItem('@:usuario'));
    const isMe = mensagem.remetente.id === usuarioLogado.id;
    const dateDisplay = this.handleDateDisplay(mensagem, index);

    return (
      <>
        {!!dateDisplay && (<DateDisplay>{dateDisplay}</DateDisplay>)}
        <Wrapper me={mensagem.remetente.id === usuarioLogado.id}>
          <span>{this.getRemetenteNome(mensagem, usuarioLogado)}</span>
          <Container>
            <Content>
              {mensagem.texto}
            </Content>
            <Metadata>
              <span>{moment(mensagem.criadaEm).format('HH:mm')}</span>
              {isMe && this.getStatusVisibility(mensagem)}
            </Metadata>
          </Container>
          {!!mensagem.anexos && !!mensagem.anexos.length && (
            <ExpansionPanel className={classes.expansionPanel}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon className={classes.expansionIcon} />}
              >
                <Typography className={classes.expansionTitle} variant="caption" color="textSecondary">Ver anexos</Typography>
                {!!mensagem.anexos && mensagem.anexos.length >= 2 && (
                  <IconButton
                    onClick={this.handleDownloadTodosAnexos}
                  >
                    <SaveAltIcon className={classes.expansionIcon} />
                  </IconButton>
                )}
              </ExpansionPanelSummary>
              <ExpansionPanelDetails
                className={classes.expansionPanelDetails}
              >
                {mensagem.anexos.map(anexo => (
                  <AnexoButton
                    key={anexo.id || +new Date(anexo.criadoEm)}
                    onClick={() => this.handleDownloadAnexo(anexo)}
                  >
                    {this.getAnexoNome(anexo.nome)}
                  </AnexoButton>
                ))}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )}
        </Wrapper>
      </>
    );
  }
}

export default withStyles(Material)(ItemMensagem);
