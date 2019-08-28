
// we have to ignore this rule because of the immer library - we reassign on draft
/* eslint no-param-reassign: 0 */

import produce from 'immer';
import createReducer from '../../../lib/createReducer';
import { isDefined } from '../../../lib/isDefined';

const initialState = {

};

const getDraftRef = (action, draft) => {
  // sort out string input
  const location = action.location.split('.');

  // use this to keep a track of current nesting object
  let ref = draft;

  for (let a = 0; a < location.length; a++) {
    let useLocation = location[a];

    // work out if we are looking at an array value and convert it to an real number
    if (useLocation.substring(0, 1) === '[' && useLocation.substring(useLocation.length - 1, useLocation.length) === ']') {
      useLocation = Number.parseInt(useLocation.substring(1, useLocation.length - 1), 10);
    }

    // we set a currently non used location to an empty object
    if (!isDefined(ref[useLocation])) {
      ref[useLocation] = {};
    }

    // here we know we need to shove the data in
    if (a === location.length - 1) {
      return { ref, location: useLocation };
    }

    // we set a reference for the next loop, if it exists
    ref = ref[useLocation];
  }

  // we should never actually return this... we don't check for null returns to save time
  return null;
};

export const globalReferenceDataReducer = createReducer(initialState, {
  GLOBAL_REFERENCE_DATA_SET_DATA: (state, action) => produce(state, (draft) => {
    const { ref, location } = getDraftRef(action, draft);

    if (action.keys !== null) {
      for (let b = 0; b < action.data.length; b++) {
        ref[location][action.keys[b]] = action.data[b];
      }
    } else {
      ref[location] = action.data;
    }
  }),
  GLOBAL_REFERENCE_DATA_MERGE_DATA: (state, action) => produce(state, (draft) => {
    const { ref, location } = getDraftRef(action, draft);

    if (action.keys !== null) {
      for (let b = 0; b < action.data.length; b++) {
        ref[location][action.keys[b]] = Object.assign({}, ref[location][action.keys[b]], action.data[b]);
      }
    } else {
      ref[location] = Object.assign({}, ref[location], action.data);
    }
  }),
  GLOBAL_REFERENCE_DATA_CONCAT_FIRST_DATA: (state, action) => produce(state, (draft) => {
    const { ref, location } = getDraftRef(action, draft);

    let useData = action.data;

    if (!Array.isArray(action.data)) {
      useData = [action.data];
    }

    ref[location] = useData.concat(ref[location]);
  }),
  GLOBAL_REFERENCE_DATA_CONCAT_LAST_DATA: (state, action) => produce(state, (draft) => {
    const { ref, location } = getDraftRef(action, draft);

    if (!Array.isArray(ref[location])) {
      ref[location] = [];
    }

    ref[location] = ref[location].concat(action.data);
  }),
  GLOBAL_REFERENCE_DATA_UNSET_DATA: (state, action) => produce(state, (draft) => {
    const { ref, location } = getDraftRef(action, draft);

    delete ref[location];
  }),
  GLOBAL_REFERENCE_DATA_UNSET_KEYS_AT_LOCATION: (state, action) => produce(state, (draft) => {
    const { ref, location } = getDraftRef(action, draft);

    for (const key of action.keys) {
      delete ref[location][key];
    }
  }),
  GLOBAL_REFERENCE_DATA_CLEAR_ALL_DATA: (state, action) => initialState,
});
