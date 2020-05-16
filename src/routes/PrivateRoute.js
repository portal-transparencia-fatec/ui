import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { connect } from 'react-redux';

const PrivateRoute = ({
  component: Component,
  isLogged,
  render,
  children,
  ...rest
}) => {
  if (!isLogged) {
    return (
      <Route
        {...rest}
        render={props => <Redirect to={{ pathname: '/app', state: { from: props.location } }} />}
      />
    );
  }

  if (render && typeof render === 'function') {
    return (
      <Route
        {...rest}
        render={props => render({ isLogged, ...{ ...rest, ...props } })}
      />
    );
  }

  if (children && typeof children === 'function') {
    return (
      <Route
        {...rest}
        render={props => children({ isLogged, ...{ ...rest, ...props } })}
      />
    );
  }

  return (
    <Route
      {...rest}
      render={props => <Component {...{ ...props, isLogged }} />}
    />
  );
};

const mapStateToProps = ({ user }) => ({
  isLogged: user.isLogged,
  isSinging: user.isSinging,
});

export default connect(mapStateToProps)(PrivateRoute);
