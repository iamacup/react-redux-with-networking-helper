import React from 'react';

import {SafeAreaView, StatusBar} from 'react-native';

import {ReduxWrapper} from 'react-redux-with-networking-helper';

import BasicBox from './features/basicBox';

const App = () => {
  return (
    <ReduxWrapper>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={{justifyContent: 'center', flex: 1, marginHorizontal: '10%'}}>
        <BasicBox />
      </SafeAreaView>
    </ReduxWrapper>
  );
};

export default App;
