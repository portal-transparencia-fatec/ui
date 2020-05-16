/* eslint-disable no-undef */
import styled from 'styled-components';

export const GridImage = styled.div`
  height: calc(28vh - 20px);
  width: 100%;
  background-image: url('${props => props.urlImage}');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;


  `;

export const GridImage2 = styled.div`
  height: 100%;
  width: 100%;
  &:hover {
    background-image: url('https://goyabu.com/wp-content/themes/hermes/images/play_button.png');
    background-repeat: no-repeat;
    background-position: center;
  }
`;



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
