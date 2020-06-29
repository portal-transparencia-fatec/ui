import { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import NotificationActions from '../../store/ducks/notifier';

class ErrorBoundary extends Component {
  constructor() {
    super();
    this.state = { hasError: false, eventId: null };
  }


  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Sentry.withScope((scope) => {
    //   scope.setExtras(errorInfo);
    //   this.setState({ eventId: Sentry.captureException(error) });
    // });
  }

  render() {
    const { children } = this.props;
    const { hasError, eventId } = this.state;
    const usuarioLogado = JSON.parse(localStorage.getItem('@:usuario'));

    if (hasError && usuarioLogado) {
      const { nome: name, email } = usuarioLogado;
      // Sentry.showReportDialog({
      //   lang: 'pt-br',
      //   title: 'REPORTAR PROBLEMA',
      //   subtitle: 'Por favor use o formulário abaixo para nos informar sobre o problema que você está enfrentando.',
      //   subtitle2: 'Se você quiser ajudar, conte-nos o que aconteceu abaixo.',
      //   labelSubmit: 'Enviar',
      //   user: {
      //     name,
      //     email,
      //   },
      //   labelName: 'NOME',
      //   labelEmail: 'E-MAIL',
      //   labelComments: 'O QUE ACONTECEU',
      //   labelClose: 'FECHAR',
      //   errorGeneric: 'Um erro desconhecido ocorreu durante o envio do seu relatório. Por favor, tente novamente.',
      //   successMessage: 'Seu feedback foi enviado. Obrigado!',
      //   errorFormEntry: 'Alguns campos estão inválidos. Por favor, corrija e tente novamente.',
      //   eventId,
      // }, this.setState({ hasError: false }));
    }

    return children;
  }
}

const mapDispatchToProps = dispatch => ({
  notifyError: (
    message,
    options,
  ) => dispatch(NotificationActions.notifyError(message, options)),
});

export default withRouter(connect(null, mapDispatchToProps)(ErrorBoundary));
