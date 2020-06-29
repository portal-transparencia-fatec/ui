import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PermissionRoute = ({
  component: Component,
  permissions: routePermissions,
  ...rest
}) => {
  // const usuario = JSON.parse(localStorage.getItem('@:usuario'));
  // const { location } = rest;

  // if (!usuario && !location.pathname.includes('/app')) {
  //   return (
  //     <Route
  //       {...rest}
  //       render={props => <Component {...props} />}
  //     />
  //   );
  // }

  // const { permissoes: userPermissions } = usuario;

  // if (!routePermissions || routePermissions.length === 0) {
  //   return (
  //     <Route
  //       {...rest}
  //       render={props => <Component {...props} />}
  //     />
  //   );
  // }

  // const isAllowed = routePermissions.some(routePermission => userPermissions
  //   .some(userPermission => routePermission === userPermission.nome));

  // if (isAllowed) {
  //   return (
  //     <Route
  //       {...rest}
  //       render={props => <Component {...props} permissions={routePermissions} />}
  //     />
  //   );
  // }

  return (
    <Route
      {...rest}
      render={props => <Component {...props} />}
    />
    // <Route
    //   {...rest}
    //   render={props => <Redirect to={{ pathname: '/app', state: { from: props.location } }} />}
    // />
  );
};

export default PermissionRoute;
