import api from '../api';

export default class KatsukaiService {
  static async getAnimes(search) {
    const { data } = await api.get(`/anime/${search}`);
    
    return data;
  }

  static async getFeed(page) {
    const { data } = await api.get(`/page/${page}`);

    return data;
  }
}
