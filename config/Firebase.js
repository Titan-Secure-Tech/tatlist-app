/////////////////////////
// Firebase.js
// firebase config helper
/////////////////////////
import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

const config = {
  apiKey: "AIzaSyAeMzWD4gFAK6qramL0cnQ_1RZMo7USe-w",
  authDomain: "tatlist-d67bd.firebaseapp.com",
  databaseURL: "https://tatlist-d67bd.firebaseio.com",
  projectId: "tatlist-d67bd",
  storageBucket: "tatlist-d67bd.appspot.com",
  messagingSenderId: "822328585596"
};

firebase.initializeApp(config);

firebase.firestore().settings(settings);

export default firebase;
