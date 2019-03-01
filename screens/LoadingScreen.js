// Loading.js

import React from 'react';
import { View, Text, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import * as firebase from 'firebase';

export default class LoadingScreen extends React.Component {

  componentDidMount() {
    firebase
      .auth()
      .onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'HomeScreen' : 'LoginScreen')
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <ActivityIndicator size="large" />
        <StatusBar barStyle="default" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})



