import React from 'react';

import {
  DataSelectors,
  DataActions,
  useSelector,
  useDispatch,
} from 'react-redux-with-networking-helper';

import {TextInput, Text} from 'react-native';

export default () => {
  const _theText = useSelector(state =>
    DataSelectors.getData(state, 'myData.theText', ''),
  );
  
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <Text style={{marginBottom: 20}}>{_theText}</Text>
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={text =>
          dispatch(DataActions.setData('myData.theText', text))
        }
        value={_theText}
      />
    </React.Fragment>
  );
};
