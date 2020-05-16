import React from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import ModalSelect from '../../../../../components/ModalSelect';
import { InputFormatHora, InputFormatData } from '../../../../../components/InputFormat';

import Material from '../../styles';

const FormDataEspecifica = ({
  classes,
  medicos,
  convenios,
  eventos,
  gruposEvento,
  values,
  errors,
  handleChange,
  handleSubmit,
  isSubmitting,
  setFieldValue,
}) => (
  <form className={classes.form} onSubmit={handleSubmit}>
    <Grid container spacing={2} direction="row" justify="space-between" alignItems="flex-end">
      <Grid item xs={12} sm={12} md={4} lg={4}>
        <ModalSelect
          label="Médico*"
          error={!!errors.medico}
          empty="Carregando..."
          placeholderFilter="Filtrar médicos..."
          value={values.medico}
          options={medicos.map(({ id, nome }) => ({ id, label: nome }))}
          onChange={value => setFieldValue('medico', value)}
          textfieldProps={{
            variant: 'outlined',
            fullWidth: true,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <TextField
          error={!!errors.dataEspecificaInicial}
          name="dataEspecificaInicial"
          label="Data inicial"
          value={values.dataEspecificaInicial}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          InputProps={{
            inputComponent: InputFormatData,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <TextField
          error={!!errors.dataEspecificaFinal}
          name="dataEspecificaFinal"
          label="Data final"
          value={values.dataEspecificaFinal}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          InputProps={{
            inputComponent: InputFormatData,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={4} lg={4}>
        <ModalSelect
          multiple
          label="Convênios"
          error={!!errors.convenios}
          placeholderFilter="Filtrar convênios..."
          value={values.convenios}
          options={convenios.map(({ id, razaoSocial }) => ({ id, label: razaoSocial }))}
          onChange={value => setFieldValue('convenios', value)}
          textfieldProps={{
            variant: 'outlined',
            fullWidth: true,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={2} lg={2}>
        <TextField
          error={!!errors.horaInicial}
          name="horaInicial"
          label="Horário inicial (hh:mm)"
          value={values.horaInicial}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          InputProps={{
            inputComponent: InputFormatHora,
          }}
        />
      </Grid>
      <Grid container item xs={12} sm={4} md={2} lg={2} direction="row" alignItems="flex-end">
        <TextField
          error={!!errors.horaFinal}
          name="horaFinal"
          label="Horário final (hh:mm)"
          value={values.horaFinal}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          InputProps={{
            inputComponent: InputFormatHora,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={2} lg={2}>
        <TextField
          error={!!errors.duracao}
          name="duracao"
          label="Duração (hh:mm)"
          value={values.duracao}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          InputProps={{
            inputComponent: InputFormatHora,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <ModalSelect
          label="Eventos"
          multiple
          error={!!errors.eventos}
          empty="Nenhum evento encontrado..."
          placeholderFilter="Filtrar eventos..."
          value={values.eventos}
          options={eventos.map(({ id, descricao }) => ({ id, label: descricao }))}
          onChange={value => setFieldValue('eventos', value)}
          textfieldProps={{
            variant: 'outlined',
            fullWidth: true,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <ModalSelect
          label="Grupo de Eventos"
          multiple
          error={!!errors.grupos}
          empty="Nenhum grupo encontrado..."
          placeholderFilter="Filtrar grupos..."
          value={values.grupos}
          options={gruposEvento.map(({ id, descricao }) => ({ id, label: descricao }))}
          onChange={value => setFieldValue('grupos', value)}
          textfieldProps={{
            variant: 'outlined',
            fullWidth: true,
          }}
        />
      </Grid>
    </Grid>
    <Grid className={classes.containerButton} container spacing={2} direction="row" justify="space-between">
      <Grid item xs={6} sm={6} md={6} lg={6}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          type="submit"
          disabled={isSubmitting}
          onClick={() => setFieldValue('action', 'pesquisar')}
        >
              Pesquisar
        </Button>
      </Grid>
      <Grid item xs={6} sm={6} md={6} lg={6}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          type="submit"
          disabled={isSubmitting}
          onClick={() => setFieldValue('action', 'salvar')}
        >
              Salvar
        </Button>
      </Grid>
    </Grid>
  </form>
);

FormDataEspecifica.defaultProps = {
  values: {
    medico: '',
    dataEspecificaInicial: '',
    dataEspecificaFinal: '',
    convenio: '',
    horaInicial: '',
    horaFinal: '',
    duracao: '',
    eventos: [],
    grupos: [],
  },
  errors: {},
  handleChange: () => {},
  handleSubmit: () => {},
  isSubmitting: false,
  convenios: [],
  medicos: [],
  eventos: [],
  gruposEvento: [],
};

FormDataEspecifica.propTypes = {
  values: PropTypes.shape({
    medico: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataEspecificaInicial: PropTypes.string,
    dataEspecificaFinal: PropTypes.string,
    convenio: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      nome: PropTypes.string,
    })),
    eventos: PropTypes.arrayOf(PropTypes.number),
    grupos: PropTypes.arrayOf(PropTypes.number),
    horaInicial: PropTypes.string,
    horaFinal: PropTypes.string,
    duracao: PropTypes.string,
  }),
  errors: PropTypes.shape({}),
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  convenios: PropTypes.arrayOf(PropTypes.shape({})),
  medicos: PropTypes.arrayOf(PropTypes.shape({})),
  eventos: PropTypes.arrayOf(PropTypes.shape({})),
  gruposEvento: PropTypes.arrayOf(PropTypes.shape({})),
};

export default withStyles(Material)(FormDataEspecifica);
