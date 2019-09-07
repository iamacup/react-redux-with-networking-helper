import React, {Component} from 'react';

import {TextInput, Text} from 'react-native';

export default class BasicBoxMainView extends Component {
  render() {
    return (
      <React.Fragment>
        <Text style={{marginBottom: 20}}>{this.props._theText}</Text>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={text => this.props.$setTheText(text)}
          value={this.props._theText}
        />
      </React.Fragment>
    );
  }
}
