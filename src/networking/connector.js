
import axios from 'axios';
import curlirize from 'axios-curlirize';

const setDebugWithCurlirize = () => {
  curlirize(axios);
};

const startRequest = (method, url, data, headers) => {
  if (method === 'get' || method === 'head' || method === 'options') {
    return axios.request({
      method,
      url,
      headers,
      timeout: 10000,
    });
  } if (method === 'post' || method === 'patch' || method === 'delete' || method === 'put') {
    return axios.request({
      method,
      url,
      data,
      headers,
      timeout: 10000,
    });
  }

  throw new Error('Unsupported method: ' + method);
};

export default {
  startRequest,
  setDebugWithCurlirize,
};
