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
  paper: {
    flex: 1,
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    // maxWidth: 540,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    alignSelf: 'center',
  },
  formControl: {
    width: '100%',
    minWidth: 120,
  },
  textfield: {
    alignSelf: 'stretch',
    width: '100%',
  },
  textInstructions: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing(),
  },
  button: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    alignSelf: 'stretch',
  },
});
