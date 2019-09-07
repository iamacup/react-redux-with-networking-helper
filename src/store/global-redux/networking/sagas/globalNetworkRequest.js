
import {
  put, call, select, fork, take, cancelled, cancel,
} from 'redux-saga/effects';

// import { isDefined } from '@lib/isDefined';

import connector from '../../../../networking/connector';
import * as globalNetworkingActions from '../actions';
import * as globalReferenceDataActions from '../../referenceData/actions';

import {
  getGlobalHeaders, getGlobalCallbacks, getAllGlobalData, getNetworkConnectivityState, getNetworkData, getNetworkDataMulti,
} from '../selectors';
import { getData } from '../../referenceData/selectors';

import { STATES } from '../../../../networking/states';

export function* retryRequest(previousAction) {
  yield take('GLOBAL_NETWORK_SET_CONNECTIVITY_STATE_UP');
  yield put(previousAction);
}

const tasks = {

};

const generateIdentifier = ({ config }) => {
  let taskIdentifier = null;

  if (config.identifier !== null) {
    const { identifier } = config;

    if (config.multi === true) {
      const { multiIdentifier } = config;
      taskIdentifier = identifier + '-' + multiIdentifier;
    } else {
      taskIdentifier = identifier;
    }
  }

  return taskIdentifier;
};

export default function* performNetworkRequest(action) {
  if (action.config.cancelInFlightWithSameIdentifiers === true) {
    const taskIdentifier = yield call(generateIdentifier, action);

    if (taskIdentifier !== null && taskIdentifier in tasks) {
      yield cancel(tasks[taskIdentifier]);
    }

    const networkTask = yield fork(networkRequestWorker, action);

    if (taskIdentifier !== null) {
      tasks[taskIdentifier] = networkTask;
    }
  } else {
    yield fork(networkRequestWorker, action);
  }
}

function* networkRequestWorker(action) {
  // load up some stuff from the global state
  const globalHeaders = yield select(getGlobalHeaders);
  const connectivityState = yield select(getNetworkConnectivityState);

  const globalCallbacks = yield select(getGlobalCallbacks);

  const globalErrorFormatter = globalCallbacks._errorFormatterCallback;
  const globalResponseIntercept = globalCallbacks._responseInterceptCallback;
  const networkExceptionHandler = globalCallbacks._networkExceptionCallback;

  const globalData = yield select(getAllGlobalData);

  const defaultContentTypes = globalData._defaultContentTypes;

  let currentResponseState = null;

  if (action.config.multi === true) {
    currentResponseState = yield select(getNetworkDataMulti, action.config.identifier);
    currentResponseState = currentResponseState[action.config.multiIdentifier];
  } else {
    currentResponseState = yield select(getNetworkData, action.config.identifier);
  }

  try {
    // we make the intiial request
    const response = yield call(
      connector.startRequest,
      action.method,
      action.config.url,
      action.config.data,
      globalHeaders.concat(action.config.additionalHeaders),
      defaultContentTypes,
    );

    // we assume this means there is network connectivity because we got some kidn of response
    if (connectivityState !== true) {
      yield put(globalNetworkingActions.setConnectivityUp());
    }

    if (response.status >= 200 && response.status <= 299) {
      // SUCCESS

      // see if we need to do some formatting
      let insertData = response.data;

      if (action.config.successFormatHandler !== null) {
        let existingData = null;

        // we grab the existing stuff from the state if there is a response target and the successFormatHandler specifies 3+ arguments
        if (action.config.responseTarget !== null && action.config.successFormatHandler.length >= 3) {
          existingData = yield select(getData, action.config.responseTarget);
        }

        insertData = yield call(action.config.successFormatHandler, response.data, response.status, existingData, response.headers);
      }

      // work out if we need to do some header setting
      if (action.config.setGlobalHeaders !== null) {
        const newAdditionalGlobalHeaders = yield call(action.config.setGlobalHeaders, insertData, response.data, response.status);

        if (Array.isArray(newAdditionalGlobalHeaders)) {
          yield put(globalNetworkingActions.setGlobalHeaders(newAdditionalGlobalHeaders));
        }
      }

      // we work out the keys we are going to update / set
      let stateUpdatedKeys = null;

      if (action.config.responseTarget !== null) {
        if (action.config.keyExtractor !== null && Array.isArray(insertData)) {
          stateUpdatedKeys = [];

          for (let a = 0; a < insertData.length; a++) {
            const key = action.config.keyExtractor(insertData[a], a);
            stateUpdatedKeys.push(key);
          }
        }
      }

      // cleanup any previous response
      if (action.config.preDataInsertCleanupHandler !== null) {
        const existingData = yield select(getData, action.config.responseTarget);

        yield call(action.config.preDataInsertCleanupHandler, existingData, stateUpdatedKeys, currentResponseState.state, response.headers);
      }

      // drop the response onto the state if we need to
      if (action.config.responseTarget !== null) {
        if (action.config.responseTargetMethod === 'merge') {
          yield put(globalReferenceDataActions.mergeData(action.config.responseTarget, insertData, stateUpdatedKeys));
        } else if (action.config.responseTargetMethod === 'concatFirst') {
          yield put(globalReferenceDataActions.concatFirstData(action.config.responseTarget, insertData, stateUpdatedKeys));
        } else if (action.config.responseTargetMethod === 'concatLast') {
          yield put(globalReferenceDataActions.concatLastData(action.config.responseTarget, insertData, stateUpdatedKeys));
        } else {
          yield put(globalReferenceDataActions.setData(action.config.responseTarget, insertData, stateUpdatedKeys));
        }
      }

      // run the success callback
      if (action.config.successCallback !== null) {
        yield call(action.config.successCallback, insertData, response.data, response.status, response.headers);
      }

      // global intercept
      yield call(globalResponseIntercept, {
        type: 'success',
        insertData,
        responseData: response.data,
        responseStatusCode: response.status,
        responseHeaders: response.headers,
      });

      // drop the success onto the network state if needed
      let dataToState = {};

      if (action.config.dumpSuccessResponseToNetworkState === true) {
        dataToState = insertData;
      }

      // finally update the response
      yield put(globalNetworkingActions.networkResponse(action.internalID, STATES.SUCCESS, dataToState, response.status, stateUpdatedKeys));
    } else {
      // ERROR
      const globalErrorFormatterOutput = yield call(globalErrorFormatter, response.data, response.status);

      let dataToState = globalErrorFormatterOutput;

      if (action.config.errorFormatHandler !== null) {
        dataToState = yield call(action.config.errorFormatHandler, globalErrorFormatterOutput, response.status, response.headers);
      }

      // check to see if we have an error callback
      if (action.config.errorCallback !== null) {
        yield call(action.config.errorCallback, dataToState, response.data, response.status, response.headers);
      }

      // global intercept
      yield call(globalResponseIntercept, {
        type: 'error',
        insertData: dataToState,
        responseData: response.data,
        responseStatusCode: response.status,
        responseHeaders: response.headers,
      });

      // finish
      yield put(globalNetworkingActions.networkResponse(action.internalID, STATES.ERROR, dataToState, response.status));
    }
  } catch (err) {
    // ERROR thrown as exception - work out if if really was an Error object or just axios wrapping
    if (typeof err.response === 'undefined') {
      // we assume this means there is no network connectivity
      if (connectivityState !== false) {
        yield put(globalNetworkingActions.setConnectivityDown());
      }

      // if it is an exception, we call the networkExceptionHandler to throw it up to some specified handler
      yield call(networkExceptionHandler, err);

      // then handle callbacks
      const exceptionStatusCode = -1;
      let dataToState = err.toString();

      if (action.config.errorFormatHandler !== null) {
        dataToState = yield call(action.config.errorFormatHandler, err.toString(), exceptionStatusCode, err, {});
      }

      // check to see if we have an error callback
      if (action.config.errorCallback !== null) {
        yield call(action.config.errorCallback, dataToState, err, exceptionStatusCode, {});
      }

      // global intercept
      yield call(globalResponseIntercept, {
        type: 'error',
        insertData: dataToState,
        responseData: err,
        responseStatusCode: exceptionStatusCode,
        responseHeaders: {},
      });

      // finish
      yield put(globalNetworkingActions.networkResponse(action.internalID, STATES.ERROR, dataToState, exceptionStatusCode));

      // setup for a retry
      if (action.config.autoRetryOnNetworkReconnection === true) {
        yield fork(retryRequest, action);
      }
    } else {
      // we assume this means there is network connectivity because we got some kidn of response
      if (connectivityState !== true) {
        yield put(globalNetworkingActions.setConnectivityUp());
      }

      // this is not an exception so we throw it through the global error formatter
      const globalErrorFormatterOutput = yield call(globalErrorFormatter, err.response.data, err.response.status);

      let dataToState = globalErrorFormatterOutput;

      if (action.config.errorFormatHandler !== null) {
        dataToState = yield call(action.config.errorFormatHandler, globalErrorFormatterOutput, err.response.status, err.response.headers);
      }

      // check to see if we have an error callback
      if (action.config.errorCallback !== null) {
        yield call(action.config.errorCallback, dataToState, err.response.data, err.response.status, err.response.headers);
      }

      // global intercept
      yield call(globalResponseIntercept, {
        type: 'error',
        insertData: dataToState,
        responseData: err.response.data,
        responseStatusCode: err.response.status,
        responseHeaders: err.response.headers,
      });

      // finish
      yield put(globalNetworkingActions.networkResponse(action.internalID, STATES.ERROR, dataToState, err.response.status));
    }
  } finally {
    if (action.config.cancelInFlightWithSameIdentifiers === true) {
      const taskIdentifier = yield call(generateIdentifier, action);

      if (taskIdentifier !== null) {
        delete tasks[taskIdentifier];
      }
    }

    if (yield cancelled()) {
      yield put(globalNetworkingActions.cleanupCancelledRequest(action.internalID));
    }
  }
}
