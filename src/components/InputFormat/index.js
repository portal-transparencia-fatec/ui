/* eslint-disable no-compare-neg-zero */
import React from 'react';
import MaskedInput from 'react-text-mask';
import NumberFormat from 'react-number-format';

const InputFormatHora = ({
  inputRef,
  ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={[/[0-2]/, /[0-9]/, ':', /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatData = ({
  inputRef, ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={[/[0-3]/, /[0-9]/, '/', /[0-1]/, /[0-9]/, '/', /[1-2]/, /[0-9]/, /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatDataHora = ({
  inputRef, ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={[/[0-3]/, /[0-9]/, '/', /[0-1]/, /[0-9]/, '/', /[1-2]/, /[0-9]/, /[0-9]/, /[0-9]/, /\s/, /[0-9]/, /[0-9]/, ':', /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatCpf = ({
  inputRef, ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={[/[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatCnpj = ({
  inputRef, ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={[/[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '/', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatCep = ({
  inputRef, ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={[/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatTelefone = ({
  inputRef, ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={['(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatCelular = ({
  inputRef, ...props
}) => (
  <MaskedInput
    {...props}
    ref={(ref) => {
      inputRef(ref ? ref.inputElement : null);
    }}
    mask={['(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
    showMask={false}
    guide={false}
    keepCharPositions
  />
);

const InputFormatDinheiro = ({
  inputRef, onChange, ...other
}) => (
  <NumberFormat
    {...other}
    getInputRef={inputRef}
    onValueChange={(values) => {
      onChange({
        target: {
          value: (values.floatValue === undefined ? '' : values.floatValue),
        },
      });
    }}
    isAllowed={(values) => {
      if (values.floatValue >= 0 && values.floatValue !== -0) {
        return true;
      }
      if (values.floatValue === undefined) {
        return true;
      }
      return false;
    }}
    decimalSeparator=","
    thousandSeparator="."
    allowNegative="false"
    prefix="R$"
  />
);

const InputFormatDinheiroNotNull = ({
  inputRef, onChange, ...other
}) => (
  <NumberFormat
    {...other}
    getInputRef={inputRef}
    onValueChange={(values) => {
      onChange({
        target: {
          value: (values.floatValue === undefined ? 0 : values.floatValue),
        },
      });
    }}
    isAllowed={(values) => {
      if (values.floatValue >= 0 && values.floatValue !== -0) {
        return true;
      }
      if (values.floatValue === undefined) {
        return true;
      }
      return false;
    }}
    decimalSeparator=","
    thousandSeparator="."
    allowNegative="false"
    prefix="R$"
  />
);

const InputFormatNaturalNumber = ({
  inputRef, onChange, ...other
}) => (
  <NumberFormat
    {...other}
    getInputRef={inputRef}
    onValueChange={(values) => {
      onChange({
        target: {
          value: (values.floatValue === undefined ? '' : values.floatValue),
        },
      });
    }}
    isAllowed={(values) => {
      if (values.floatValue >= 0 && values.floatValue !== -0) {
        return true;
      }
      if (values.floatValue === undefined) {
        return true;
      }
      return false;
    }}
    allowNegative="false"
  />
);

const InputmaskDateTimePicker = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, /\s/, /\d/, /\d/, ':', /\d/, /\d/];

export {
  InputmaskDateTimePicker,
  InputFormatNaturalNumber,
  InputFormatDinheiro,
  InputFormatDinheiroNotNull,
  InputFormatHora,
  InputFormatData,
  InputFormatDataHora,
  InputFormatCpf,
  InputFormatCnpj,
  InputFormatCep,
  InputFormatTelefone,
  InputFormatCelular,
};
