
import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'lodash/isEqual';

// we wrap the isEqual so we can debug it with the console logs if needed
// console.log('COMPARE', one, two);
// const wrap = (one, two) => isEqual(one, two);

const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

export default createDeepEqualSelector;
