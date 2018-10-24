// =============
// HomeScreen.js
// =============

import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

export default class HomeScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header_text}>Tatlist 1.0</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header_text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#FFF',
  },
})

