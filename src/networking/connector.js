
import axios from 'axios';
import curlirize from 'axios-curlirize';
import { isDefined } from '../lib/isDefined';

const setDebugWithCurlirize = () => {
  curlirize(axios);
};

// Content-Type

const startRequest = (method, url, data, additionalHeaders, defaultContentTypes) => {
  const headers = {};

  if (isDefined(defaultContentTypes[method])) {
    headers['Content-Type'] = defaultContentTypes[method];
  }

  for (const headerItem of additionalHeaders) {
    headers[headerItem.name] = headerItem.value;
  }

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
