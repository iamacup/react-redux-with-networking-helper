
import uuidv4 from 'uuid/v4';

// need to be able to handle:
// individual items being added to the target instead of keyed items
// arrays being merged onto a target im some form - may need to expose a function that overrides the reducers method?
// rename uuid to internal identifier as its possible someone might use uuid as the identifier and it confuses stuff
// need to be able to handle retry automatically

// we drop any success response onto the global data using a vareity of configurations
// we drop any error + request tracking information elsewhere to keep the global data pure and truthy always

const defaultGetOptions = {
  // the url to hit
  url: null,
  // a string (location.other.place) to target in the global data or null to not put it into the global data
  responseTarget: null,
  // decides how to handle placement of the data onto the responseTarget, merge will shallow merge the object, set will just set it, concatFirst and concatLast will perform an array concatenation (start of end of the existing array) - note concat does not work with a key extractor
  responseTargetMethod: 'set',
  // identifier used to monitor the status of this request if you don't need to hook into the response at all set this to null,
  identifier: null,
  // any request data
  data: {},
  // if this is true, there can be more than 1 request for the same identifier, see multiIdentifier
  multi: false,
  // if this is not null, it will be used as a sub identifier (see selectors to understand how it is used), if null, uuid will be generated
  multiIdentifier: null,

  // a function that is called with any 200 <> 299 status code, can return an array of objects to be dumped into the responseTarget - the keyExtractor will be called to distribute them properly, if this does not return an array, it will not call the key extractor at all and just dump onto the location, if the key extractor is null, the response will just be dumped onto the location - existing data is NULL if no responseTarget specified, or is the current data in the store ({} if no data) at that target
  // successFormatHandler: (data, statusCode, existingData, responseHeaders) => data,
  successFormatHandler: null,
  // a function that is called with any other status code not captured by the success handler, whatever is returned by this function is returned as the data attribute when there is an error, note it is possible for this function to recieve an exception (Error) type as well as an actual response, the statusCode will be -1 if this is the case with the error as the third argument, and the error.toString() value as the data
  errorFormatHandler: null, // (data, statusCode, err, responseHeaders) => { return data; },
  // a function that is called with any 200 <> 299 status code after the sucessFormatHandler in case you need to do any side effects as a result of a success condition
  successCallback: null, // (/*formattedData, originalData, statusCode, responseHeaders*/) => {},
  // called when there is an error
  errorCallback: null, // (/*formattedData, originalData, statusCode, responseHeaders*/) => {},
  // this function is called right before prior to successFormatHandler and the insert action for response target which can be used to remove / clean up old state changes
  preDataInsertCleanupHandler: null, // (existingData, modifiedKeys, networkState, responseHeaders) => {}

  // this is called for every element returned by the successFormatHandler and should return a key that will be used to allocate the data to the responseTarget.[key] location. if it is null then it will not be used and the data will be just dumped onto the object, this will not be called if the data returned from successFormatHAndler is not an array
  keyExtractor: /* (item, index) => {}, */ null,
  // This is called before the success format handler with the same conditions as success format handler (200 <> 299 status) - any thing return by this needs to be an array of { name: 'header-name', value: 'header-value' } and will update the global headers so every subsequent request has this thign in it, useful for authentication
  setGlobalHeaders: /* (data, statusCode) => {}, */ null,

  // array of additional headers in the format of { name: 'header-name', value: 'header-value' } to be added on, these are applied LAST so can overwride global headers
  additionalHeaders: [],
  // this is set as a Content-Type header for post requests, will be ignored if any Content-Type header is already set, set to null to just not use this at all
  postDefaultContentType: 'application/json',
  // if this is set to true, the data will be put onto the network state as well as anhything that happened with responseTarget etc. t
  dumpSuccessResponseToNetworkState: false,

  // if autoRetryOnNetworkReconnection is true, we will retry this network request if it fails due to network connectivity once connectivity is re-established
  autoRetryOnNetworkReconnection: false,

  // once this many seconds have gone by, the network state will be set to TIMED_OUT, negative numbers are ignored entirely
  timeout: -1,
};

export function startGET(config) {
  return startRequest(config, 'get');
}

export function startPOST(config) {
  return startRequest(config, 'post');
}

export function startPATCH(config) {
  return startRequest(config, 'patch');
}

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

export function addGlobalHeaders(headers) {
  return {
    type: 'GLOBAL_NETWORK_ADD_HEADERS',
    headers,
  };
}

export function addInternalReferenceData(key, value) {
  return {
    type: 'GLOBAL_NETWORK_ADD_INTERNAL_REFERENCE_DATA',
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

