import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import moment from 'moment';

import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';

import ItemMensagem from '../ItemMensagem';
import TextInput from '../TextInput';

import ChatActions from '../../../../store/ducks/chat';
import ChatService from '../../../../services/Chat';
import Sockets from '../../../../services/ws';

import Material, {
  Container,
  Content,
  Lista,
  EmptyMessage,
} from './styles';

class Chat extends Component {
  static propTypes = {
    conversaId: PropTypes.number.isRequired,
    atualizarMensagensVisualizadas: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.onScrollLista = debounce(this.onScrollLista, 500);
  }

  state = {
    mensagens: [],
    /**
     * Propriedade que valida se possui mais mensagens para
     * buscar via paginação
     */
    hasMore: true,
    page: 1,
    loading: false,
    scrollOffsetBottom: 0,
  }

  componentDidMount() {
    this.fetchMensagens();
    this.subscribeMensagens();
    this.publishMensagensVisualizadas();
    this.subscribeMensagensVisualizadas();
    this.subscribeMensagensAtualizadas();
  }

  componentDidUpdate(prevProps, prevState) {
    const { conversaId } = this.props;
    const { mensagens, page } = this.state;

    /**
     * Busca as mensagens de acordo com o ID da conversa
     * recebida via props
     */
    if (prevProps.conversaId !== conversaId) {
      this.fetchMensagens();
    }

    /**
     * Emite as mensagens visualizadas quando é recebido uma
     */
    if (prevState.mensagens !== mensagens) {
      this.publishMensagensVisualizadas();
    }

    if (prevState.mensagens.length === 0 && mensagens.length !== 0) {
      this.scrollToBottom();
    }

    /**
     * Busca as mensagens de forma paginada caso ocorra
     * a mudança (Paginação via scroll)
     */
    if (page === prevState.page + 1) {
      this.fetchMensagens();
    }
  }

  componentWillUnmount() {
    /**
     * Remove os eventos WS
     */
    this.unsubscribeMensagens();
  }

  /**
   * Busca as mensagens de forma paginada da API de acordo com
   * o ID da conversa
   */
  fetchMensagens = async () => {
    const { conversaId } = this.props;
    const { page, scrollOffsetBottom } = this.state;

    try {
      this.setState({ loading: true });
      // await sleep(5000);
      const { next: hasMore, mensagens } = await ChatService
        .buscarMensagens(conversaId, page, 100);

      this.setState(state => ({ mensagens: [...state.mensagens, ...mensagens], hasMore }));
      if (this.contentListaRef) {
        this.contentListaRef
          .scroll({ top: this.contentListaRef.scrollHeight - scrollOffsetBottom });
      }
    } catch (err) {
      console.log('Chat.fetchMensagens: ', err);
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Escuta os eventos de mensagem no chat
   */
  subscribeMensagens = () => {
    const { socketChat } = Sockets;
    const { conversaId } = this.props;
    // const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));

    socketChat.socket.on(`conversa.${conversaId}.chat_mensagem`, (mensagem) => {
      this.adicionarMensagem(mensagem);
    });
  }

  /**
   * Cancela os eventos WS
   */
  unsubscribeMensagens = () => {
    const { socketChat } = Sockets;
    const { conversaId } = this.props;
    socketChat.socket.off(`conversa.${conversaId}.chat_mensagem`);
    socketChat.socket.off(`conversa.${conversaId}.atualiza_mensagens`);
  }

  /**
   * Envia um array de mensagens visualizadas via WS
   */
  publishMensagensVisualizadas = () => {
    const { socketChat } = Sockets;
    const { mensagens } = this.state;
    const { conversaId } = this.props;
    const usuario = JSON.parse(localStorage.getItem('@clin:usuario'));

    /**
     * Filtra as mensagens visualizadas
     */
    const mensagensVisualizadas = mensagens
      .reduce((arr, {
        id, remetente, visualizadaEm,
      }) => {
        /**
         * Verifica se a mensagem não foi visualizada e
         * o remetente é diferente do usuario logado
         */
        if (!visualizadaEm && remetente.id !== usuario.id) {
          return [...arr, { id, conversa_id: conversaId, visualizadaEm: new Date().toISOString() }];
        }
        return arr;
      }, []);

    if (mensagensVisualizadas.length) {
      /**
       * Envia as mensagens
       */
      socketChat.socket.emit(
        `mensagem_visualizada.${conversaId}`,
        mensagensVisualizadas,
      );
    }
  }

  /**
   * Escuta os eventos de mensagens visualizadas para
   * dar o feedback ao usuário logado
   */
  subscribeMensagensVisualizadas = () => {
    const { socketChat } = Sockets;
    const { conversaId, atualizarMensagensVisualizadas } = this.props;


    socketChat.socket.on(`mensagem_visualizada.${conversaId}`, (mensagensVisualizadas) => {
      atualizarMensagensVisualizadas(conversaId, mensagensVisualizadas);
      mensagensVisualizadas.forEach((mensagemVisualizada) => {
        const { mensagens } = this.state;
        const index = mensagens.findIndex(({ id }) => mensagemVisualizada.id === id);
        if (index !== -1) {
          this.handleMensagemVisualizada(mensagemVisualizada, index);
        }
      });
    });
  }

  /**
   * Escuta os eventos de mensagens atualizadas
   */
  subscribeMensagensAtualizadas = () => {
    const { socketChat } = Sockets;
    const { conversaId } = this.props;

    socketChat.socket.on(`conversa.${conversaId}.atualiza_mensagens`, this.atualizaMensagem);
  }

  /**
   * Adiciona a mensagem na lista
   */
  adicionarMensagem = (mensagem) => {
    const { mensagens } = this.state;

    mensagens.push(mensagem);
    this.setState({ mensagens: [...mensagens] });
    this.scrollToBottom();
  }

  /**
   * Atualiza os dados da mensagem
   */
  atualizaMensagem = (mensagem) => {
    const { mensagens } = this.state;
    const formatDate = date => moment(date).format('YYYY-MM-DD HH:mm:ss');

    const mensagemIndex = mensagens
      .findIndex(({ id, criadaEm, remetente }) => (id === mensagem.id)
        || (formatDate(criadaEm) === formatDate(mensagem.criadaEm)
          && remetente.id === mensagem.remetente.id));

    if (mensagemIndex !== -1) {
      mensagens[mensagemIndex] = mensagem;
    }

    this.setState({ mensagens: [...mensagens] });
    this.scrollToBottom();
  }

  /**
   * Atualiza a visualização da mensagem
   */
  handleMensagemVisualizada = (mensagem, index) => {
    const { mensagens } = this.state;
    mensagens[index].visualizadaEm = mensagem.visualizadaEm;
    this.setState({ mensagens });
  }

  scrollToBottom = () => {
    if (this.contentListaRef) {
      this.contentListaRef.scrollTop = this.contentListaRef.scrollHeight;
    }
  }

  ordenarMensagens = (prev, next) => {
    if (prev.criadaEm > next.criadaEm) {
      return 1;
    }

    if (prev.criadaEm < next.criadaEm) {
      return -1;
    }

    return 0;
  }

  /**
   * Lida com o evento de scroll da lista
   * de mensagens, atribuindo ao state o número da pagina
   * e a distancia do scroll referente ao bottom do elemento.
   * Necessário para realizar a paginação via scroll
   */
  onScrollLista = () => {
    const { loading, hasMore } = this.state;
    if (hasMore && !loading && this.contentListaRef && this.contentListaRef.scrollTop <= 50) {
      this.setState(state => ({
        scrollOffsetBottom: this.contentListaRef.scrollHeight - this.contentListaRef.scrollTop,
        page: state.page + 1,
      }));
    }
  }

  render() {
    const { classes, conversaId } = this.props;
    const { mensagens, loading } = this.state;
    mensagens.sort(this.ordenarMensagens);

    return (
      <Container>
        <Content
          ref={(ref) => {
            this.contentListaRef = ref;
          }}
          onScroll={this.onScrollLista}
        >
          {mensagens.length ? (
            <Lista>
              {loading && (<CircularProgress className={classes.loading} size={24} color="secondary" />)}
              {mensagens.map((mensagem, index) => (
                <ItemMensagem
                  mensagens={mensagens}
                  key={mensagem.id || +new Date(mensagem.criadaEm)}
                  mensagem={mensagem}
                  index={index}
                />
              ))}
            </Lista>
          ) : (
            <EmptyMessage>Envie uma mensagem...</EmptyMessage>
          )}
        </Content>
        <TextInput
          conversaId={conversaId}
          onEnviarMensagem={this.adicionarMensagem}
        />
      </Container>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  atualizarMensagensVisualizadas: (conversaId, mensagens) => dispatch(ChatActions
    .atualizarMensagensVisualizadas(conversaId, mensagens)),
});

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(Material),
)(Chat);
