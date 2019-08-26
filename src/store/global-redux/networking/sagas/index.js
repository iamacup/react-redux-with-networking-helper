/**
 * Redux saga class init
 * There can be multiple sagas
 * Export them as an array
 * Top level sagas in store will take care of combining sagas
 */
import { takeEvery } from 'redux-saga/effects';
import globalNetworkRequestSaga from './globalNetworkRequest';

export const globalNetworkingSagas = [
  takeEvery('GLOBAL_NETWORK_REQUEST_INITIATE', globalNetworkRequestSaga),
];
