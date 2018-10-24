import { SET_FAVORITE } from './actions';

const setFavorite = function (state, action) {
  const newState = {}
  Object.assign(newState, state, {favorite: action.favorite})
  return newState
}

const rootReducer = function (state, action) {
  // init state
  if (!state) {
    state = {
      favorite: False
    }
  }

  switch (action.type) {
    case SET_FAVORITE:
      return setFavorite(state, action)
    default:
      return state
  }
}

export default rootReducer
