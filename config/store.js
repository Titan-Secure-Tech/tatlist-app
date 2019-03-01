import {
  createStore,
  combineReducers,
  compose,
  applyMiddleware
} from 'redux';

import {
  reactReduxFirebase,
  firebaseReducer,
  getFirebase
} from 'react-redux-firebase';

import {
  reduxFirestore,
  firestoreReducer
} from 'redux-firestore';

import cartReducer from '../reducers/cartReducer';
import sortingReducer from '../reducers/sortingReducer';
import  { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';


import * as firebase from 'firebase';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

const config = {
  apiKey: "AIzaSyAeMzWD4gFAK6qramL0cnQ_1RZMo7USe-w",
  authDomain: "tatlist-d67bd.firebaseapp.com",
  databaseURL: "https://tatlist-d67bd.firebaseio.com",
  projectId: "tatlist-d67bd",
  storageBucket: "tatlist-d67bd.appspot.com",
  messagingSenderId: "822328585596"
};

if(!firebase.apps.length){
  firebase.initializeApp(config);
}

// react-redux-firebase config
const rrfConfig = {
  userProfile: 'Users',
  useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
}

export const database = firebase.database();
export const databaseRef = firebase.database().ref();
export const productsRef = databaseRef.child('Products');
export const firestore = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage().ref();

const createStoreWithFirebase = compose(
  reactReduxFirebase(firebase, rrfConfig),
  reduxFirestore(firebase)
)(createStore);

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  cart: cartReducer,
  sorting: sortingReducer
});

const initialState = {};

const store = createStoreWithFirebase(
  rootReducer,
  initialState,
  composeWithDevTools(
    applyMiddleware(thunk.withExtraArgument(getFirebase)),
    reactReduxFirebase(firebase)
  )
);

export default store;
