// ==================
// ListItemsScreen.js
// ==================

import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableHighlight } from 'react-native';
import { SearchBar, Icon, List } from 'react-native-elements';
import productList from '../assets/productList.json';
import Product from '../components/Product';
import searchText from '../utils/searchText';

const products = productList;

export default class ListItemsScreen extends Component {

  render() {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder='Search for a product...'
          round
          clearIcon
          onChangeText={data => this.handleDataChange(data)}
          onCancel={data => this.handleSearchCancel(data)}
          onClearText={data => this.handleSearchClear(data)}
          autoCorrect={false}
          ref={data => this.data = data}
        />
        <List>
          <FlatList
            data={products}
            renderItem={ ({ item }) => (
              <Product
                name={item.name}
                price={item.price}
                category={item.category}
                favorite={item.favorite}
              />
            )
            }
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
    marginTop: 25,
    paddingTop: 25
  },
})

