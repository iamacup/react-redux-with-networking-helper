
import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';

import rootReducers from './reducers';
import sagas from './sagas';

const config = {
  key: 'root',
  storage,
  blacklist: [],
  debug: true,
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
