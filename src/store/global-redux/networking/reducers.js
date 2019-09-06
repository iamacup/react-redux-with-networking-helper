
// we have to ignore this rule because of the immer library - we reassign on draft
/* eslint no-param-reassign: 0 */

import produce from 'immer';
import uuidv4 from 'uuid/v4';
import createReducer from '../../../lib/createReducer';

import { isDefined } from '../../../lib/isDefined';

import { STATES } from '../../../networking/states';


const initialState = {
  // storage stuff here
  _responses: {}, // this is what components tune into
  _timeouts: {}, // this is stuff for tracking network timeouts etc.
  _internals: {}, // this is for managing the internal state and meta data of an individual request

  // meta data
  _globalHeaders: [],
  _globalCallbacks: {
    _networkExceptionCallback: () => {},
    _responseInterceptCallback: () => {},
    _errorFormatterCallback: () => {},
  },
  _networkConnectivityState: true,
};

export const globalNetworkReducer = createReducer(initialState, {
  GLOBAL_NETWORK_REQUEST_INITIATE: (state, action) => produce(state, (draft) => {
    // put identifying information onto the state
    draft._internals[action.internalID] = {
      config: action.config,
    };

    // put the response stuff into the state
    if (action.config.identifier !== null) {
      if (action.config.multi === true) {
        const { multiIdentifier, identifier } = action.config;

        if (!isDefined(draft._responses[identifier])) {
          draft._responses[identifier] = {};
        }

        if (!isDefined(draft._responses[identifier][multiIdentifier])) {
          draft._responses[identifier][multiIdentifier] = {};
        }

        let useState = STATES.LOADING;

        if (isDefined(draft._responses[identifier][multiIdentifier].state)) {
          useState = STATES.RELOADING;
        }

        draft._responses[identifier][multiIdentifier] = {
          state: useState,
          statusCode: null,
          data: {},
          finished: false,
          started: true,
          startTimestamp: action.startTimestamp,
          endTimestamp: null,
          stateUpdatedKeys: null,
          _internalID: action.internalID,
        };
      } else {
        let useState = STATES.LOADING;

        if (isDefined(draft._responses[action.config.identifier]) && isDefined(draft._responses[action.config.identifier].state)) {
          useState = STATES.RELOADING;
        }

        draft._responses[action.config.identifier] = {
          state: useState,
          statusCode: null,
          data: {},
          finished: false,
          started: true,
          startTimestamp: action.startTimestamp,
          endTimestamp: null,
          stateUpdatedKeys: null,
          _internalID: action.internalID,
        };
      }

      // sort out timeouts
      if (action.config.timeout > 0) {
        const timeoutTimestamp = action.startTimestamp + (action.config.timeout * 1000);

        draft._timeouts[action.internalID] = {
          timestamp: timeoutTimestamp,
          identifier: action.config.identifier,
          multi: action.config.multi,
          multiIdentifier: action.config.multiIdentifier,
        };
      }
    }
  }),
  GLOBAL_NETWORK_REQUEST_RESPONSE: (state, action) => produce(state, (draft) => {
    if (action.internalID in state._internals) {
      const { config } = draft._internals[action.internalID];

      if (config.identifier !== null && isDefined(state._responses[config.identifier])) {
        if (config.multi === true) {
          if (isDefined(state._responses[config.identifier][config.multiIdentifier])) {
            draft._responses[config.identifier][config.multiIdentifier] = {
              state: action.state,
              statusCode: action.statusCode,
              data: action.data,
              finished: true,
              started: true,
              startTimestamp: state._responses[config.identifier][config.multiIdentifier].startTimestamp,
              endTimestamp: action.endTimestamp,
              stateUpdatedKeys: action.stateUpdatedKeys,
              _internalID: action.internalID,
            };
          }
        } else {
          draft._responses[config.identifier] = {
            state: action.state,
            statusCode: action.statusCode,
            data: action.data,
            finished: true,
            started: true,
            startTimestamp: state._responses[config.identifier].startTimestamp,
            endTimestamp: action.endTimestamp,
            stateUpdatedKeys: action.stateUpdatedKeys,
            _internalID: action.internalID,
          };
        }
      }

      delete draft._internals[action.internalID];
    }
  }),
  GLOBAL_NETWORK_ADD_HEADERS: (state, action) => produce(state, (draft) => {
    for (const newHeader of action.headers) {
      for (let a = 0; a < draft._globalHeaders.length; a++) {
        if (newHeader.name === state._globalHeaders[a].name) {
          draft._globalHeaders.splice(a, 1);
        }
      }
    }

    draft._globalHeaders = draft._globalHeaders.concat(action.headers);
  }),
  GLOBAL_NETWORK_ADD_INTERNAL_GLOBAL_CALLBACKS: (state, action) => produce(state, (draft) => {
    draft._globalCallbacks[action.key] = action.value;
  }),
  GLOBAL_NETWORK_CLEANUP_CANCELLED_REQUEST: (state, action) => produce(state, (draft) => {
    delete draft._internals[action.internalID];
    delete draft._timeouts[action.internalID];
  }),
  GLOBAL_NETWORK_CLEAR_NETWORK_DATA: (state, action) => produce(state, (draft) => {
    const identifiers = Array.isArray(action.identifier) ? action.identifier : [action.identifier];

    for (const identifier of identifiers) {
      delete draft._responses[identifier];
      // TODO would be nice to cleanup a timeout associated with the initial request maybe?
      // it will eventually clean itself up in GLOBAL_NETWORK_EXPIRE_ITEM
    }
  }),
  GLOBAL_NETWORK_CLEAR_ALL_NETWORK_DATA: (state, action) => initialState,
  GLOBAL_NETWORK_SET_CONNECTIVITY_STATE_DOWN: (state, action) => produce(state, (draft) => {
    draft._networkConnectivityState = false;
  }),
  GLOBAL_NETWORK_SET_CONNECTIVITY_STATE_UP: (state, action) => produce(state, (draft) => {
    draft._networkConnectivityState = true;
  }),
  GLOBAL_NETWORK_EXPIRE_ITEM: (state, action) => produce(state, (draft) => {
    if (action.internalID in state._timeouts) {
      const timeout = state._timeouts[action.internalID];

      if (state._timeouts[action.internalID].identifier in state._responses) {
        if (timeout.multi === true) {
          if (timeout.multiIdentifier in draft._responses[timeout.identifier]) {
            draft._responses[timeout.identifier][timeout.multiIdentifier].state = STATES.TIMED_OUT;
          }
        } else {
          draft._responses[timeout.identifier].state = STATES.TIMED_OUT;
        }
      }
    }

    delete draft._timeouts[action.internalID];
  }),
});
