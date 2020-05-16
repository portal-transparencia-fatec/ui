/* eslint-disable react/no-find-dom-node */
import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';

import Material from '../../styles';

let refSelectEvento = null;

const FormGrupoEvento = ({
  eventos,
  classes,
  values,
  errors,
  handleSubmit,
  setFieldValue,
  isSubmitting,
  handleChange,
  grupoEvento,
  onCancel,
}) => (
  <form className={classes.form} onSubmit={handleSubmit}>
    <Typography variant="body1" component="p">
      Preencha o campo abaixo para salvar um grupo de eventos
    </Typography>
    <Grid container spacing={2} direction="row" alignItems="center">
      <Grid item sm={12} md={6} lg={6}>
        <TextField
          error={!!errors.descricao}
          name="descricao"
          type="text"
          label="Descrição*"
          value={values.descricao}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          fullWidth
        />
      </Grid>

      <Grid item sm={10} md={4} lg={4}>
        <FormControl
          name="eventos"
          error={!!errors.eventos}
          variant="outlined"
          margin="normal"
          fullWidth
        >
          <InputLabel
            htmlFor="eventos"
            ref={(ref) => {
              refSelectEvento = findDOMNode(ref);
            }}
          >
            Eventos*
          </InputLabel>
          <Select
            multiple
            displayEmpty
            name="eventos"
            value={values.eventos}
            onChange={event => setFieldValue('eventos', event.target.value)}
            input={<OutlinedInput fullWidth labelWidth={refSelectEvento ? refSelectEvento.offsetWidth : 0} id="eventos" />}
            renderValue={selected => selected.map(evento => evento.descricao).join(', ')}
            variant="outlined"
          >
            {eventos.map(evento => (
              <MenuItem key={evento.id} value={evento}>
                <Checkbox
                  color="primary"
                  checked={
                    values.eventos.some(eventoSelecionado => evento.id === eventoSelecionado.id)
                  }
                />
                <ListItemText primary={evento.descricao} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item sm={2} md={2} lg={2}>
        <FormGroup row>
          <FormControlLabel
            control={(
              <Switch
                checked={values.ativo}
                name="ativo"
                onChange={handleChange}
                color="primary"
                value="bool"
              />
            )}
            label={values.ativo ? 'Ativo' : 'Inativo'}
          />
        </FormGroup>
      </Grid>
    </Grid>
    {!!grupoEvento.id && (
      <Button
        variant="contained"
        color="default"
        type="button"
        onClick={onCancel}
        style={{ marginBottom: 16 }}
      >
        Cancelar alteração
      </Button>
    )}
    <Button
      fullWidth
      variant="contained"
      color="secondary"
      type="submit"
      disabled={isSubmitting}
    >
      Salvar
    </Button>
  </form>
);

FormGrupoEvento.defaultProps = {
  eventos: [],
};

FormGrupoEvento.propTypes = {
  eventos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    descricao: PropTypes.string,
    ativo: PropTypes.bool,
  })),
};

export default withStyles(Material)(FormGrupoEvento);
