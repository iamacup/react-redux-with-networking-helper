
// import { createSelector } from 'reselect';

import merge from 'lodash/merge';
import createDeepEqualitySelector from '../../../lib/createDeepEqualitySelector';
import { isDefined } from '../../../lib/isDefined';

// when calling one of the getData functions inside of the return for mapStateToProps you can specify an emptyReturn which will decide what comes back if the thing is not found
const targetReferenceData = (state, inputLocation, emptyReturn = {}) => {
  const location = inputLocation.split('.');

  // use this to keep a track of current nesting object
  let ref = state.globalReferenceDataReducer;

  for (let a = 0; a < location.length; a++) {
    let useLocation = location[a];

    // work out if we are looking at an array value and convert it to an real number
    if (useLocation.substring(0, 1) === '[' && useLocation.substring(useLocation.length - 1, useLocation.length) === ']') {
      useLocation = Number.parseInt(useLocation.substring(1, useLocation.length - 1), 10);
    }

    // we encountered non existant level, just return an empty thing
    if (!isDefined(ref[useLocation])) {
      return emptyReturn;
    }

    // here we know we have the data
    if (a === location.length - 1) {
      return ref[useLocation];
    }

    // we set a reference for the next loop, if it exists
    ref = ref[useLocation];
  }

  return emptyReturn;
};

const targetReferenceDataMulti = (state, inputLocation) => {
  const res = {};

  for (const item of inputLocation) {
    res[item.name] = targetReferenceData(state, item.location);
  }

  return res;
};

/*
      _referenceData: getDataMulti(state, [
        { name: 'leagues', location: ['static', 'legacy', 'leagues'] },
        { name: 'discoveryMethods', location: ['static', 'onboarding', 'discovery-methods'] },
      ]),
*/
export const makeGetDataMulti = () => createDeepEqualitySelector(
  [
    targetReferenceDataMulti,
  ],
  data => data,
);

// export const makeGetData = () => createDeepEqualitySelector(
//   [
//     targetReferenceData,
//   ],
//   data => data,
// );

// @TODO this could get very large over the period of life of an app, need to clean up
const locationStore = {};

// the way this function works is - it creates a unique
// selector for a given location,
// or just a unique selector if no
// location is specified.
export const makeGetData = (location = null) => {
  if (isDefined(location)) {
    if (location in locationStore) {
      return locationStore[location];
    }
    locationStore[location] = createDeepEqualitySelector(
      [
        targetReferenceData,
      ],
      data => data,
    );


    return locationStore[location];
  }
  return createDeepEqualitySelector(
    [
      targetReferenceData,
    ],
    data => data,
  );
};

export const getData = createDeepEqualitySelector(
  [
    targetReferenceData,
  ],
  data => data,
);
