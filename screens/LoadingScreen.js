<<<<<<< HEAD
// Loading.js

import React from 'react';
import { View, Text, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import * as firebase from 'firebase';
=======
import React from 'react';
import * as firebase from 'firebase';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269

export default class LoadingScreen extends React.Component {

  componentDidMount() {
<<<<<<< HEAD
    firebase
      .auth()
      .onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'HomeScreen' : 'LoginScreen')
=======
    firebase.auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'HomeScreen' : 'SignUpScreen')
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <ActivityIndicator size="large" />
<<<<<<< HEAD
        <StatusBar barStyle="default" />
=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
      </View>
    )
  }
}
<<<<<<< HEAD

=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
<<<<<<< HEAD



=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
