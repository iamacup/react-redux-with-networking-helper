
import uuidv4 from 'uuid/v4';

const defaultGetOptions = {
  url: null,
  responseTarget: null,
  responseTargetMethod: 'set',
  identifier: null,
  data: {},
  multi: false,
  multiIdentifier: null,

  successFormatHandler: null,
  errorFormatHandler: null,
  successCallback: null,
  errorCallback: null,
  preDataInsertCleanupHandler: null,

  keyExtractor: null,
  setGlobalHeaders: null,

  additionalHeaders: [],
  dumpSuccessResponseToNetworkState: false,

  autoRetryOnNetworkReconnection: false,

  timeout: -1,

  cancelInFlightWithSameIdentifiers: true,
};


/* INTERNAL */

export function startRequest(config, method) {
  const useConfig = Object.assign({}, defaultGetOptions, config);

  if (useConfig.url === null) {
    throw new Error('We did not get a URL');
  }

  if (useConfig.multi !== true && useConfig.multiIdentifier === null) {
    useConfig.multiIdentifier = uuidv4();
  }

  return {
    type: 'GLOBAL_NETWORK_REQUEST_INITIATE',
    method,
    startTimestamp: Date.now(),
    internalID: '_' + uuidv4(),
    config: useConfig,
  };
}

export function networkResponse(internalID, state, data, statusCode, stateUpdatedKeys) {
  return {
    type: 'GLOBAL_NETWORK_REQUEST_RESPONSE',
    internalID,
    state,
    data,
    statusCode,
    stateUpdatedKeys,
    endTimestamp: Date.now(),
  };
}

export function cleanupCancelledRequest(internalID) {
  return {
    type: 'GLOBAL_NETWORK_CLEANUP_CANCELLED_REQUEST',
    internalID,
  };
}

export function setInternalGlobalCallback(key, value) {
  return {
    type: 'GLOBAL_NETWORK_SET_INTERNAL_GLOBAL_CALLBACKS',
    key,
    value,
  };
}

export function setInternalGlobalData(key, value) {
  return {
    type: 'GLOBAL_NETWORK_SET_INTERNAL_GLOBAL_DATA',
    key,
    value,
  };
}

export function expireNetworkConnection(internalID) {
  return {
    type: 'GLOBAL_NETWORK_EXPIRE_ITEM',
    internalID,
  };
}

export function setConnectivityDown() {
  return {
    type: 'GLOBAL_NETWORK_SET_CONNECTIVITY_STATE_DOWN',
  };
}

export function setConnectivityUp() {
  return {
    type: 'GLOBAL_NETWORK_SET_CONNECTIVITY_STATE_UP',
  };
}

/* EXTERNAL */
export function startGET(config) {
  return startRequest(config, 'get');
}

export function startPOST(config) {
  return startRequest(config, 'post');
}

export function startPATCH(config) {
  return startRequest(config, 'patch');
}

export function startDELETE(config) {
  return startRequest(config, 'delete');
}

export function startHEAD(config) {
  return startRequest(config, 'head');
}

export function startOPTIONS(config) {
  return startRequest(config, 'options');
}

export function startPUT(config) {
  return startRequest(config, 'put');
}

export function clearNetworkData(identifier) {
  return {
    type: 'GLOBAL_NETWORK_CLEAR_NETWORK_DATA',
    identifier,
  };
}

export function clearAllNetworkData() {
  return {
    type: 'GLOBAL_NETWORK_CLEAR_ALL_NETWORK_DATA',
  };
}

export function setGlobalHeaders(headers) {
  return {
    type: 'GLOBAL_NETWORK_ADD_HEADERS',
    headers,
  };
}
