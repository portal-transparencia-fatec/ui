import styled from 'styled-components';

export const Divider = styled.div`
  height: 100%;
  width: 0.825px;
  background-color: #ccc;
  margin: 0 16px;
`;

export default theme => ({
  drawer: {
    height: '50vh',
  },
  drawerContent: {
    flex: 1,
    padding: theme.spacing(2),
  },
  picture: {
    width: '100%',
    height: '35vh',
    borderRadius: 4,
    borderWidth: 5,
    borderColor: '#000',
    cursor: 'pointer',
  },
  pictureHandler: {
    width: 275,
    height: 275,
    borderRadius: 4,
    borderWidth: 5,
    borderColor: '#000',
  },
});
