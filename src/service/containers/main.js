
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

  const getNetworkConnectivityState = NetworkSelectors.makeGetNetworkConnectivityState();
  const getNetworkTimeouts = NetworkSelectors.makeGetNetworkTimeouts();

  const getNetworkData1 = NetworkSelectors.makeGetNetworkData();

  function mapStateToProps(state) {
    return {
      _globalErrorFormatter: getGlobalCallback1(state, 'errorFormatterCallback'),
      _globalResponseIntercept: getGlobalCallback2(state, 'responseInterceptCallback'),
      _networkExceptionCallback: getGlobalCallback3(state, 'networkExceptionCallback'),

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

    $setGlobalErrorFormatter: handler => dispatch(NetworkActions.addInternalGlobalCallback('_errorFormatterCallback', handler)),
    $setGlobalResponseIntercept: handler => dispatch(NetworkActions.addInternalGlobalCallback('_responseInterceptCallback', handler)),
    $setNetworkExceptionCallback: handler => dispatch(NetworkActions.addInternalGlobalCallback('_networkExceptionCallback', handler)),

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
