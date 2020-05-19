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
    page: 1,
    episodios: [],
  }

  componentDidMount() {
    const { page } = this.state;

    let tableBodyNode = ReactDOM.findDOMNode(this.refs["table-body"]).parentNode.parentNode;

    tableBodyNode.addEventListener('scroll', async (e) => {
      console.log(tableBodyNode.scrollHeight)
      var scrollTop = tableBodyNode.scrollTop;
      var scrollHeight = tableBodyNode.scrollHeight; // added
      var offsetHeight = tableBodyNode.offsetHeight;
      // var clientHeight = document.getElementById('box').clientHeight;
      var contentHeight = scrollHeight - offsetHeight; // added
      if (contentHeight <= scrollTop) // modified
      {
        this.fetchFeed()
      }
    });

    this.fetchFeed()
  }

  fetchFeed = async () => {
    const { page, episodios } = this.state;

    try {
      await this.setState({ loading: true, page: page + 1 })
      const data = await KatsukaiService.getFeed(page)
      this.setState({ episodios: [...episodios, ...data] })
    } catch (err) {
      
    } finally {
      this.setState({ loading: false })
    }
  }

  renderEpisodioAnime = (episodio) => {
    const { classes, isMenuOpen } = this.props;

    return (
      <Grid container direction="row" sm={12} md={12} lg={isMenuOpen ? 3 : 2} style={{  border: '10px solid #000', height: '46vh', overflow: 'hidden', backgroundColor: '#212121', borderRadius: 15, cursor: 'pointer' }}>
        <Grid item sm={12} lg={12} md={12}>
          <GridImage urlImage={`https://goyabu.com/${episodio.img}`}>
            <GridImage2>
            </GridImage2>
          </GridImage>
        </Grid>
      
        <Grid item sm={12} lg={12} md={12} style={{ height: '18vh', display: 'flex', flexDirection: 'column',  justifyContent: 'flex-end' }}>
          <Grid item sm={12} lg={12} md={12} style={{ minHeight: '13vh', display: 'flex', fontSize: isMenuOpen ? '1vw' : '0.8vw', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: '#d0d0d0', wordWrap: 'break-all', overflow: 'hidden', marginLeft: '1vw' }}>
            {episodio.title}
          </Grid>
      
          <Grid item sm={12} lg={12} md={12} style={{ height: '3vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#909090', whiteSpace: 'nowrap', fontSize: isMenuOpen ? '0.85vw' : '0.75vw' }}>
            {episodio.views} &bull; {episodio.createdAt}
          </Grid>}
        </Grid>
      </Grid>  
    )
  } 
  



  render() {
    const { episodios, loading } = this.state;
    return (
      <Grid ref="table-body">
        <LoadingIndicator loading={loading} />
        <Grid container sm={12} lg={12} md={12} direction="row" wrap="wrap">
          {episodios.map(episodio => this.renderEpisodioAnime(episodio))}
        </Grid>
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
