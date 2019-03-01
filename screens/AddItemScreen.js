// ================
// AddItemScreen.js
// ================

import React, { Component } from 'react';

import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableHighlight
} from 'react-native';

import * as firebase from 'firebase';

export default class AddItemScreen extends Component {

  state = {
    textInput: '',
    error: false
  }

  handleAddItem = () => {
    // TODO: Firebase stuff...
    firebase.firestore().settings({timestampsInSnapshots: true});
    firebase
      .firestore()
      .collection('users')
      .set({
        favorites: this.state.textInput
      })
      .then(() => console.log(user, "document added successfully!"))
      .catch(error => this.setState({ errorMessage: error.message}))
  }

  render() {
    return (
      <View style={styles.main}>
        <Text>AddItemScreen.js</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  title: {
    marginBottom: 20,
    fontSize: 25,
    textAlign: 'center'
  },
  itemInput: {
    height: 50,
    padding: 4,
    marginRight: 5,
    fontSize: 23,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    color: 'white'
  },
  buttonText: {
    fontSize: 18,
    color: '#111',
    alignSelf: 'center'
  },
  button: {
    height: 45,
    flexDirection: 'row',
    backgroundColor:'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  }
});
