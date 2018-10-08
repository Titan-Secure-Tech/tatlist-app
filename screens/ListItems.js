// ListItems.js
// ===========

import React, { Component } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { db } from '../db';
import ItemList from '../components/ItemList';
import SearchBar from '../components/SearchBar';

let productsRef = db.ref('/products/');

export default class ListItem extends Component {


  componentWillMount() {
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>ListItems.js</Text>
        <SearchBar/>
        <ItemList/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
})

