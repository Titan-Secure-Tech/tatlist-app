// ==================
// ProductsScreen.js
// ==================

import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default class ProductsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      arrayholder: []
    };

  }

  render() {
    return (
      <View style={styles.container}>
        <Text> ProductsScreen.js </Text>
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


