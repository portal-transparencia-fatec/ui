import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-top: 10px;
  max-width: 78.5%;
  min-width: 50%;
  align-self: ${props => (props.me ? 'flex-end' : 'flex-start')};
  border-radius: ${props => (props.me ? '15px 2px 15px 15px' : '2px 15px 15px 15px')};
  background-color: ${props => (props.me ? '#9ec2da' : '#E1E1E1')}; /* #0662a1 */

  & > span {
    font-weight: 500;
    margin-bottom: 6px;
    font-size: 0.825rem;
    /* text-align: ${props => (props.me ? 'end' : 'start')}; */
  }
`;

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
`;

export const Content = styled.span`
  flex: 1;
  font-size: 0.795rem;
  margin: 0 !important;
  text-overflow: ellipsis;
  word-break: break-word;
`;

export const Metadata = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-self: stretch;
  margin-left: 5px;

  span {
    font-size: 0.725rem;
    color: #444;
    margin-right: 5px;
  }
`;

export const DateDisplay = styled.span`
  display: flex;
  width: 100%;
  position: relative;
  align-items: center;
  justify-content: center;
  font-size: 0.725rem;
  font-style: italic;
  margin-top: 10px;

  &::after {
      display: block;
      content: '';
      width: 20%;
      background: #CCC;
      height: 0.825px;
      position: absolute;
      bottom: 50%;
      left: 0;
    }
  &::before {
    display: block;
    content: '';
    width: 20%;
    background: #CCC;
    height: 0.825px;
    position: absolute;
    bottom: 50%;
    right: 0;
  }
`;

export const AnexoButton = styled.button`
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 13px;
  background-color: transparent;
  border: 0;
  color: #0662a1;
  outline: none;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    text-decoration: underline;
  };
`;

export default theme => ({
  visibilityIcon: {
    fontSize: theme.typography.pxToRem(13.5),
    color: '#444',
    alignSelf: 'center',
  },
  expansionPanel: {
    backgroundColor: 'transparent',
    border: 0,
    padding: '0 !important',
    boxShadow: 'none',
    marginTop: 5,
  },
  expansionTitle: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.05,
  },
  expansionPanelDetails: {
    padding: '0 !important',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  expansionIcon: {
    fontSize: 18,
  },
});
