
// import { createSelector } from 'reselect';

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

export const makeGetNetworkData = () => createDeepEqualitySelector(
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


export const getNetworkData = createDeepEqualitySelector(
  [
    networkData,
  ],
  data => data,
);


export const getNetworkDataMulti = createDeepEqualitySelector(
  [
    networkDataMulti,
  ],
  data => data,
);





export const getGlobalHeaders = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._globalHeaders,
  ],
  data => data,
);

export const getGlobalErrorFormatter = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._globalErrorFormatter,
  ],
  data => data,
);

export const getGlobalResponseIntercept = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._globalResponseIntercept,
  ],
  data => data,
);

export const getNetworkExceptionCallback = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._networkExceptionCallback,
  ],
  data => data,
);

export const getNetworkConnectivityState = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._networkConnectivityState,
  ],
  data => data,
);

export const getNetworkTimeouts = createDeepEqualitySelector(
  [
    state => state.globalNetworkReducer._timeouts,
  ],
  data => data,
);




export const makeGetGlobalHeaders = () => createDeepEqualitySelector(
  [
    getGlobalHeaders,
  ],
  data => data,
);

export const makeGetGlobalErrorFormatter = () => createDeepEqualitySelector(
  [
    getGlobalErrorFormatter,
  ],
  data => data,
);

export const makeGetGlobalResponseIntercept = () => createDeepEqualitySelector(
  [
    getGlobalResponseIntercept,
  ],
  data => data,
);

export const makeGetNetworkExceptionCallback = () => createDeepEqualitySelector(
  [
    getNetworkExceptionCallback,
  ],
  data => data,
);

export const makeGetNetworkConnectivityState = () => createDeepEqualitySelector(
  [
    getNetworkConnectivityState,
  ],
  data => data,
);

export const makeGetNetworkTimeouts = () => createDeepEqualitySelector(
  [
    getNetworkTimeouts,
  ],
  data => data,
);
