
/* eslint no-param-reassign: 0 */

import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistCombineReducers, createTransform } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import produce from 'immer';

import rootReducers from './reducers';
import sagas from './sagas';

// we use a transform to not persist in flight network data
const DoNotSaveTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    const _responsesPre = produce(inboundState._responses, (draft) => {
      for (const itemKey in inboundState._responses) {
        const data = inboundState._responses[itemKey];

        if ('_internalID' in data) {
          if (data.finished !== true) {
            delete draft[itemKey];
          }
        } else {
          for (const itemKey2 in data) {
            const data2 = data[itemKey2];

            if ('_internalID' in data2) {
              if (data2.finished !== true) {
                delete draft[itemKey][itemKey2];
              }
            }
          }
        }
      }
    });

    // remove any empty things from the state
    const _responses = produce(_responsesPre, (draft) => {
      for (const itemKey in _responsesPre) {
        if (Object.keys(_responsesPre[itemKey]).length === 0) {
          delete draft[itemKey];
        }
      }
    });

    return { ...inboundState, _responses };
  },
  // transform state being rehydrated
  outboundState => outboundState,
  // define which reducers this transform gets called for.
  { whitelist: ['globalNetworkReducer'] },
);


const config = {
  key: 'root',
  storage,
  blacklist: [],
  debug: true,
  transforms: [DoNotSaveTransform],
};

let persistor = null;
let store = null;

const initiateStore = (userReducers, persistorStorageOverride) => {
  if (persistorStorageOverride !== null) {
    config.storage = persistorStorageOverride;
  }

  let finalReducers = {};

  for (const item of rootReducers) {
    finalReducers = Object.assign(finalReducers, item);
  }

  for (const item of userReducers) {
    finalReducers = Object.assign(finalReducers, item);
  }

  const middleware = [];
  const sagaMiddleware = createSagaMiddleware();

  middleware.push(sagaMiddleware);

  if (__DEV__) {
    middleware.push(createLogger({ collapsed: true }));
  }

  const reducers = persistCombineReducers(config, finalReducers);
  const enhancers = [applyMiddleware(...middleware)];
  const initialState = {};
  const persistConfig = { enhancers };
  store = createStore(reducers, initialState, compose(...enhancers));
  persistor = persistStore(store, persistConfig, () => {
    // console.log('Test', store.getState());
  });

  sagaMiddleware.run(sagas);
};

// initiateStore must be called before calling this or you just get null
const getStoreObjects = () => ({ persistor, store });

export default {
  getStoreObjects,
  initiateStore,
};
