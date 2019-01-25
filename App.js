// App.js

import React from 'react';
import * as firebase from 'firebase';
import AppContainer from './config/router';

let config = {
  apiKey: "AIzaSyAeMzWD4gFAK6qramL0cnQ_1RZMo7USe-w",
  authDomain: "tatlist-d67bd.firebaseapp.com",
  databaseURL: "https://tatlist-d67bd.firebaseio.com",
  projectId: "tatlist-d67bd",
  storageBucket: "tatlist-d67bd.appspot.com",
  messagingSenderId: "822328585596"
};

let app = firebase.initializeApp(config);

// firebase.firestore().settings({timestampsInSnapshots: true});

export default class App extends React.Component {

  render() {
    return (
      <AppContainer />
    );
  }
}

