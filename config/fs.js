// fs.js

import Firebase from 'firebase';

let config = {
  apiKey: "AIzaSyAeMzWD4gFAK6qramL0cnQ_1RZMo7USe-w",
  authDomain: "tatlist-d67bd.firebaseapp.com",
  databaseURL: "https://tatlist-d67bd.firebaseio.com",
  projectId: "tatlist-d67bd",
  storageBucket: "tatlist-d67bd.appspot.com",
  messagingSenderId: "822328585596"
};

let app = Firebase.initializeApp(config);

export const fs = app.firestore();
