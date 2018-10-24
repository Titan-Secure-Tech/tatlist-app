// ==================
// ListItemsScreen.js
// ==================

import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import productList from '../assets/productList.json';

const products = productList;

export default class ListItemsScreen extends Component {

  renderRow ({ item }) {
    return (
      <ListItem
        style={styles.titleText}
        title={item.item}
        rightIcon={{ name: 'heart', type: 'font-awesome', style: { marginRight: 10, fontSize: 20 } }}
        subtitle = {
          <View style={styles.subtitleView}>
            <Text style={styles.priceText}>{'$' + item.price}</Text>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        }
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <List key={products.id}>
          <FlatList
            data={products}
            renderItem={this.renderRow}
            keyExtractor={item => item.id.toString()}
          />
        </List>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: 0,
    paddingTop: 15
  },
  subtitleView: {
    flexDirection: 'row',
    paddingTop: 3
  },
  titleText: {
    paddingLeft: 10,
    color: 'darkgrey',
    fontWeight: 'bold'
  },
  priceText: {
    paddingLeft: 10,
    color: 'darkgrey',
    fontWeight: 'bold'
  },
  categoryText: {
    paddingLeft: 10,
    color: 'grey',
    fontWeight: '100'
  },
})

