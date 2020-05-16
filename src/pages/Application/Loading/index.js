import React from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
// import CircularProgress from '@material-ui/core/CircularProgress';

// import Icon from '@mdi/react';
import {
  mdiReload,
} from '@mdi/js';

import { Container, AnimatedIcon } from './styles';

function Loading({ theme, children }) {
  if (children) {
    return children;
  }

  return (
    <Container>
      {/* <CircularProgress size={70} color="primary" /> */}
      <AnimatedIcon
        path={mdiReload}
        size="128px"
        color={theme.palette.primary.main}
      />
    </Container>
  );
}

export default withStyles(null, { withTheme: true })(Loading);
