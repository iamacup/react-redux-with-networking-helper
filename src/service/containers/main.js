
import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as NetworkActions from '../../store/global-redux/networking/actions';
import * as NetworkSelectors from '../../store/global-redux/networking/selectors';

import ReduxServiceMainView from '../views/main';

class ReduxServiceMainContainer extends Component {
  render() {
    return <ReduxServiceMainView {...this.props} />;
  }
}

const makeMapStateToProps = () => {
  const getGlobalCallback1 = NetworkSelectors.makeGetGlobalCallback();
  const getGlobalCallback2 = NetworkSelectors.makeGetGlobalCallback();
  const getGlobalCallback3 = NetworkSelectors.makeGetGlobalCallback();

  const getGlobalData1 = NetworkSelectors.makeGetGlobalData();

  const getNetworkConnectivityState = NetworkSelectors.makeGetNetworkConnectivityState();
  const getNetworkTimeouts = NetworkSelectors.makeGetNetworkTimeouts();

  const getNetworkData1 = NetworkSelectors.makeGetNetworkData();

  function mapStateToProps(state) {
    return {
      _globalErrorFormatter: getGlobalCallback1(state, '_errorFormatterCallback'),
      _globalResponseIntercept: getGlobalCallback2(state, '_responseInterceptCallback'),
      _networkExceptionCallback: getGlobalCallback3(state, '_networkExceptionCallback'),

      _defaultContentTypes: getGlobalData1(state, '_defaultContentTypes'),

      _networkConnectivityState: getNetworkConnectivityState(state),
      _timeouts: getNetworkTimeouts(state),

      _networkData: getNetworkData1(state, '_networkTest'),
    };
  }

  return mapStateToProps;
};

function mapDispatchToProps(dispatch) {
  return {
    $expireNetworkConnection: internalID => dispatch(NetworkActions.expireNetworkConnection(internalID)),

    $setGlobalErrorFormatter: handler => dispatch(NetworkActions.setInternalGlobalCallback('_errorFormatterCallback', handler)),
    $setGlobalResponseIntercept: handler => dispatch(NetworkActions.setInternalGlobalCallback('_responseInterceptCallback', handler)),
    $setNetworkExceptionCallback: handler => dispatch(NetworkActions.setInternalGlobalCallback('_networkExceptionCallback', handler)),

    $setDefaultContentTypes: data => dispatch(NetworkActions.setInternalGlobalData('_defaultContentTypes', data)),

    $runNetworkTestAction: (networkTestAction) => {
      networkTestAction.config.identifier = '_networkTest'; // eslint-disable-line no-param-reassign
      return dispatch(networkTestAction);
    },
  };
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps,
)(ReduxServiceMainContainer);
