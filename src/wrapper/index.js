
import React, { Component } from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';

import StoreConfig from '../store';
import connector from '../networking/connector';

import ReduxService from '../service';

export default class REDUX extends Component {
  constructor(props) {
    super(props);

    StoreConfig.initiateStore(this.props.additionalReducers, this.props.persistorStorageOverride);

    const { persistor, store } = StoreConfig.getStoreObjects();

    this.persistor = persistor;
    this.store = store;
  }

  componentDidMount() {
    if (this.props.setDebugWithCurlirize === true) {
      connector.setDebugWithCurlirize();
    }
  }

  persistorPurge() {
    this.persistor.purge();
  }

  render() {
    return (
      <Provider store={this.store}>
        <PersistGate
          loading={<ActivityIndicator />}
          persistor={this.persistor}
        >
          <ReduxService
            globalResponseIntercept={this.props.globalResponseIntercept}
            globalErrorFormatter={this.props.globalErrorFormatter}
            networkExceptionCallback={this.props.networkExceptionCallback}
            networkTestAction={this.props.networkTestAction}
            networkTestDelay={this.props.networkTestDelay}
            defaultContentTypes={this.props.defaultContentTypes}
          />
          {this.props.children}
        </PersistGate>
      </Provider>
    );
  }
}

REDUX.defaultProps = {
  setDebugWithCurlirize: false,

  networkExceptionCallback: () => {},
  globalResponseIntercept: () => {},
  globalErrorFormatter: data => data,

  additionalReducers: [],

  networkTestAction: {},
  networkTestDelay: 10000,

  persistorStorageOverride: null,

  defaultContentTypes: {
    get: null,
    post: 'application/json',
    patch: 'application/json',
    delete: 'application/json',
    head: null,
    options: null,
    put: 'application/json',
  },
};

REDUX.propTypes = {
  setDebugWithCurlirize: PropTypes.bool,

  networkExceptionCallback: PropTypes.func,
  globalResponseIntercept: PropTypes.func,
  globalErrorFormatter: PropTypes.func,

  additionalReducers: PropTypes.array,

  networkTestAction: PropTypes.object,
  networkTestDelay: PropTypes.number,

  persistorStorageOverride: PropTypes.any,

  children: PropTypes.any.isRequired,

  defaultContentTypes: PropTypes.object,
};
