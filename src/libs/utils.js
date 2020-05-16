import { isEmpty } from 'lodash';
/* eslint-disable no-useless-escape */
export const getPageTitle = activePage => (activePage ? `Portal Transparência | ${activePage}` : 'Portal Transparência');
export const formataDinheiro = n => `R$ ${n.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.')}`;
export const cpfValidator = (cpf) => {
  if (new RegExp(/^\d{3}[\\.]\d{3}[\\.]\d{3}[-]\d{2}$/).test(cpf)) {
    let soma = 0;
    let resto;
    const strCPF = String(cpf.replace(/[^0-9]/g, ''));
    for (let i = 1; i <= 9; i += 1) soma += parseInt(strCPF.substring(i - 1, i), 10) * (11 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i += 1) soma += parseInt(strCPF.substring(i - 1, i), 10) * (12 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(10, 11), 10)) return false;
    return true;
  }
  return false;
};
export const cnpjValidator = (cnpj) => {
  if (new RegExp(/^\d{2}[\\.]\d{3}[\\.]\d{3}[\\/]\d{4}[-]\d{2}$/).test(cnpj)) {
    const b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const strCNPJ = cnpj.replace(/[^\d]/g, '');

    if (strCNPJ.length !== 14) { return false; }

    if (/0{14}/.test(strCNPJ)) { return false; }


    let i;
    let n;
    let valid;

    for (i = 0, n = 0; i < 12; n += strCNPJ[i] * b[i += 1]);
    valid = ((n %= 11) < 2);
    if (Number(strCNPJ[12]) !== (valid ? 0 : 11 - n)) { return false; }

    for (i = 0, n = 0; i <= 12; n += strCNPJ[i] * b[(i += 1) - 1]);
    valid = ((n %= 11) < 2);
    if (Number(strCNPJ[13]) !== (valid ? 0 : 11 - n)) { return false; }

    return true;
  }
  return false;
};

export const emailValidator = email => new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email);
export const textValidator = text => new RegExp(/^[a-zA-Z\s]*$/).test(text);
export const numberValidator = number => new RegExp(/^[0-9\s]*$/).test(number);
export const cepValidator = cep => new RegExp(/^\d{5}[-]\d{3}$/).test(cep);
export const telValidator = tel => new RegExp(/^\(\d{2}\)(\s|)\d{4}-\d{4}$/).test(tel);
export const celValidator = tel => new RegExp(/^\(\d{2}\)(\s|)\d{5}-\d{4}$/).test(tel);
export const decimalValidator = number => new RegExp(/^\d+\.\d{1,2}$/).test(number);
// export const emailValidator = email => new RegExp(/^[a-z0-9\\._]+@[a-z0-9]+(.com|.com.br)$/).test(email);
export const hourValidator = formattedHour => new RegExp(/^\d{2}[:]\d{2}$/).test(formattedHour);
export const dateValidator = (formattedDate) => {
  const expReg = /^((0[1-9]|[12]\d)\/(0[1-9]|1[0-2])|30\/(0[13-9]|1[0-2])|31\/(0[13578]|1[02]))\/(19|20)?\d{2}$/;
  let aRet = true;
  if (String(formattedDate).trim() && (formattedDate.match(expReg))) {
    const dia = formattedDate.substring(0, 2);
    const mes = formattedDate.substring(3, 5);
    const ano = formattedDate.substring(6, 10);
    if ((mes === 4 || mes === 6 || mes === 9 || mes === 11) && dia > 30) {
      aRet = false;
    } else if ((ano % 4) !== 0 && mes === 2 && dia > 28) {
      aRet = false;
    } else if ((ano % 4) === 0 && mes === 2 && dia > 29) {
      aRet = false;
    }
  } else {
    aRet = false;
  }
  return aRet;
};

export const cnpjFormatter = (value) => {
  if (!value) {
    return value;
  }
  const splittedValue = String(value).split('');

  const firstPart = splittedValue.slice(0, 2);
  const secondPart = splittedValue.slice(2, 5);
  const thirdPart = splittedValue.slice(5, 8);
  const fourthPart = splittedValue.slice(8, 12);
  const lastPart = splittedValue.slice(12, 14);

  return `${firstPart.join('')}.${secondPart.join('')}.${thirdPart.join('')}/${fourthPart.join('')}-${lastPart.join('')}`;
};

export const cpfFormatter = (value) => {
  if (!value || String(value).length !== 11) {
    return value;
  }
  const splittedValue = String(value).split('');

  const firstPart = splittedValue.slice(0, 3);
  const secondPart = splittedValue.slice(3, 6);
  const thirdPart = splittedValue.slice(6, 9);
  const lastPart = splittedValue.slice(9, 11);

  return `${firstPart.join('')}.${secondPart.join('')}.${thirdPart.join('')}-${lastPart.join('')}`;
};

export const telFormatter = (value) => {
  if (!value || String(value).length !== 10) {
    return value;
  }
  const splittedValue = String(value).split('');

  const firstPart = splittedValue.slice(0, 2);
  const secondPart = splittedValue.slice(2, 6);
  const lastPart = splittedValue.slice(6, 10);

  return `(${firstPart.join('')}) ${secondPart.join('')}-${lastPart.join('')}`;
};

export const celFormatter = (value) => {
  if (!value || String(value).length !== 11) {
    return value;
  }
  const splittedValue = String(value).split('');

  const firstPart = splittedValue.slice(0, 2);
  const secondPart = splittedValue.slice(2, 7);
  const lastPart = splittedValue.slice(7, 11);

  return `(${firstPart.join('')}) ${secondPart.join('')}-${lastPart.join('')}`;
};

export const cepFormatter = (value) => {
  if (!value || String(value).length !== 8) {
    return value;
  }
  const splittedValue = String(value).split('');

  const firstPart = splittedValue.slice(0, 5);
  const secondPart = splittedValue.slice(5, 8);

  return `${firstPart.join('')}-${secondPart.join('')}`;
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const weightHeightFormatter = (value) => {
  const offset = [];
  return String(value
    .replace(/,/g, '.'))
    .split('')
    .filter((s, index) => {
      if (s === '.' && isEmpty(offset) && index) {
        offset.push({ s, index });
        return s;
      }
      if (s !== '.' && numberValidator(s)) {
        return s;
      }
    })
    .join('');
};

export const uniqueID = () => [...new Array(36)]
  .map(() => String.fromCharCode(97 + Math.random() * 26))
  .join('');
