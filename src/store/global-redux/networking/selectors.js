
// import { createSelector } from 'reselect';

// @TODO we really must document how these can all be called as it is quite messy and might
// be better split out into multiple functions instead of multi purpose functions
// that have different arguments for different types of scenarios
import createDeepEqualitySelector from '../../../lib/createDeepEqualitySelector';
import { isDefined } from '../../../lib/isDefined';
import { STATES } from '../../../networking/states';

// returns an array of responses for the endpoint - newest last, oldest first
// const targetEndpointAll = (state, props) => {
//   const results = [];
//   const { dataSubscriptionEndpoint, dataSubscriptionCaller } = props;

//   // we look to see if we care about endpoints
//   if (dataSubscriptionEndpoint === null) {
//     Object.keys(state.globalNetworkReducer).forEach((value) => {
//       // if we need to match the caller, match it here
//       if (typeof dataSubscriptionCaller !== 'undefined') {
//         if (state.globalNetworkReducer[value].caller === dataSubscriptionCaller) {
//           results.push(Object.assign({}, state.globalNetworkReducer[value]));
//         }
//       }
//     });
//   } else {
//     Object.keys(state.globalNetworkReducer).forEach((value) => {
//       // collect everything where the path matches the endpoing we are looking for
//       if (state.globalNetworkReducer[value].path && state.globalNetworkReducer[value].path === dataSubscriptionEndpoint) {
//         // if we need to match the caller, match it here, otherwise just add the data
//         if (typeof dataSubscriptionCaller !== 'undefined') {
//           if (state.globalNetworkReducer[value].caller === dataSubscriptionCaller) {
//             results.push(Object.assign({}, state.globalNetworkReducer[value]));
//           }
//         } else {
//           results.push(Object.assign({}, state.globalNetworkReducer[value]));
//         }
//       }
//     });
//   }

//   // sort the results so the oldest is first, newest is last
//   results.sort((a, b) => {
//     if (a.startTimestamp < b.startTimestamp) return -1;
//     if (a.startTimestamp > b.startTimestamp) return 1;
//     return 0;
//   });

//   return results;
// };


// // @ todo this might behave wierd when dataSubscriptionEndpoint is not defined in so much as
// // it always returns an object, but targetEndspointsLatest returns an object if DSE specified
// // and an array if not.
// const targetEndpointLatest = (state, props) => {
//   const res = targetEndpointAll(state, props);

//   if (res.length === 0) {
//     return {};
//   }

//   return res[res.length - 1];
// };

// const targetEndpointsLatest = (state, props) => {
//   const { dataSubscriptionEndpoints } = props;

//   // we check to see if we are listening for endpoints
//   if (dataSubscriptionEndpoints.length > 0) {
//     const results = {};

//     dataSubscriptionEndpoints.forEach((value) => {
//       const arr = targetEndpointAll(state, { ...props, dataSubscriptionEndpoint: value });

//       if (arr.length > 0) {
//         results[value] = arr[arr.length - 1];
//       } else {
//         results[value] = {};
//       }
//     });

//     return results;
//   }
//   const results = [];
//   const arr = targetEndpointAll(state, { ...props, dataSubscriptionEndpoint: null });

//   // now we have to sort out getting only the 'latest' things, because we know targetEndpointAll
//   // returns an ordered list, so we just need to get the first unique item we see (but in reverse order)
//   const picked = {};

//   for (let a = arr.length - 1; a > -1; a--) {
//     if (!(arr[a].path in picked)) {
//       results.push(arr[a]);
//       picked[arr[a].path] = true;
//     }
//   }

//   // @todo we should sort this array alphabetically by path - because then the selector
//   // will not fire as many times if order changes

//   return results;
// };

// // THESE ARE FACTORIES - see the reselect documentation to understand why we use them - but in short
// // it is to do with the caching applied to the selector
// export const makeGetNetworkSingleLatest = () => createDeepEqualitySelector(
//   [
//     targetEndpointLatest,
//   ],
//   data => data,
// );

// export const makeGetNetworkMultipleLatest = () => createDeepEqualitySelector(
//   [
//     targetEndpointsLatest,
//   ],
//   data => data,
// );

// // returns the current token for the user
// export const getToken = createDeepEqualitySelector(
//   [
//     state => state.globalNetworkReducer._token,
//   ],
//   data => data,
// );

// export const makeGetToken = () => createDeepEqualitySelector(
//   [
//     state => state.globalNetworkReducer._token,
//   ],
//   data => data,
// );

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
