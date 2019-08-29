
import { Component } from 'react';
import PropTypes from 'prop-types';

import { STATES } from '../../networking/states';

import { isDefined } from '../../lib/isDefined';

let timeoutRef = null;

class ReduxServiceMainView extends Component {
  componentDidMount() {
    this.props.$setGlobalErrorFormatter(this.props.globalErrorFormatter);
    this.props.$setGlobalResponseIntercept(this.props.globalResponseIntercept);
    this.props.$setNetworkExceptionCallback(this.props.networkExceptionCallback);

    this.checkExpired();
  }

  componentDidUpdate(prevProps) {
    // work out if the state was cleared in some way and re-introduce the bits we need
    if (this.props._globalErrorFormatter === null && prevProps._globalErrorFormatter !== null) {
      this.props.$setGlobalErrorFormatter(this.props.globalErrorFormatter);
    }

    if (this.props._globalResponseIntercept === null && prevProps._globalResponseIntercept !== null) {
      this.props.setGlobalResponseIntercept(this.props.globalResponseIntercept);
    }

    if (this.props._networkExceptionCallback === null && prevProps._networkExceptionCallback !== null) {
      this.props.$setNetworkExceptionCallback(this.props.networkExceptionCallback);
    }

    // we have no network connectivity
    if (this.props._networkConnectivityState === false && prevProps._networkConnectivityState === true) {
      this.checkNetwork(false);
    }

    // we have regained connectivity
    if (this.props._networkConnectivityState === true && prevProps._networkConnectivityState === false) {
      if (timeoutRef !== null) {
        clearTimeout(timeoutRef);
      }
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
    timeoutRef = setTimeout(() => {
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
  globalErrorFormatter: PropTypes.func.isRequired,
  networkExceptionCallback: PropTypes.func.isRequired,
  networkTestAction: PropTypes.object.isRequired,
  networkTestDelay: PropTypes.number.isRequired,
  globalResponseIntercept: PropTypes.func.isRequired,

  $setGlobalErrorFormatter: PropTypes.func.isRequired,
  $setGlobalResponseIntercept: PropTypes.func.isRequired,
  $setNetworkExceptionCallback: PropTypes.func.isRequired,
  $expireNetworkConnection: PropTypes.func.isRequired,

  _globalErrorFormatter: PropTypes.any,
  _globalResponseIntercept: PropTypes.any,
  _networkExceptionCallback: PropTypes.any,
  _networkData: PropTypes.object.isRequired,
};

export default ReduxServiceMainView;
