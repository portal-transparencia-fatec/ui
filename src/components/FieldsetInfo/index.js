import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import Material from './styles';

const FieldsetInfo = ({
  classes,
  label,
  info,
  uppercase,
  item,
  gridProps,
}) => (
  <Grid {...gridProps} item={item} container direction="column" alignItems="stretch">
    <Typography className={classnames(classes.label, { [classes.uppercase]: uppercase })} component="fieldset">
      {label}
    </Typography>
    <Typography className={classnames(classes.info, { [classes.uppercase]: uppercase })} component="fieldset">
      {info}
    </Typography>
  </Grid>
);

FieldsetInfo.defaultProps = {
  uppercase: true,
  item: false,
  info: '',
  gridProps: {},
};

FieldsetInfo.propTypes = {
  uppercase: PropTypes.bool,
  item: PropTypes.bool,
  gridProps: PropTypes.shape({}),
  label: PropTypes.string.isRequired,
  info: PropTypes.string,
};

export default withStyles(Material)(FieldsetInfo);
