import axios from 'axios';
import { rootURL as baseURL } from '../api';

const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'multipart/form-data', Accept: '*/*' };
const auth = { username: 'apikey', password: 'cZ2uxsGsQHeRU2j4Ny2hRUsUPFswWsjs' };

export default class GenericFileService {
  static async uploadFile({
    file, bucketFileS3, key, filename, contentType,
  }) {
    const { data } = await axios.put(`${baseURL}/s3/file/?bucket=${bucketFileS3}&key=${key}&filename=${filename}&contentType=${contentType}`, file, { headers, auth });

    return data;
  }

  static async downloadFile({
    bucketFileS3: bucket, filename, key,
  }) {
    const { data } = await axios.get(`${baseURL}/s3/file/`, {
      params: {
        bucket,
        filename,
        key,
      },
      headers,
      auth,
      responseType: 'arraybuffer',
    });

    return data;
  }

  static async listFiles({
    bucketFileS3: bucket, key,
  }) {
    const { data } = await axios.get(`${baseURL}/s3/file/list`, {
      params: {
        bucket,
        key,
      },
      headers,
      auth,
    });

    return data;
  }
}
