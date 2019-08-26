
import * as globalNetworkReducer from './global-redux/networking/reducers';
import * as globalReferenceDataReducer from './global-redux/referenceData/reducers';

// export default Object.assign({}, globalNetworkReducer, globalReferenceDataReducer);

export default [globalNetworkReducer, globalReferenceDataReducer];
