import axios from 'axios';
import qs from 'qs';
import store from '../store';
import UsuarioActions from '../store/ducks/usuario';
import NotificationActions from '../store/ducks/notifier';

export const rootURL = process.env.REACT_APP_V2_API_URL;

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
 * Service para acesso ao S3
 */
