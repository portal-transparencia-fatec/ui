import React from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import LinearProgress from '@material-ui/core/LinearProgress';

import Material from './styles';

function LoadingIndicator({ loading, ...rest }) {
  if (!loading) {
    return null;
  }

  return <LinearProgress classes={{ root: rest.classes.root }} color="secondary" {...rest} />;
}

LoadingIndicator.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default withStyles(Material)(LoadingIndicator);
