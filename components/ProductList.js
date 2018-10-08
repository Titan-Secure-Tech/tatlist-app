// ProductList.js
// ===========

import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native-elements';
import { db } from '../db';

let productsRef = db.ref('/products/');

export default class ProductList extends Component {

  state = {
    products: []
  }

  componentWillMount() {
    productsRef.on('value', (snapshot) => {
      let data = snapshot.val();
      let products = Object.values(data);
      this.setState({products});
    });
  }

  render() {
    return (
      <View>
        {
          this.state.products.map((item, index) => {
            return (
              <View key="index">
                <List>
                  <FlatList
                    data={item}
                    keyExtractor={(item,index) => index.toString()}
                    renderItem={({item}) => <Text>{item.name} <Text>{item.price}</Text></Text>}
                  />
                </List>
              </View>
            )}
          )
        }
      </View>
    )
  }
}

