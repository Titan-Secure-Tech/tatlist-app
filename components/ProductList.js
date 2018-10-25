// ProductList.js
// ===========

import React, { Component } from 'react';
import { View, List, FlatList, ListItem, Text } from 'react-native-elements';
import productData from '../assets/productList.json';


const products = productData;


export default class ProductList extends Component {


  renderRow = ({item}) => {
    return (
      <ListItem
        style={styles.titleText}
        onPress={this.onPress}
        title={item.item}
        rightIcon={
          <Icon
            name='plus'
            color='grey'
            type='font-awesome'
          />
        }
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
      <List>
        <FlatList
          data={products}
          renderItem={this.renderRow}
          keyExtractor={item => item.id.toString()}
        />
      </List>
    )
  }
}

