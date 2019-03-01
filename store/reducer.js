import { combineReducers } from 'redux'

import list from './list';
import session from './session';

export default combineReducers({
  session,
  list
})
