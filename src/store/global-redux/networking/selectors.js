
// import { createSelector } from 'reselect';

// @TODO we really must document how these can all be called as it is quite messy and might
// be better split out into multiple functions instead of multi purpose functions
// that have different arguments for different types of scenarios
import createDeepEqualitySelector from '../../../lib/createDeepEqualitySelector';
import { isDefined } from '../../../lib/isDefined';
import { STATES } from '../../../networking/states';

const initialNetworkResponseState = {
  state: STATES.NOT_STARTED,
  statusCode: null,
  data: {},
  started: false,
  finished: false,
  startTimestamp: null,
  endTimestamp: null,
  stateUpdatedKeys: null,
  _internalID: null,
};

const initialNetworkResponseStateMulti = {};

const networkData = (state, identifier) => {
  if (isDefined(state.globalNetworkReducer._responses[identifier])) {
    return state.globalNetworkReducer._responses[identifier];
  }
  return initialNetworkResponseState;
};

const networkDataMulti = (state, identifier) => {
  if (isDefined(state.globalNetworkReducer._responses[identifier])) {
    return state.globalNetworkReducer._responses[identifier];
  }

  return initialNetworkResponseStateMulti;
};

// get network data stuff here
export const makeGetNetworkData = () => createDeepEqualitySelector(
  [
    networkData,
  ],
  data => data,
);

export const getNetworkData = createDeepEqualitySelector(
  [
    networkData,
  ],
  data => data,
);

export const makeGetNetworkDataMulti = () => createDeepEqualitySelector(
  [
    networkDataMulti,
  ],
  data => data,
);

export const getNetworkDataMulti = createDeepEqualitySelector(
  [
    networkDataMulti,
  ],
  data => data,
);

// global headers
export const getGlobalHeaders = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._globalHeaders,
  ],
  data => data,
);

export const makeGetGlobalHeaders = () => createDeepEqualitySelector(
  [
    getGlobalHeaders,
  ],
  data => data,
);

// network timeouts
export const getNetworkTimeouts = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._timeouts,
  ],
  data => data,
);

export const makeGetNetworkTimeouts = () => createDeepEqualitySelector(
  [
    getNetworkTimeouts,
  ],
  data => data,
);

// connectivity state
export const getNetworkConnectivityState = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._networkConnectivityState,
  ],
  data => data,
);

export const makeGetNetworkConnectivityState = () => createDeepEqualitySelector(
  [
    getNetworkConnectivityState,
  ],
  data => data,
);

// global callbacks
export const getGlobalCallbacks = createDeepEqualitySelector(
  [
    (state, identifier) => state.globalNetworkReducer._globalCallbacks,
  ],
  data => data,
);

export const makeGetGlobalCallbacks = () => createDeepEqualitySelector(
  [
    getGlobalCallbacks,
  ],
  data => data,
);

export const getGlobalCallback = createDeepEqualitySelector(
  [
    (state, identifier) => state.globalNetworkReducer._globalCallbacks[identifier],
  ],
  data => data,
);

export const makeGetGlobalCallback = () => createDeepEqualitySelector(
  [
    getGlobalCallback,
  ],
  data => data,
);

// global data
export const getAllGlobalData = createDeepEqualitySelector(
  [
    (state, identifier) => state.globalNetworkReducer._globalData,
  ],
  data => data,
);

export const makeGetAllGlobalData = () => createDeepEqualitySelector(
  [
    getAllGlobalData,
  ],
  data => data,
);

export const getGlobalData = createDeepEqualitySelector(
  [
    (state, identifier) => state.globalNetworkReducer._globalData[identifier],
  ],
  data => data,
);

export const makeGetGlobalData = () => createDeepEqualitySelector(
  [
    getGlobalData,
  ],
  data => data,
);
