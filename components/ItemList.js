// ItemList.js
// ===========

import React, { Component } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
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
      <View style={styles.container}>
        {
          this.state.products.map((item, index) => {
            console.log(item);

            return (
              <View styles={styles.productlist} key="index">
                <FlatList
                  data={item}
                  initialNumToRender="10"
                  keyExtractor={(item,index) => index.toString()}
                  renderItem={ ({item}) => <Text style={styles.itemtext}>{item.name} <Text style={styles.itemprice}>{item.price}</Text></Text> }
                />
              </View>
            )}
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingTop: '10%',
  },
  productlist: {
    fontWeight: 'normal',
  },
  itemtext: {
    fontWeight: 'normal',
  },
  itemprice: {
    fontWeight: 'bold',
  }
})

