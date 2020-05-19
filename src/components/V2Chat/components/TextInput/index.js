
import React, {
  useRef, useEffect, useCallback, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import SendIcon from '@material-ui/icons/Send';
import AttachmentIcon from '@material-ui/icons/Attachment';
import CloseIcon from '@material-ui/icons/Close';

import ChatService from '../../../../services/Chat';
import Sockets from '../../../../services';

import {
  useStyles, Container, ContainerInput, ListaAnexos, Anexo,
} from './styles';

const accept = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/x-icon',
  'text/csv',
  'text/plain',
  'application/json',
  'application/xml',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/zip',
  'application/msword',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Componente utilizando a modelagem de Hooks do React (React Hooks)
 * Responsável pelo envio de mensagens e anexos no chat
 */
function TextInput({
  conversaId,
  onEnviarMensagem,
}) {
  const textfieldRef = useRef(null);
  useEffect(() => {
    textfieldRef.current.focus();
  });

  const classes = useStyles();

  const [files, setFiles] = useState([]);

  /**
   * Faz o envio dos anexos quando carregados no Dropzone
   * Esse upload é apenas temporário
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onDropAccepted = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length) {
      /**
       * Realiza o upload de forma concorrente dos arquivos
       * Após o upload de todos os anexos é atribuido o array
       * dos arquivos no state do Hooks
       */
      setFiles(
        await Promise.all(
          acceptedFiles.map(async (file) => {
            const anexo = await ChatService.uploadAnexoTemporario(conversaId, file);
            return { anexo, ...file };
          }),
        ),
      );
    }
  });

  const {
    getRootProps,
    getInputProps,
    open,
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    accept,
    onDropAccepted,
  });

  /**
   * Realiza o envio da mensagem
   */
  async function enviarMensagem() {
    const texto = textfieldRef.current.value.trim();

    if (!texto) return;

    const remetente = JSON.parse(localStorage.getItem('@clin:usuario'));
    /**
     * Monta o JSON no formato da mensagem
     * que deve ser enviada via WS
     */
    const mensagem = {
      texto,
      conversa_id: conversaId,
      enviada_por: remetente.id,
      criadaEm: new Date().toISOString(),
      anexos: files.map(({ anexo }) => anexo),
    };

    const { socketChat } = Sockets;
    // const mensagemEnviada = await socketChat.enviar(mensagem);
    socketChat.enviar(mensagem);
    textfieldRef.current.value = '';
    setFiles([]);

    onEnviarMensagem({ ...mensagem, remetente });
  }

  /**
   * Envia a mensagem ao pressionar a tecla ENTER
   */
  function handleKeyUpEnviarMensagem(event) {
    const keyCode = event.keyCode ? event.keyCode : event.which;

    if (textfieldRef.current.value.trim() && !event.shiftKey && keyCode === 13) {
      event.preventDefault();
      enviarMensagem();
    }
  }

  /**
   * Remove o anexo temporario
   */
  async function handleRemoverAnexo(anexo) {
    await ChatService.excluirAnexoTemporario(anexo);

    setFiles(
      files.filter(file => file.anexo.caminho !== anexo.caminho),
    );
  }

  function getAnexoNome(filename) {
    const tamanhoLimite = 32;

    if (filename.length > tamanhoLimite) {
      return `${filename.substr(0, 29)}...`;
    }

    return filename;
  }

  return (
    <Container
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {!!files.length && (
        <ListaAnexos>
          {files.map(file => (
            <Anexo key={file.anexo.nome}>
              <span>{getAnexoNome(file.anexo.nome)}</span>
              <IconButton
                onClick={() => handleRemoverAnexo(file.anexo)}
              >
                <CloseIcon className={classes.iconClose} />
              </IconButton>
            </Anexo>
          ))}
        </ListaAnexos>
      )}
      <ContainerInput>
        <TextField
          className={classes.textarea}
          inputRef={textfieldRef}
          multiline
          placeholder="Digite uma mensagem..."
          onKeyDown={handleKeyUpEnviarMensagem}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment>
                <IconButton
                  onClick={enviarMensagem}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          onClick={open}
        >
          <AttachmentIcon />
        </IconButton>
      </ContainerInput>
    </Container>
  );
}

TextInput.propTypes = {
  conversaId: PropTypes.number.isRequired,
  onEnviarMensagem: PropTypes.func.isRequired,
};

export default TextInput;
