import axios from 'axios';
import qs from 'qs';
import store from '../store';
import UsuarioActions from '../store/ducks/usuario';
import NotificationActions from '../store/ducks/notifier';

export const rootURL = process.env.REACT_APP_V2_API_URL;
export const rootV2ChatURL = 'https://chat.v2saude.com.br';
export const rootCepURL = 'https://consultacep.v2saude.com.br/';
export const nexoDataURL = process.env.REACT_APP_NEXODATA_API_URL;
export const nexoData = process.env.REACT_APP_NEXODATA_URL;

const authS3 = {
  username: 'apikey',
  password: 'cZ2uxsGsQHeRU2j4Ny2hRUsUPFswWsjs',
};

export const authNexoData = {

  username: process.env.REACT_APP_NEXODATA_LOGIN,
  password: process.env.REACT_APP_NEXODATA_PWD,
};

/**
 * Função para atribuir o JWT nas requisições
 */
function accessTokenInterceptor(api) {
  api.interceptors.request.use((req) => {
    const config = req;
    const token = localStorage.getItem('@clin:accessToken');

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'Access-Control-Allow-Origin': '*',
      };
    }

    return config;
  });
}

/**
 * Service para acesso a API do Clin
 */
const api = axios.create({
  baseURL: rootURL,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat', skipBlank: true }),
});
accessTokenInterceptor(api);
api.interceptors.response.use(res => res, (err) => {
  if (err && err.response && err.response.status === 401) {
    store.dispatch(NotificationActions.clear());
    store.dispatch(NotificationActions.notify('Sessão expirada'));
    store.dispatch(UsuarioActions.signout());
  }
  return Promise.reject(err);
});
export default api;

/**
 * Service para acesso a API do V2Chat
 */
const configV2Chat = axios.create({
  baseURL: rootV2ChatURL,
});
accessTokenInterceptor(configV2Chat);
export const apiV2Chat = configV2Chat;

/**
 * Service para acesso a API do Consulta CEP
 */
const configConsultaCEP = axios.create({
  baseURL: rootCepURL,
});
accessTokenInterceptor(configConsultaCEP);
export const apiConsultaCEP = configConsultaCEP;


/**
 * Service para acesso ao S3
 */

const configS3 = axios.create({
  baseURL: `${rootURL}/s3`,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: '*/*',
  },
  auth: authS3,
  transformRequest: [data => qs.stringify(data)],
});

export const apiS3 = configS3;

/**
 * Service para acesso a api da NexoData - Minha Prescrição
 */

const configNexoData = axios.create({
  baseURL: nexoDataURL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/*',
    Accept: '*/*',
  },
  auth: authNexoData,
  // transformRequest: [data => qs.stringify(data)],
});


accessTokenInterceptor(configNexoData);
export const apiNexoData = configNexoData;
