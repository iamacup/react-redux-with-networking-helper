
import { Component } from 'react';
import PropTypes from 'prop-types';

import isEqual from 'lodash/isEqual';

import { STATES } from '../../networking/states';

class ReduxServiceMainView extends Component {
  constructor(props) {
    super(props);

    this.timeoutRef = null;
  }

  componentDidMount() {
    this.props.$setGlobalErrorFormatter(this.props.globalErrorFormatter);
    this.props.$setGlobalResponseIntercept(this.props.globalResponseIntercept);
    this.props.$setNetworkExceptionCallback(this.props.networkExceptionCallback);

    this.props.$setDefaultContentTypes(this.props.defaultContentTypes);

    this.checkExpired();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props._defaultContentTypes, prevProps._defaultContentTypes)) {
      this.props.$setDefaultContentTypes(this.props.defaultContentTypes);
    }

    if (prevProps._globalErrorFormatter !== null && this.props._globalErrorFormatter.toString() !== prevProps._globalErrorFormatter.toString()) {
      this.props.$setGlobalErrorFormatter(this.props.globalErrorFormatter);
    }

    if (prevProps._globalResponseIntercept !== null && this.props._globalResponseIntercept.toString() !== prevProps._globalResponseIntercept.toString()) {
      this.props.$setGlobalResponseIntercept(this.props.globalResponseIntercept);
    }

    if (prevProps._networkExceptionCallback !== null && this.props._networkExceptionCallback.toString() !== prevProps._networkExceptionCallback.toString()) {
      this.props.$setNetworkExceptionCallback(this.props.networkExceptionCallback);
    }

    // we have no network connectivity
    if (this.props._networkConnectivityState === false && prevProps._networkConnectivityState === true) {
      this.checkNetwork(false);
    }

    // we have regained connectivity
    if (this.props._networkConnectivityState === true && prevProps._networkConnectivityState === false) {
      if (this.timeoutRef !== null) {
        clearTimeout(this.timeoutRef);
      }
    }
  }

  componentWillUnmount() {
    if (this.timeoutRef !== null) {
      clearTimeout(this.timeoutRef);
    }
  }

  checkExpired() {
    const arr = Object.keys(this.props._timeouts);

    for (const value of arr) {
      const timeoutVal = this.props._timeouts[value].timestamp;
      const now = Date.now();

      if (timeoutVal <= now) {
        this.props.$expireNetworkConnection(value);
      }
    }

    setTimeout(() => {
      this.checkExpired();
    }, 1000);
  }

  checkNetwork(run) {
    this.timeoutRef = setTimeout(() => {
      this.checkNetwork(true);
    }, this.props.networkTestDelay);

    if (run === true) {
      if (this.props._networkData.finished === true || this.props._networkData.state === STATES.NOT_STARTED) {
        this.props.$runNetworkTestAction(this.props.networkTestAction);
      }
    }
  }

  render() {
    return null;
  }
}

ReduxServiceMainView.defaultProps = {
  _globalErrorFormatter: null,
  _networkExceptionCallback: null,
  _globalResponseIntercept: null,
};

ReduxServiceMainView.propTypes = {
  $setGlobalErrorFormatter: PropTypes.func.isRequired,
  $setGlobalResponseIntercept: PropTypes.func.isRequired,
  $setNetworkExceptionCallback: PropTypes.func.isRequired,
  $expireNetworkConnection: PropTypes.func.isRequired,
  $setDefaultContentTypes: PropTypes.func.isRequired,
  $runNetworkTestAction: PropTypes.func.isRequired,

  _globalErrorFormatter: PropTypes.any,
  _globalResponseIntercept: PropTypes.any,
  _networkExceptionCallback: PropTypes.any,
  _networkData: PropTypes.object.isRequired,
  _defaultContentTypes: PropTypes.object.isRequired,
  _networkConnectivityState: PropTypes.bool.isRequired,
  _timeouts: PropTypes.object.isRequired,

  globalErrorFormatter: PropTypes.func.isRequired,
  networkExceptionCallback: PropTypes.func.isRequired,
  networkTestAction: PropTypes.object.isRequired,
  networkTestDelay: PropTypes.number.isRequired,
  globalResponseIntercept: PropTypes.func.isRequired,
  defaultContentTypes: PropTypes.object.isRequired,
};

export default ReduxServiceMainView;
