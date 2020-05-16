import React from 'react';
import { connect } from 'react-redux';
import PermissionRoute from './PermissionRoute';
import AppConfigActions from '../store/ducks/app-config';
import { getPageTitle } from '../libs/utils';

class CustomRoute extends React.Component {
  componentDidMount() {
    this.setRouterTitle();
  }

  componentDidUpdate(prevProps) {
    const { routeTitle } = this.props;

    if (prevProps.routeTitle !== routeTitle) {
      this.setRouterTitle();
    }
  }

  setRouterTitle = () => {
    const { setRouterTitle } = this.props;

    setRouterTitle();
  }

  render() {
    const { component: Component, routeTitle, ...rest } = this.props;
    document.title = getPageTitle(routeTitle);

    return (
      <PermissionRoute
        {...rest}
        component={Component}
      />
    );
  }
}

const mapDispatchToProps = (dispatch, { routeTitle }) => ({
  setRouterTitle: () => dispatch(AppConfigActions.setRouterTitle(routeTitle || '')),
});

export default connect(null, mapDispatchToProps)(CustomRoute);
