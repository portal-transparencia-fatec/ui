import styled from 'styled-components';

export const Divider = styled.div`
  height: 100%;
  width: 0.825px;
  background-color: #ccc;
  margin: 0 16px;
`;

export default theme => ({
  drawer: {
    height: 430,
  },
  label: {
    color: 'rgb(102, 102, 102)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  drawerContent: {
    flex: 1,
    padding: theme.spacing(2),
  },
});
