
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

    StoreConfig.initiateStore(this.props.additionalReducers);

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
            globalErrorFormatter={this.props.globalErrorFormatter}
            networkExceptionCallback={this.props.networkExceptionCallback}
            networkTestAction={this.props.networkTestAction}
            networkTestDelay={this.props.networkTestDelay}
          />

          {this.props.children}
        </PersistGate>
      </Provider>
    );
  }
}

REDUX.defaultProps = {
  networkExceptionCallback: () => {},
  setDebugWithCurlirize: false,
  additionalReducers: [],
  globalErrorFormatter: data => data,
  networkTestAction: {},
  networkTestDelay: 10000,
};

REDUX.propTypes = {
  networkExceptionCallback: PropTypes.func,
  setDebugWithCurlirize: PropTypes.bool,
  additionalReducers: PropTypes.array,
  globalErrorFormatter: PropTypes.func,
  children: PropTypes.any.isRequired,
  networkTestAction: PropTypes.object,
  networkTestDelay: PropTypes.number,
};
