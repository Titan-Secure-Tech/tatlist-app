import * as types from './actionTypes';

const initalState = {
  sending: false,
  sendingError: null,
  item: '',
  items: [],
  loadItemsError: null
}

const list = (state = initialState, action) => {
  switch(action.type) {
    case types.LIST_ITEMS_LOADING:
      return { ...state, sending: true, sendingError: null }
    case types.LIST_ITEMS_SUCCESS:
      return { ...state, sending: false, sendingError: null, item: '' }
    case types.LIST_ITEMS_ERROR:
      return { ...state, sending: false, sendingError: action.error }
    case types.LIST_ITEMS_UPDATE:
      return { ...state, sending: false, item: action.text, sendingError: null }
    case types.LIST_LOAD_ITEMS_SUCCESS:
      return { ...state, items: action.items, loadItemsError: null }
    case types.LIST_LOAD_ITEMS_ERROR:
      return { ...state, items: null, loadItemsError: action.error }
    default:
      return state
  }
}

export default list;
