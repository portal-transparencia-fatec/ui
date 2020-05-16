import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  margin-top: 20px;
  margin-bottom: 20px;
`;

export default theme => ({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    padding: 30,
  },
  content: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    alignSelf: 'stretch',
  },
  textfield: {
    width: '100%',
    alignSelf: 'stretch',
  },
  toolbar: {
    backgroundColor: theme.palette.primary.main,
    width: '100%',
  },
  rootSelectEvento: {
    width: '100%',
    maxWidth: 'fit-content',
    backgroundColor: theme.palette.primary.main,
  },
  listItemTextPrimary: {
    color: theme.palette.grey[200],
    textAlign: 'end',
    fontWeight: 400,
    fontSize: 15,
  },
  listItemTextSecondary: {
    color: theme.palette.grey[100],
    textAlign: 'end',
    fontWeight: 600,
  },
  paper: {
    flex: 1,
    // margin: theme.spacing(1),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    height: '100%',
    // maxWidth: 540,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    alignSelf: 'center',
    minHeight: 'fit-content',
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
    fontWeight: 300,
  },
});
