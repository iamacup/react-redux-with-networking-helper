
import Wrapper from './wrapper';
import { STATES } from './networking/states';

import * as DSelectors from './store/global-redux/referenceData/selectors';
import * as NSelectors from './store/global-redux/networking/selectors';

import * as NActions from './store/global-redux/networking/actions';
import * as DActions from './store/global-redux/referenceData/actions';

export const ReduxWrapper = Wrapper;
export const NetworkStates = STATES;

export const NetworkActions = NActions;
export const DataActions = DActions;

export const NetworkSelectors = NSelectors;
export const DataSelectors = DSelectors;


// import * as globalReferenceDataActions from '../../../REDUX/store/global-redux/referenceData/actions';
// import * as globalNetworkingActions from '../../../REDUX/store/global-redux/networking/actions';

// import { makeGetReferenceData } from '../../../REDUX/store/global-redux/referenceData/selectors';
// import { makeGetNetworkData } from '../../../REDUX/store/global-redux/networking/selectors';
