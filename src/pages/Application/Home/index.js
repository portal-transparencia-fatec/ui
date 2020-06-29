/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-undef */
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import ApexCharts from 'apexcharts';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {
  RootRef,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import moment from 'moment';
import {
  telFormatter,
  celFormatter,
} from '../../../libs/utils';

import NotificationActions from '../../../store/ducks/notifier';
import Material, { GridImage, GridImage2 } from './styles';
import { Container } from '../../../styles/global';

class Home extends Component {
  state = {
    loading: false,
  }
  
  componentDidMount() {

  }

  render() {
    const { loading } = this.state;
    return (
      <Grid>
        <LoadingIndicator loading={loading} />
        
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isMenuOpen: state.user.isMenuOpen,
  };
};

// const mapDispatchToProps = dispatch => ({
//   notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
// });

export default compose(
  connect(mapStateToProps, null),
  withStyles(Material, { withTheme: true }),
)(Home);
