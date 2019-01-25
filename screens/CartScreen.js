// ==================
// CartScreen.js
// ==================

import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default class CartScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text> CartScreen.js </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: 25,
    paddingTop: 25
  },
})



