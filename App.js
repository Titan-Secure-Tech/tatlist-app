import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import AppContainer from './config/router';
import store from './config/store';

<<<<<<< HEAD

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
=======
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
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
    );
  }
}

