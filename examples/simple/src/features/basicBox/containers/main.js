import React, {Component} from 'react';
import {
  connect,
  DataSelectors,
  DataActions,
} from 'react-redux-with-networking-helper';

import BasicBoxMainView from '../views/main';

class BasicBoxMainContainer extends Component {
  render() {
    return <BasicBoxMainView {...this.props} />;
  }
}

function mapStateToProps(state) {
  return {
    _theText: DataSelectors.getData(state, 'myData.theText', ''),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    $setTheText: text => dispatch(DataActions.setData('myData.theText', text)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BasicBoxMainContainer);
