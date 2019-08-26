
export const STATES = {
  NOT_STARTED: 'not-started', // not started - not multi requests will not have a state if they have not been started so this is not applied to multi
  LOADING: 'loading', // we are loading something (for the first time)
  RELOADING: 'reloading', // we are 're' loading something
  ERROR: 'error', // there was an error
  SUCCESS: 'success', // there was success
  TIMED_OUT: 'timed-out', // we have timed out the data
};
