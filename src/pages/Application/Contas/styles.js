
import styled from 'styled-components';

export default theme => ({

  cellSaldoPositivo: {
    color: 'rgb(97, 189, 79)',
    fontWeight: 900,
  },

  cellSaldoNegativo: {
    color: 'rgb(235, 47, 55)',
    fontWeight: 900,
  },
  table: {
    maxWidth: '100%',
    tableLayout: 'auto',
  },
  tableRow: {
    // padding: '16px 0',
    cursor: 'pointer',
  },
  tabPanel: {
    width: '100%',
  },
  tableCell: {
    fontSize: '0.6vw',
  },
  container: {
    flex: 1,
    padding: theme.spacing(2),
    height: '100%',
  },
  paper: {
    flex: 1,
    padding: theme.spacing(1),
    minHeight: '100vh',
  },
  paperAside: {
    height: '100%',
    maxHeight: 'fit-content',
    position: 'relative',
    padding: '8px 32px',
    overflowY: 'auto',
    // minHeight: 400,
    paddingBottom: 80,
  },
  paperGuia: {
    height: '100vh',
    maxHeight: 'fit-content',
    position: 'relative',
    overflowY: 'auto',
    padding: '8px 62px',
    // paddingLeft: 10,
    // paddingRight: 10,
  },
  headerAside: {
    position: 'absolute',
    zIndex: 0,
    height: 150,
    backgroundColor: theme.palette.primary.main,
    top: 0,
    right: 0,
    left: 0,
  },

  labelSearch: {
    backgroundColor: theme.palette.primary.main,
  },
  textInfoAside: {
    padding: '16px 0',
    position: 'sticky',
    color: '#FFF',
  },
  tabs: {
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'center',
  },
  appbar: {
    overflow: 'hidden',
  },
  labelUndefined: {
    padding: '16px 0',
    position: 'sticky',
    color: theme.palette.button.default.main,
  },
  paperHorarios: {
    height: '100%',
  },
  gerarGuia: {
    minHeight: '100vh',
  },

  inputMedicoRoot: {
    color: theme.palette.common.white,
    width: '100%',
  },
  inputMedico: {
    padding: '16px 0',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    cursor: 'pointer',
    zIndex: 100,
    textAlign: 'center',
    fontSize: 18,
    '&::placeholder': {
      color: theme.palette.common.white,
    },
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  fabItem: {
    position: 'fixed',
    right: theme.spacing(4.5),
  },
  invalidDay: {
    color: theme.palette.secondary.light,
  },
  validDay: {
    color: '#388e3c',
  },
  pastDay: {
    color: '#9a9a9a',
  },
  rootProgress: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 500,
  },
  iconWrapper: {
    width: '100%',
    display: 'inherit',
    alignItems: 'inherit',
    justifyContent: 'inherit',
  },
});

export const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  margin-top: 20px;
  margin-bottom: 20px;
`;
