// ItemList.js
// ===========

import React, { Component } from 'react';
import { View, FlatList} from 'react-native';
import {List,  ListItem} from 'react-native-elements';
import { db } from '../db';

let productsRef = db.ref('/products/');

export default class ItemList extends Component {

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
      <List>
        {
          this.state.products.map((item, index) => {
            return (
              <View key="index">
                <FlatList
                  data={item}
                  keyExtractor={(item,index) => index.toString()}
                  renderItem={ ({item}) => <ListItem title={item.name} subtitle={item.price} /> }
                />
              </View>
            )}
          )
        }
      </List>
    )
  }
}

