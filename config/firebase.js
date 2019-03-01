// db.js

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

export const database = firebase.database();
export const databaseRef = firebase.database().ref();
export const productsRef = databaseRef.child('Products');
export const firestore = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage().ref();

