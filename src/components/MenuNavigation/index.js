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
  const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));

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

        {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR, MEDICO) && (
          <Fragment>
            <ListItem
              button
              onClick={() => onCollapse('medicos')}
            >
              <ListItemIcon>
                <Tooltip
                  title="Médicos"
                  placement="right"
                  disableHoverListener={isOpen}
                  disableFocusListener={isOpen}
                >
                  <SupervisedUserCircleIcon size={iconSize} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Médicos" />
              {renderIconCollapse('medicos')}
            </ListItem>
            <Collapse in={collapse.medicos} timeout="auto">
              <List component="div" disablePadding>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/medicos`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/medicos/agenda` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Agenda"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <AssignmentIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Agenda" />
                </ListItem>
              </List>
            </Collapse>
          </Fragment>
        )}

        {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR, RECEPCAO, MEDICO) && (
          <Fragment>
            <ListItem
              button
              onClick={() => onCollapse('agendas')}
            >
              <ListItemIcon>
                <Tooltip
                  title="Agendas"
                  placement="right"
                  disableHoverListener={isOpen}
                  disableFocusListener={isOpen}
                >
                  <CalendarTodayIcon size={iconSize} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Agendas" />
              {renderIconCollapse('agendas')}
            </ListItem>
            <Collapse in={collapse.agendas} timeout="auto">
              <List component="div" disablePadding>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/agendas`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/agendas` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Consultas"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <EventAvailableIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Consultas" />
                </ListItem>

                {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR) && (
                  <Fragment>
                    <ListItem
                      button
                      selected={location.pathname === `${match.url}/agendas/grade-horario`}
                      className={classes.nested}
                      component={React.forwardRef((nestedProps, ref) => (
                        <Link
                          {...nestedProps}
                          ref={ref}
                          component={AdapterRouterLink}
                          to={{ pathname: `${match.url}/agendas/grade-horario` }}
                        >
                          {nestedProps.children}
                        </Link>
                      ))}
                    >
                      <ListItemIcon>
                        <Tooltip
                          title="Grade de horário"
                          placement="right"
                          disableHoverListener={isOpen}
                          disableFocusListener={isOpen}
                        >
                          <ScheduleIcon size={iconSize} />
                        </Tooltip>
                      </ListItemIcon>
                      <ListItemText primary="Grade de horário" />
                    </ListItem>


                    <ListItem
                      button
                      selected={location.pathname === `${match.url}/agendas/bloqueios`}
                      className={classes.nested}
                      component={React.forwardRef((nestedProps, ref) => (
                        <Link
                          {...nestedProps}
                          ref={ref}
                          component={AdapterRouterLink}
                          to={{ pathname: `${match.url}/agendas/bloqueios` }}
                        >
                          {nestedProps.children}
                        </Link>
                      ))}
                    >
                      <ListItemIcon>
                        <Tooltip
                          title="Bloqueios"
                          placement="right"
                          disableHoverListener={isOpen}
                          disableFocusListener={isOpen}
                        >
                          <BlockIcon size={iconSize} />
                        </Tooltip>
                      </ListItemIcon>
                      <ListItemText primary="Bloqueios" />
                    </ListItem>
                  </Fragment>
                )}
              </List>
            </Collapse>
          </Fragment>
        )}

        {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR) && (
          <ListItem
            button
            selected={location.pathname === `${match.url}/pacientes`}
            component={React.forwardRef((nestedProps, ref) => (
              <Link
                {...nestedProps}
                ref={ref}
                component={AdapterRouterLink}
                to={{ pathname: `${match.url}/pacientes` }}
              >
                {nestedProps.children}
              </Link>
            ))}
          >
            <ListItemIcon>
              <Tooltip
                title="Pacientes"
                placement="right"
                disableHoverListener={isOpen}
                disableFocusListener={isOpen}
              >
                <ContactPhoneIcon size={iconSize} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText primary="Pacientes" />
          </ListItem>
        )}

        {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR) && (
          <ListItem
            button
            selected={location.pathname === `${match.url}/convenios`}
            component={React.forwardRef((nestedProps, ref) => (
              <Link
                {...nestedProps}
                ref={ref}
                component={AdapterRouterLink}
                to={{ pathname: `${match.url}/convenios` }}
              >
                {nestedProps.children}
              </Link>
            ))}
          >
            <ListItemIcon>
              <Tooltip
                title="Convênios"
                placement="right"
                disableHoverListener={isOpen}
                disableFocusListener={isOpen}
              >
                <CardMembershipIcon size={iconSize} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText primary="Convênios" />
          </ListItem>
        )}

        {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR) && (
          <Fragment>
            <ListItem
              button
              onClick={() => onCollapse('eventosGrupos')}
            >
              <ListItemIcon>
                <Tooltip
                  title="Eventos e grupos"
                  placement="right"
                  disableHoverListener={isOpen}
                  disableFocusListener={isOpen}
                >
                  <EventIcon size={iconSize} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Eventos/Grupos" />
              {renderIconCollapse('eventosGrupos')}
            </ListItem>
            <Collapse in={collapse.eventosGrupos} timeout="auto">
              <List component="div" disablePadding>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/evento`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/evento` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Gestão"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <EditIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Gestão" />
                </ListItem>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/evento/registro-convenio`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/evento/registro-convenio` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Códigos dos eventos"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <CardMembershipIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Códigos dos eventos" />
                </ListItem>

              </List>
            </Collapse>
          </Fragment>
        )}

        {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR, FINANCEIRO) && (
          <Fragment>
            <ListItem
              button
              onClick={() => onCollapse('financeiro')}
            >
              <ListItemIcon>
                <Tooltip
                  title="Financeiro"
                  placement="right"
                  disableHoverListener={isOpen}
                  disableFocusListener={isOpen}
                >
                  <AccountBalanceWalletIcon size={iconSize} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Financeiro" />
              {renderIconCollapse('financeiro')}
            </ListItem>
            <Collapse in={collapse.financeiro} timeout="auto">
              <List component="div" disablePadding>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/cobrancas`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/cobrancas` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Cobranças"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <StyleIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Cobranças" />
                </ListItem>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/faturas`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/faturas` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Faturas"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <ReceiptIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Faturas" />
                </ListItem>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/contas`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/contas` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Contas"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <AccountTreeIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Contas" />
                </ListItem>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/condicoes-pagamento`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/condicoes-pagamento` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Condições de Pagamento"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <PaymentIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Condições de Pagamento" />
                </ListItem>

              </List>
            </Collapse>
          </Fragment>
        )}

        {hasPermission(ADMINISTRADOR_GLOBAL, ADMINISTRADOR) && (

        <ListItem
          button
          selected={location.pathname === `${match.url}/auditorias`}
          component={React.forwardRef((nestedProps, ref) => (
            <Link
              {...nestedProps}
              ref={ref}
              component={AdapterRouterLink}
              to={{ pathname: `${match.url}/auditorias` }}
            >
              {nestedProps.children}
            </Link>
          ))}
        >
          <ListItemIcon>
            <Tooltip
              title="Auditoria"
              placement="right"
              disableHoverListener={isOpen}
              disableFocusListener={isOpen}
            >
              <VerifiedUserIcon size={iconSize} />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary="Auditoria" />
        </ListItem>
        )}

        {hasPermission(ADMINISTRADOR_GLOBAL) && (
          <Fragment>
            <ListItem
              button
              onClick={() => onCollapse('config')}
            >
              <ListItemIcon>
                <Tooltip
                  title="Configurações"
                  placement="right"
                  disableHoverListener={isOpen}
                  disableFocusListener={isOpen}
                >
                  <SettingsIcon size={iconSize} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Configurações" />
              {renderIconCollapse('config')}
            </ListItem>
            <Collapse in={collapse.config} timeout="auto">
              <List component="div" disablePadding>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/empresa/novo`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/empresa/novo` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Nova empresa"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <BusinessIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Nova empresa" />
                </ListItem>

                <ListItem
                  button
                  selected={location.pathname === `${match.url}/empresa/unidade/novo`}
                  className={classes.nested}
                  component={React.forwardRef((nestedProps, ref) => (
                    <Link
                      {...nestedProps}
                      ref={ref}
                      component={AdapterRouterLink}
                      to={{ pathname: `${match.url}/empresa/unidade/novo` }}
                    >
                      {nestedProps.children}
                    </Link>
                  ))}
                >
                  <ListItemIcon>
                    <Tooltip
                      title="Unidades"
                      placement="right"
                      disableHoverListener={isOpen}
                      disableFocusListener={isOpen}
                    >
                      <CardMembershipIcon size={iconSize} />
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText primary="Unidades" />
                </ListItem>

              </List>
            </Collapse>
          </Fragment>
        )}


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
