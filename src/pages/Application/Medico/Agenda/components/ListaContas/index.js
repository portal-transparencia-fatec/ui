/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-no-duplicate-props */
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';

import {
  formataDinheiro,
} from '../../../../../../libs/utils';
import 'react-vertical-timeline-component/style.min.css';
import NotificationActions from '../../../../../../store/ducks/notifier';
import Material from './styles';
import '../../../../../../assets/css/Dropzone.css';

class ListaContas extends Component {
  renderLancamentos = () => {
    const {
      conta: { lancamentos },
    } = this.props;

    return lancamentos.map(lancamento => (
      <div
        style={{ margin: 5 }}
      >
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          position={(!lancamento.entrada ? 'right' : 'left')}
          date={<strong className={classes.tableCell} style={{ color: '#666', margin: 10 }}>{moment(lancamento.data).format('DD/MM/YYYY [às] HH[h]mm')}</strong>}
          iconStyle={(lancamento.entrada ? { color: '#61bd4f', backgroundColor: '#C6D880' } : { color: '#FBC2C4', backgroundColor: '#eb2f37' })}
          icon={<AttachMoneyIcon />}
        >
          <h4
            className="vertical-timeline-element-title"
            style={{
              justifyContent: 'center',
              alignItems: 'stretch',
              alignSelf: 'center',
            }}
          >
            <center style={{ float: 'center' }}>{`${(lancamento.descricao).toUpperCase()}`}</center>
            <center><strong style={(lancamento.entrada ? { color: '#61bd4f' } : { color: '#ff0000' })}>{formataDinheiro(lancamento.valor)}</strong></center>
          </h4>
        </VerticalTimelineElement>
      </div>
    ));
  }

  render() {
    const {
      classes,
      conta,
      openModalContas,
    } = this.props;

    return (
      <Fragment>
        {openModalContas === true && conta && (
        <Grid
          container
          style={{
            margin: '4px',
            justifyContent: 'center',
            alignItems: 'stretch',
            alignSelf: 'center',
          }}
        >
          <Grid item sm={12} md={12} lg={12}>
            <Grid container spacing={1} direction="row" sm={12} md={12} lg={12} className={classes.paper}>
              {conta.lancamentos.length ? (
                <Grid item sm={12} md={12} lg={12}>
                  <Grid item sm={12} md={12} lg={12} className={classes.paper} style={{ backgroundColor: '#e1e1e1' }}>
                    <VerticalTimeline>
                      {this.renderLancamentos()}
                    </VerticalTimeline>
                  </Grid>
                </Grid>
              ) : (
                <Grid container sm={12} md={12} lg={12} direction="row" className={classes.paper} style={{ backgroundColor: '#e1e1e1', minHeight: '87vh' }}>
                  <Grid
                    item
                    sm={12}
                    md={12}
                    lg={12}
                    style={{
                      margin: 5,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      fullWidth
                      component="h2"
                      variant="body1"
                      align="center"
                      style={{
                        color: '#0662a1',
                        fontWeight: 900,
                      }}
                    >
                      NENHUM LANÇAMENTO FOI REALIZADO NESTA CONTA.
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const unidadeAtual = state.user.unidades.find(unid => unid.current);

  return {
    unidade: unidadeAtual.unidade || {},
    isChatOpen: state.chat.isVisible,
  };
};

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Material, { withTheme: true }),
)(ListaContas);
