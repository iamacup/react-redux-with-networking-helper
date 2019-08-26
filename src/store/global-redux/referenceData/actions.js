
export function setData(location, data, keys = null) {
  return {
    type: 'GLOBAL_REFERENCE_DATA_SET_DATA',
    location,
    data,
    keys,
  };
}

export function mergeData(location, data, keys = null) {
  return {
    type: 'GLOBAL_REFERENCE_DATA_MERGE_DATA',
    location,
    data,
    keys,
  };
}

export function concatFirstData(location, data, keys = null) {
  return {
    type: 'GLOBAL_REFERENCE_DATA_CONCAT_FIRST_DATA',
    location,
    data,
    keys,
  };
}

export function concatLastData(location, data, keys = null) {
  return {
    type: 'GLOBAL_REFERENCE_DATA_CONCAT_LAST_DATA',
    location,
    data,
    keys,
  };
}

export function unsetData(location) {
  return {
    type: 'GLOBAL_REFERENCE_DATA_UNSET_DATA',
    location,
  };
}

export function clearAllData() {
  return {
    type: 'GLOBAL_REFERENCE_DATA_CLEAR_ALL_DATA',
  };
}
