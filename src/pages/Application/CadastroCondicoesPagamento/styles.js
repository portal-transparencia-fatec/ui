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

export const Material = theme => ({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  content: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  textfield: {
    width: '100%',
    alignSelf: 'stretch',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing(0.25),
  },
  paper: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  },
  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
    fontWeight: 300,
  },
  textInfo: {
    padding: '16px 0',
  },
});
