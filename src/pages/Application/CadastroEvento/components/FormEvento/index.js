/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import NumberFormat from 'react-number-format';
import { InputFormatHora } from '../../../../../components/InputFormat';
import ModalSelect from '../../../../../components/ModalSelect';
import Material from '../../styles';

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.floatValue,
          },
        });
      }}
      decimalSeparator=","
      thousandSeparator="."
      allowNegative="false"
      prefix="R$"
    />
  );
}

class FormEvento extends Component {
  state ={
    optionsDisplay: [
      'CONSULTA',
      'EXAME',
      'RETORNO',
      'CIRURGIA',
    ],
  }


  render() {
    const {
      classes,
      values,
      errors,
      handleSubmit,
      setFieldValue,
      isSubmitting,
      handleChange,
      onCancel,
      evento,
    } = this.props;

    const {
      optionsDisplay,
    } = this.state;

    return (
      <form className={classes.form} onSubmit={handleSubmit}>
        <Typography variant="body1" component="p">
      Preencha os campos abaixo para salvar um evento
        </Typography>
        <Grid container spacing={2} direction="row" alignItems="center">
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <ModalSelect
              label="Tipo de evento*"
              placeholderFilter="Filtrar..."
              error={!!errors.tipoEvento}
              value={values.tipoEvento}
              onChange={value => setFieldValue('tipoEvento', value)}
              options={optionsDisplay.map(option => ({
                id: option,
                label: option,
              }))}
              textfieldProps={{
                variant: 'outlined',
                fullWidth: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6}>
            <TextField
              fullWidth
              label="Valor*"
              variant="outlined"
              error={!!errors.valorPadrao}
              value={values.valorPadrao}
              onChange={({ target }) => setFieldValue('valorPadrao', target.value)}
              InputProps={{
                inputComponent: NumberFormatCustom,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={8} lg={8}>
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
          <Grid item xs={10} sm={3} md={3} lg={3}>
            <TextField
              name="duracao"
              label="Duração (hh:mm)"
              value={values.duracao}
              onChange={handleChange}
              error={!!errors.duracao}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                inputComponent: InputFormatHora,
              }}
            />
          </Grid>
          <Grid item xs={2} sm={1} md={1} lg={1}>
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
        {!!evento.id && (
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
  }
}

export default withStyles(Material)(FormEvento);
