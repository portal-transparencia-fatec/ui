/* eslint-disable react/jsx-no-duplicate-props */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v1';
import _ from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputBase from '@material-ui/core/InputBase';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import LoadingIndicator from '../LoadingIndicator';

import Material from './styles';

/**
 * Componente criado para utilizar com input select nos
 * formularios da aplicação
 */
class ModalSelect extends Component {
  static defaultProps = {
    label: 'Selecione',
    name: 'modalSelect',
    error: undefined,
    placeholderFilter: 'Procurar...',
    multiple: false,
    id: uuid(),
    value: '',
    empty: 'Nenhuma opção disponível...',
    open: undefined,
    autoCompleteAsync: false,
    disabled: false,
    onOpen: () => {},
    onClose: () => {},
    onGenerateGuia: () => {},
    onSearchAsync: () => {},
    debounceTime: 500,
    loadingSearch: false,
    textfieldProps: {},
    inputFilterProps: {},
  };

  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    error: PropTypes.bool,
    placeholderFilter: PropTypes.string,
    multiple: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      subLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    empty: PropTypes.string,
    open: PropTypes.oneOfType([PropTypes.bool]),
    /**
     * Propriedade que ativa o modo de autocomplete das
     * opções do ModalSelect, utilizado por exemplo para buscar
     * as opções de uma API de acordo com o que foi digitado no input
     * de filtro
     */
    autoCompleteAsync: PropTypes.oneOfType([PropTypes.bool]),
    disabled: PropTypes.bool,
    onOpen: PropTypes.func,
    onGenerateGuia: PropTypes.func,
    onClose: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    /**
     * Função obrigatória caso esteja ativado
     * a propriedade autoCompleteAsync
     */
    onSearchAsync: PropTypes.func,
    debounceTime: PropTypes.number,
    loadingSearch: PropTypes.bool,
    textfieldProps: PropTypes.shape({}),
    inputFilterProps: PropTypes.shape({}),
  };

  state = {
    openState: false,
    textSearchOptions: '',
  }

  constructor(props) {
    super(props);

    /**
     * Debounce na função de buscar as opções do ModalSelect
     * de forma assíncrona
     */
    this.onSearchAsyncDebounced = _.debounce(this.onSearchAsyncDebounced, props.debounceTime);
  }

  onSearchAsyncDebounced = (value) => {
    const { onSearchAsync } = this.props;

    onSearchAsync(value);
  }

  onChangeSearchOptions = (event) => {
    const { autoCompleteAsync } = this.props;
    this.setState({ textSearchOptions: event.target.value });
    /**
     * Realiza o search de forma assíncrona
     */
    if (autoCompleteAsync) {
      this.onSearchAsyncDebounced(event.target.value);
    }
  }

  /**
   * Filtra as opções do ModalSelect de acordo com
   * o que foi digitado no input de texto
   */
  filterOptions = (opt) => {
    const { textSearchOptions } = this.state;
    let filter = true;

    if (new RegExp(textSearchOptions, 'ig').test(opt.label) || new RegExp(textSearchOptions, 'ig').test(opt.id)) {
      return filter;
    }

    if (
      Object.entries(opt).some(([key, value]) => (key !== 'id' && key !== 'label')
        && (typeof value === 'string' || typeof value === 'number') && (new RegExp(textSearchOptions, 'ig').test(value)))
    ) {
      return filter;
    }

    filter = false;
    return filter;
  }

  /**
   * Abre o modal
   */
  onOpen = () => {
    const { open, onOpen, disabled } = this.props;

    /**
     * Cancela o evento caso tenha a propriedade de disabled
     */
    if (disabled) {
      return;
    }

    /**
     * O ModalSelect pode ser aberto através de sua configuração
     * padrão (internamente) ou pode receber uma propriedade para ser
     * controlado por outro componente (externamente)
     */
    if (typeof open === 'undefined') {
      this.setState({ openState: true });
    }

    /**
     * Evento emitido quando o ModalSelect é aberto
     */
    onOpen();
  }

  /**
   * Fecha o modal
   */
  onClose = () => {
    const { open, onClose } = this.props;

    if (typeof open === 'undefined') {
      this.setState({ openState: false });
    }

    /**
     * Evento emitido quando o ModalSelect é fechado
     */
    onClose();
  }


  onGenerateGuia = () => {
    const { onGenerateGuia } = this.props;
    onGenerateGuia();
  }

  /**
   * Função executada quando uma opção é selecionada
   */
  onClickSelectOption = (opt, event) => {
    const { multiple, onChange, value: valueProps } = this.props;

    /**
     * Verifica se é uma seleção múltipla ou única
     */
    if (!multiple) {
      /**
       * Se o usuário seleciona a mesma opção selecionada anteriormente
       * o modal remove está opção selecionada
       */
      if (valueProps === opt.id) {
        onChange('', event);
        return;
      }

      /**
       * Emite via props a opção selecionada
       */
      onChange(opt.id, event);
      this.onClose();
      return;
    }

    const value = [...valueProps];
    const valueIndex = value.indexOf(opt.id);

    /**
     * No caso de múltiplas opções verifica-se a opção se já
     * foi selecionada anteriormente
     */
    if (valueIndex !== -1) {
      /**
       * Caso tenha sido selecionada é removida dos valores
       */
      value.splice(valueIndex, 1);
      /**
       * Emite os valores atualizados
       */
      onChange(value, event);
    } else {
      /**
       * Emite os valores atualizados
       */
      onChange([...value, opt.id], event);
    }
  }

  /**
   * Seleciona/remove todos as opções de uma vez
   */
  onSelectAll = (event) => {
    const { checked } = event.target;
    const { options, onChange } = this.props;

    if (checked) {
      onChange(options.map(({ id }) => id));
    } else {
      onChange([]);
    }
  }

  /**
   * Renderiza os valores selecionados no TextField
   */
  renderTextInputValues = () => {
    const {
      multiple, value, options, type,
    } = this.props;

    if (!value && type === 'planoConvenio') {
      if (type === 'planoConvenio') {
        return 'N/A';
      }
      return '';
    }

    if (!multiple) {
      const option = options.find(opt => opt.id === value);

      if (option) {
        if (option.subLabel) {
          /**
           * Caso as opções possuam sublabels concatena
           * juntamente com a label
           */
          return `${option.label} - ${option.subLabel}`;
        }

        /**
         * Caso seja seleção única, retorna o label da
         * opção selecionada para visualizar no input
         */
        return option.label;
      }

      return '';
    }

    if (type === 'cid') {
      if (value) {
        return value.join(', ');
      }
      return '';
    }

    const selectedOptions = options
      .filter(opt => value.some(val => (val === opt.id) || (val === opt.label)));

    /**
     * Concatena os valores múltiplos tanto para label ou
     * label com sublabel, separando-os por vírgula
     */
    return selectedOptions.map((opt) => {
      if (opt.subLabel) {
        return `${opt.label} - ${opt.subLabel}`;
      }
      return opt.label;
    }).join(', ');
  }

  /**
   * Renderiza as opções dentro do ModalSelect
   */
  renderOptions = () => {
    const {
      options,
      value,
      multiple,
      empty,
    } = this.props;

    if (!options.length) {
      return (
        <DialogContentText>
          {empty}
        </DialogContentText>
      );
    }

    if (!multiple) {
      return (
        <List dense={options.some(opt => opt.subLabel)}>
          {options.filter(this.filterOptions).map(opt => (
            <ListItem
              key={opt.id}
              button
              selected={opt.id === value || opt.label === value}
              onClick={event => this.onClickSelectOption(opt, event)}
            >
              <ListItemText primary={opt.label} secondary={opt.subLabel} />
            </ListItem>
          ))}
        </List>
      );
    }

    return (
      <>
        {multiple && (
          <FormControlLabel
            control={(
              <Checkbox
                color="primary"
                checked={value.length === options.length}
                onChange={this.onSelectAll}
              />
            )}
            label="Selecionar todos"
          />
        )}
        <List dense>
          {options.filter(this.filterOptions).map(opt => (
            <ListItem
              key={opt.id}
              role={undefined}
              // dense
              button
              onClick={event => this.onClickSelectOption(opt, event)}
            >
              <Checkbox
                checked={value.some(val => (val === opt.id) || (val === val.label))}
                tabIndex={-1}
                color="primary"
                disableRipple
                // onChange={event => this.onClickSelectOption(opt, event)}
              />
              <ListItemText primary={opt.label} secondary={opt.subLabel} />
            </ListItem>
          ))}
        </List>
      </>
    );
  }

  render() {
    const {
      children,
      classes,
      fullScreen,
      id,
      name,
      label,
      error,
      InputLabelProps,
      value,
      options,
      placeholderFilter,
      open,
      loadingSearch,
      autoCompleteAsync,
      textfieldProps,
      inputFilterProps,
      inputFilterDisabled,
      inputProps,
      disabled,
      type,
    } = this.props;
    const { openState, textSearchOptions } = this.state;
    /**
     * TextField renderizado para abrir o ModalSelect
     */
    let TextFieldComponent;

    /**
     * Verifica se o componente recebeu um textefield via props
     * para ser renderizado no lugar do textfield padrão
     */
    if (textfieldProps && textfieldProps.Component) {
      TextFieldComponent = () => (
        <textfieldProps.Component
          {...{
            id,
            error,
            name,
            label,
            disabled,
            value: this.renderTextInputValues(),
            onClick: this.onOpen,
            readOnly: true,
          }}
        />
      );
    } else {
      TextFieldComponent = () => (
        <TextField
          id={id}
          error={error}
          name={name}
          label={label}
          InputLabelProps={InputLabelProps}
          value={this.renderTextInputValues()}
          variant="outlined"
          disabled={disabled}
          inputProps={{
            className: disabled ? classes.inputDisabled : classes.input,
            readOnly: true,
            'aria-disabled': disabled,
          }}
          inputProps={inputProps}
          onClick={this.onOpen}
          {...textfieldProps}
        />
      );
    }

    return (
      <Fragment>
        <TextFieldComponent />
        <Dialog
          classes={{
            paper: classes.rootDialog,
          }}
          fullScreen={fullScreen}
          open={typeof open === 'undefined' ? openState : open}
          onClose={this.onClose}
          aria-labelledby="modal-select"
        >
          {<LoadingIndicator loading={loadingSearch} />}
          <DialogTitle id="modal-select">
            {!inputFilterDisabled && (
              <>
                {inputFilterProps && inputFilterProps.Component ? (
                  <inputFilterProps.Component
                    placeholder={placeholderFilter}
                    value={textSearchOptions}
                    onChange={this.onChangeSearchOptions}
                    disabled={!options.length && !autoCompleteAsync}
                  />
                ) : (
                  <InputBase
                    className={classes.inputFilter}
                    placeholder={placeholderFilter}
                    value={textSearchOptions}
                    onChange={this.onChangeSearchOptions}
                    // disabled={!options.length && !autoCompleteAsync}
                    {...inputFilterProps}
                  />
                )}
              </>
            )}
          </DialogTitle>
          <DialogContent
            className={classes.dialogContent}
          >
            {!!children && (typeof children === 'function') ? (
              /**
               * ModalSelect pode ser utilizado seguindo
               * o conceito de RenderProps do React.
               */
              children(options, value, this.filterOptions, this.onClickSelectOption)
            ) : (
              this.renderOptions()
            )}
          </DialogContent>
          <DialogActions>
            {type === 'gerarGuia' && (
              <Button onClick={this.onGenerateGuia} color="primary">Gerar guia</Button>
            )}
            <Button onClick={this.onClose} color="primary">Fechar</Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

export default withStyles(Material)(withMobileDialog()(ModalSelect));
