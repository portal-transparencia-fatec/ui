/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

class TabPanel extends Component {
  render() {
    const { children, value, index, ...other } = this.props;
    return (
      <Typography
        component="div"
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        <Box>{children}</Box>
      </Typography>
    );
  }
}

export default TabPanel;
