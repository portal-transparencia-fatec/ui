import styled from 'styled-components';

export const Divider = styled.div`
  height: 0.825px;
  width: 100%;
  background-color: #ccc;
  margin: 16px 0px;
`;

export const CustomButton = styled.div`
  width: 30vh;
  height: 30vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #909090;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #e1e1e1;
    font-size: 100px;
  };
`;

export const Material = theme => ({
  container: {
    display: 'flex',
  },
  chip: {
    margin: theme.spacing(0.25),
  },
});
