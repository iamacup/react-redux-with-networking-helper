
import axios from 'axios';
import curlirize from 'axios-curlirize';
import { isDefined } from '../lib/isDefined';


const setDebugWithCurlirize = () => {
  curlirize(axios);
};

const startRequest = (method, url, data, postDefaultContentType, additionalHeaders) => {
  const headers = {};

  for (const headerItem of additionalHeaders) {
    headers[headerItem.name] = headerItem.value;
  }

  if (method === 'get') {
    return axios.request({
      method,
      url,
      headers,
      timeout: 10000,
    });
  } if (method === 'post' || method === 'patch') {
    if (!isDefined(headers['Content-Type']) && postDefaultContentType !== null) {
      headers['Content-Type'] = postDefaultContentType;
    }

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
