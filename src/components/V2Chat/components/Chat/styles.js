import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
`;

export const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #FFF;
`;

export const EmptyMessage = styled.p`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #BBB;
  font-style: italic;
`;

export default theme => ({
  loading: {
    alignSelf: 'center',
    margin: theme.spacing(1),
  },
});
