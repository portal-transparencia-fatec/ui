// import styled from 'styled-components';

// export const Form = styled.form`
//   display: flex;
//   flex: 1;
//   flex-direction: column;
//   align-items: center;
//   justify-content: space-around;
//   margin-top: 20px;
//   margin-bottom: 20px;
// `;

// export const Material = theme => ({
//   container: {
//     flex: 1,
//     display: 'flex',
//     height: '100%',
//   },
//   content: {
//     flex: 1,
//     display: 'flex',
//     height: '100%',
//   },
//   textfield: {
//     width: '100%',
//     alignSelf: 'stretch',
//   },
//   chips: {
//     display: 'flex',
//     flexWrap: 'wrap',
//   },
//   chip: {
//     margin: theme.spacing(0.25),
//   },
//   paper: {
//     margin: theme.spacing(2),
//     padding: theme.spacing(2),
//     borderRadius: theme.shape.borderRadius,
//   },
//   title: {
//     textAlign: 'center',
//     textTransform: 'uppercase',
//     color: theme.palette.primary.main,
//     fontWeight: 300,
//   },
//   textInfo: {
//     padding: '16px 0',
//   },
// });

export default theme => ({
  chartTitle: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    textAlign: 'center',
  },
  paper: {
    flex: 1,
    padding: theme.spacing(1),
    maxHeight: '44vh',
    minHeight: '44vh',
    overflowY: 'scroll',
  },
  graph: {
    maxHeight: '45vh',
  },
  table: {
    width: '100%',
    overflowX: 'scroll',
    tableLayout: 'auto',
  },
  tableCell: {
    fontSize: 13,
  },
  cellDefault: {
    width: '20%',
    fontWeight: 900,
  },

  title: {
    color: 'rgba(0,0,0, 0.65)',
    paddingTop: 20,
    paddingBottom: 10,
  },
});
