import React, { Suspense } from 'react';
import {
  Route, Switch, Redirect,
} from 'react-router-dom';
import CustomRoute from './CustomRoute';

import PrivateRoute from './PrivateRoute';
import Notifier from '../components/Notifier';
import ErrorBoundary from '../components/ErrorBoundary';
import Loading from '../pages/Application/Loading';
import Application from '../pages/Application';

const Routes = () => (
  <>
    <Notifier />
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Switch>
          <PrivateRoute path="/app" component={Application} />
          <Route render={() => <Redirect to="/app" />} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  </>
);

export default Routes;
