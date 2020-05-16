import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Formik } from 'formik';

import withStyles from '@material-ui/core/styles/withStyles';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import CloseIcon from '@material-ui/icons/Close';

import ModalSelect from '../../../../../components/ModalSelect';
import NotificationActions from '../../../../../store/ducks/notifier';

import GradeHorarioService from '../../../../../services/GradeHorario';

import Material from './styles';

const DrawerEditar = ({
  classes,
  open,
  handleClose,
  notify,
  convenios,
  eventos,
  gruposEvento,
  gradeHorario,
  onSave,
}) => (
  <Drawer
    classes={{ paper: classes.drawer }}
    anchor="bottom"
    open={open}
    onClose={handleClose}
  >
    {gradeHorario && (
      <Grid container className={classes.drawerContent}>
        <Grid container item sm={12} md={12} lg={12} justify="flex-end">
          <IconButton onClick={handleClose}>
            <CloseIcon color="inherit" />
          </IconButton>
        </Grid>
        <Grid container item sm={12} md={12} lg={12}>
          <Formik
            initialValues={{
              convenios: gradeHorario.convenios.map(({ convenio }) => convenio.id),
              eventos: gradeHorario.eventos.map(({ evento }) => evento.id),
              grupos: gradeHorario.grupos.map(({ grupoEvento }) => grupoEvento.id),
            }}
            enableReinitialize
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const { dados: gradeResponse } = await GradeHorarioService
                  .atualizarHorario(gradeHorario.id, {
                    convenios: values.convenios.length
                      ? values.convenios
                      : undefined,
                    eventos: values.eventos.length
                      ? values.eventos
                      : undefined,
                    grupos: values.grupos.length
                      ? values.grupos
                      : undefined,
                  });
                notify('Grade de horário atualizada', { variant: 'success' });
                onSave(gradeResponse);
                resetForm();
                handleClose();
              } catch (err) {
                if (err.response && err.response.data.mensagem) {
                  notify(err.response.data.mensagem, { variant: 'error' });
                } else {
                  notify('Erro ao atualizar as regras da grade', { variant: 'error' });
                }
              }
              setSubmitting(false);
            }}
            render={props => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item sm={12} md={12} lg={12}>
                    <Typography color="textSecondary">
                      Edite abaixo as regras desta grade
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <ModalSelect
                      label="Eventos*"
                      multiple
                      empty="Nenhum evento encontrado..."
                      placeholderFilter="Filtrar eventos..."
                      value={props.values.eventos}
                      options={eventos.map(({ id, descricao }) => ({ id, label: descricao }))}
                      onChange={value => props.setFieldValue('eventos', value)}
                      textfieldProps={{
                        variant: 'outlined',
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <ModalSelect
                      label="Grupo de Eventos*"
                      multiple
                      empty="Nenhum grupo encontrado..."
                      placeholderFilter="Filtrar grupos..."
                      value={props.values.grupos}
                      options={gruposEvento.map(({ id, descricao }) => ({
                        id,
                        label: descricao,
                      }))}
                      onChange={value => props.setFieldValue('grupos', value)}
                      textfieldProps={{
                        variant: 'outlined',
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4}>
                    <ModalSelect
                      label="Convênios*"
                      multiple
                      empty="Nenhum convênio encontrado..."
                      placeholderFilter="Filtrar convênios..."
                      value={props.values.convenios}
                      options={convenios.map(({ id, nome }) => ({ id, label: nome }))}
                      onChange={value => props.setFieldValue('convenios', value)}
                      textfieldProps={{
                        variant: 'outlined',
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid container item justify="flex-end">
                    <Button
                      color="primary"
                      type="submit"
                      disabled={props.isSubmitting}
                    >
                    Salvar
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          />
        </Grid>
      </Grid>
    )}
  </Drawer>
);

const mapStateToProps = state => ({
  unidadeAtualId: state.user.unidades.length
    ? state.user.unidades.find(unidade => unidade.current).unidade.id
    : undefined,
});

const mapDispatchToProps = dispatch => ({
  notify: (message, options) => dispatch(NotificationActions.notify(message, options)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Material),
)(DrawerEditar);
