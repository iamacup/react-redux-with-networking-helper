/**
 *  Redux saga class init
 * Import every feature saga here
 *
 */
import { all } from 'redux-saga/effects';
import { globalNetworkingSagas } from './global-redux/networking/sagas';

export default function* rootSaga() {
  yield all([
    ...globalNetworkingSagas,
  ]);
}
