/* eslint-disable max-len */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable func-names */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-return-assign */
/* eslint-disable react/no-array-index-key */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classnames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import Icon from '@mdi/react';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import {
  mdiWheelchairAccessibility,
  mdiAccountClock,
  mdiAccountCheck,
  mdiCalendarImport,
  mdiCalendarClock,
  mdiCalendarCheck,
} from '@mdi/js';
import { apiS3 as api, rootURL as baseURL } from '../../../../../services/api';
import LabelClin from '../../../../../components/LabelClin';
import iconPaciente from '../../../../../assets/images/iconPaciente.jpg';
import Material from './styles';
import '../../../../../assets/css/Dropzone.css';

const bucketPacienteS3 = process.env.REACT_APP_V2_S3_PACIENTE;

class ListaHorarios extends Component {
  state = {
    preview: null,
    action: {
      showModal: false,
      event: null,
      horarioAgenda: null,
    },
    agenda: {
      desistencia: {
        text: 'DESISTÊNCIA',
        icon: mdiCalendarCheck,
        bgColor: '#8C8C8C',
        textColor: '#000000',
      },
      atendido: {
        text: 'ATENDIDO',
        icon: mdiCalendarCheck,
        bgColor: '#D9D9D9',
        textColor: '#8C8C8C',
      },
      atendimento: {
        text: 'ATENDIMENTO',
        icon: mdiCalendarClock,
        bgColor: '#cc99ff',
        textColor: '#9933ff',
      },
      compareceu: {
        text: 'COMPARECEU',
        icon: mdiCalendarImport,
        bgColor: '#99b3ff',
        textColor: '#1a53ff',
      },
      confirmado: {
        text: 'CONFIRMADO',
        icon: mdiAccountCheck,
        bgColor: '#adebad',
        textColor: '#2eb82e',
      },
      aguardando: {
        text: 'AGUARDANDO',
        icon: mdiAccountClock,
        bgColor: '#ffbb99',
        textColor: '#ff5500',
      },
    },
  }

  static propTypes = {
    horariosAgenda: PropTypes.arrayOf(PropTypes.shape({
      agenda: PropTypes.oneOfType([PropTypes.object, PropTypes.instanceOf(null)]),
      horaInicial: PropTypes.string,
      horaFinal: PropTypes.string,
      data: PropTypes.string,
      startDate: PropTypes.instanceOf(Date),
      endDate: PropTypes.instanceOf(Date),
    })).isRequired,
    onDoubleClickRowHorario: PropTypes.func.isRequired,
    onClickRowHorario: PropTypes.func.isRequired,
  };

  uploadFile = async () => {
    const { preview, action } = this.state;
    try {
      const base64 = await preview.substring(23);
      await api.post(`/imagem/${bucketPacienteS3}/${action.horarioAgenda.agenda.paciente.id}`, {
        base64,
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ action: false });
    }
  }

  formatHorario = hora => moment(hora, 'HH:mm:ss').format('HH:mm')

  onDoubleClickRowHorario = async (event, horarioAgenda) => {
    const { onDoubleClickRowHorario } = this.props;

    /**
     * Valida se a agenda está disponível para agendamento
     */
    if (moment(horarioAgenda.startDate).isBefore(new Date())) {
      return;
    }

    onDoubleClickRowHorario(event, horarioAgenda);
  }

  /**
   * Renderiza o display da situacao da agenda
   * de acordo com o seu status
   */
  onDrop = async (accepted) => {
    const file = accepted[0];
    const $ = this;
    const reader = new FileReader();

    reader.onloadend = function () {
      $.setState({ preview: reader.result });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  addDefaultSrc = (ev) => {
    // eslint-disable-next-line no-param-reassign
    ev.target.src = iconPaciente;
  }

  getPicturePaciente = (horarioAgenda) => {
    const { classes } = this.props;
    const { agenda } = horarioAgenda;
    if (!agenda) {
      return (
        <TableCell className={classes.tableCellPicture} />
      );
    }

    if (agenda.paciente === null) {
      return (
        <TableCell className={classes.tableCellPicture} />
      );
    }
    return (
      <TableCell className={classes.tableCellPicture}>
        <div className="Dropzone">
          <img
            className="Dropzone-img"
            src={`${baseURL}/s3/imagem/${bucketPacienteS3}/${agenda.paciente.id}?${new Date().getTime()}`}
            alt="Icone do Paciente"
            onError={this.addDefaultSrc}
          />
        </div>
      </TableCell>
    );
  }

  getHorarioSituacao = (horarioAgenda, props = undefined) => {
    const { agenda } = this.state;

    if (horarioAgenda.agenda.desistencia) {
      if (!props) {
        return moment(horarioAgenda.agenda.dataDesistencia).format('DD[/]MM [às] HH[h]mm');
      }
      return agenda.desistencia[props];
    }

    if (horarioAgenda.agenda.atendido) {
      if (!props) {
        return moment(horarioAgenda.agenda.dataAtendido).format('DD[/]MM [às] HH[h]mm');
      }
      return agenda.atendido[props];
    }

    if (horarioAgenda.agenda.atendimento) {
      if (!props) {
        return moment(horarioAgenda.agenda.dataAtendimento).format('DD[/]MM [às] HH[h]mm');
      }
      return agenda.atendimento[props];
    }

    if (horarioAgenda.agenda.compareceu) {
      if (!props) {
        return moment(horarioAgenda.agenda.dataComparecimento).format('DD[/]MM [às] HH[h]mm');
      }
      return agenda.compareceu[props];
    }

    if (horarioAgenda.agenda.confirmado) {
      if (!props) {
        return moment(horarioAgenda.agenda.dataConfirmado).format('DD[/]MM [às] HH[h]mm');
      }
      return agenda.confirmado[props];
    }

    if (!props) {
      return props;
    }

    return agenda.aguardando[props];
  }

  onTakePhoto = async (preview) => {
    this.setState({ preview });
  }

  /**
   * Renderiza o corpo da tabela para a View da agenda
   */
  renderHorarios = () => {
    const {
      classes,
      horariosAgenda,
      onClickRowHorario,
    } = this.props;

    /**
     * Mapeando os horarios da agenda para montar as
     * linhs (rows) da tabela
     */
    return horariosAgenda.map((horarioAgenda) => {
      /**
       * Verifica se o horarioAgenda ultrapassou o tempo atual
       */
      const isHoraPassada = moment(horarioAgenda.startDate).isBefore(new Date());
      /**
       * Desabilita o agendamento neste horario se ultrapassou o tempo atual
       * e se o horario não possui agenda
       */
      const desabilitarAgendamento = isHoraPassada && !horarioAgenda.agenda;
      // const tableRowHeight = horarioAgenda.agenda && horarioAgenda.agenda.grupoAgendamento
      //   ? horarioAgenda.agenda.grupoAgendamentoLength * 53
      //   : 53;
      return (
        <Tooltip
          key={`${horarioAgenda.horaInicial}_${horarioAgenda.horaFinal}`}
          title={!horarioAgenda.agenda ? 'Agendar' : 'Visualizar'}
          placement="top"
          enterDelay={600}
          leaveDelay={100}
          disableHoverListener={desabilitarAgendamento}
        >
          {!horarioAgenda.mensagemEditando ? (
            <TableRow
              hover={!desabilitarAgendamento}
              style={{ height: 53 }}
              className={classnames(
                classes.tableRow,
                { [classes.disableRow]: desabilitarAgendamento },
              )}
              // onDoubleClick={event => this.onDoubleClickRowHorario(event, horarioAgenda)}
              onClick={(event) => {
                if (!horarioAgenda.agenda) {
                  return (
                    this.onDoubleClickRowHorario(event, horarioAgenda)

                  );
                }
                onClickRowHorario(event, horarioAgenda);
                // this.onDoubleClickRowHorario(event, horarioAgenda);
                // const action = Object.assign({}, this.state.action, { showModal: true, event, horarioAgenda });
                // return this.setState({ action, preview: null });
              }}
            >

              <TableCell className={classes.tableCellHorarios}>
                {`${this.formatHorario(horarioAgenda.horaInicial)} - ${this.formatHorario(horarioAgenda.horaFinal)}`}
              </TableCell>
              {this.getPicturePaciente(horarioAgenda)}


              {horarioAgenda.agenda ? (
                <>
                  <TableCell className={classes.tableCellLabels}>
                    <LabelClin
                      text={this.getHorarioSituacao(horarioAgenda, 'text')}
                      subText={this.getHorarioSituacao(horarioAgenda)}
                      icon={this.getHorarioSituacao(horarioAgenda, 'icon')}
                      bgColor={this.getHorarioSituacao(horarioAgenda, 'bgColor')}
                      textColor={this.getHorarioSituacao(horarioAgenda, 'textColor')}
                      iconSize="20px"
                    />
                  </TableCell>
                  <TableCell>{horarioAgenda.agenda.nomePaciente}</TableCell>
                  <TableCell>
                    {horarioAgenda.agenda.plano && (
                      `${horarioAgenda.agenda.plano.nome} - ${horarioAgenda.agenda.plano.nomeConvenio}`
                    )}
                  </TableCell>
                  <TableCell>
                    {horarioAgenda.agenda.evento.descricao}
                  </TableCell>
                  <TableCell>
                    {horarioAgenda.agenda.preferencial && (
                      <Tooltip
                        title="Preferencial"
                        placement="left"
                      >
                        <Icon
                          path={mdiWheelchairAccessibility}
                          size="32px"
                          color="#818181"
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>

                    {horarioAgenda.agenda.encaixe && (
                      <Tooltip
                        title="Encaixe"
                        placement="left"
                      >
                        <p className={classes.spanLetterTag}>E</p>
                      </Tooltip>
                    )}
                  </TableCell>
                </>
              ) : (
                <TableCell
                  colSpan={8}
                />
              )}
              {/* {this.getHorarioSituacao(horarioAgenda)} */}
            </TableRow>
          ) : (
            <TableRow
              hover={!desabilitarAgendamento}
              className={classnames(
                classes.tableRow,
                { [classes.disableRow]: desabilitarAgendamento },
              )}
            >
              <TableCell colSpan={8} className={classes.tableCellMensagem}>
                {horarioAgenda.mensagemEditando}
              </TableCell>
            </TableRow>
          )}
        </Tooltip>
      );
    });
  }

  render() {
    const {
      classes, horariosAgenda, dataAgendamento,
    } = this.props;

    return (
      <Fragment>
        {(horariosAgenda.length !== 0)
          ? (
            <Typography align="center" variant="h4">
              {dataAgendamento.format('dddd[, ] DD [de] MMMM [de] YYYY')}
            </Typography>
          )
          : (
            <div />
          )}
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell align="left" className={classes.tableCellHorarios}>Horários</TableCell>
              <TableCell align="left" className={classes.tableCellPicture} />
              <TableCell align="left" className={classes.tableCellLabels}>Situação</TableCell>
              <TableCell align="left">Paciente</TableCell>
              <TableCell align="left">Plano/Convênio</TableCell>
              <TableCell align="left" colSpan={2}>Evento</TableCell>
              <TableCell align="left" colSpan={1} />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderHorarios()}
          </TableBody>
        </Table>
      </Fragment>
    );
  }
}

export default withStyles(Material)(ListaHorarios);
