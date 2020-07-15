/* eslint-disable react/no-multi-comp */
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter, NavLink as RouterLink } from 'react-router-dom';
import classnames from 'classnames';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PaymentIcon from '@material-ui/icons/Payment';
import PeopleIcon from '@material-ui/icons/People';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import BusinessIcon from '@material-ui/icons/Business';
import SettingsIcon from '@material-ui/icons/Settings';
import EditIcon from '@material-ui/icons/Edit';
import CardMembershipIcon from '@material-ui/icons/CardMembership';
import EventIcon from '@material-ui/icons/Event';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import BlockIcon from '@material-ui/icons/Block';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import StyleIcon from '@material-ui/icons/Style';
import {
  ADMINISTRADOR_GLOBAL,
  ADMINISTRADOR,
  FINANCEIRO,
  RECEPCAO,
  MEDICO,
} from '../../libs/permissoes';

import UsuarioActions from '../../store/ducks/usuario';

import Material from './styles';

const AdapterRouterLink = React.forwardRef((props, ref) => (
  <RouterLink innerRef={ref} {...props} />
));

const iconSize = 28;

/**
 * Função que valida se o usuário possui permissões
 */
const hasPermission = (...menuPermissions) => {
  const usuario = JSON.parse(localStorage.getItem('@:usuario'));

  if (!usuario) {
    return false;
  }

  const { permissoes: userPermissions } = usuario;

  if (!menuPermissions || menuPermissions.length === 0) {
    return true;
  }

  return menuPermissions.some(menuPermission => userPermissions
    .some(userPermission => menuPermission === userPermission.nome));
};

const MenuNavigation = ({
  classes,
  location,
  match,
  signout,
  isOpen,
}) => {
  /**
   * States que lida com os submenus colapsáveis
   */
  const [collapse, toggleCollapse] = useState({
    medicos: false,
    agendas: false,
    eventosGrupos: false,
    financeiro: false,
    config: false,
  });

  /**
   * Realiza o collapse de acordo com a propriedade passada (field)
   */
  const onCollapse = field => toggleCollapse({
    ...collapse,
    [field]: !collapse[field],
  });

  const renderIconCollapse = field => (
    collapse[field] ? (
      <ExpandLessIcon size={iconSize} />
    ) : (
      <ExpandMoreIcon size={iconSize} />
    )
  );

  return (
    <Fragment>
      <List className={classes.nav} component="nav">
        <ListItem
          button
          selected={location.pathname === `${match.url}/usuarios`}
          component={React.forwardRef((props, ref) => (
            <Link
              {...props}
              ref={ref}
              component={AdapterRouterLink}
              to={{ pathname: `${match.url}/usuarios` }}
            >
              {props.children}
            </Link>
          ))}
        >
          <ListItemIcon>
            <Tooltip
              title="Menu"
              placement="right"
              disableHoverListener={isOpen}
              disableFocusListener={isOpen}
            >
              <PeopleIcon size={iconSize} />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary="Usuários" className={classes.listText} />
        </ListItem>
      </List>

      <Button onClick={signout} className={classes.buttonLogoff}>
        <ExitToAppIcon className={classnames({
          [classes.iconSignout]: isOpen,
        })}
        />
        {isOpen ? 'Sair' : ''}
      </Button>

    </Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  signout: () => dispatch(UsuarioActions.signout()),
});

export default compose(
  connect(null, mapDispatchToProps),
  withRouter,
  withStyles(Material),
)(MenuNavigation);


withRouter(withStyles(Material)(MenuNavigation));
