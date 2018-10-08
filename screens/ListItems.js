// ListItems.js
// ===========

import React, { Component } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { db } from '../db';
import ItemList from '../components/ItemList';

let productsRef = db.ref('/products/');

export default class ListItem extends Component {



  render() {
    return (
      <View style={styles.container}>
        <ItemList/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0,
  },
})

