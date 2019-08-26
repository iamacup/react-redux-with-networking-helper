
/* eslint-disable no-prototype-builtins */

/*
 * Will dynamically create reducers
 * enforcing a unique way to describe reducers
 */

export default function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}
