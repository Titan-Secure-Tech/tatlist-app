// AddItem.js

import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default class AddItem extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header_text}>AddItem.js</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header_text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
})

