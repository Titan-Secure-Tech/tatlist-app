// ==================
// ListItemsScreen.js
// ==================

import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableHighlight } from 'react-native';
import { Icon, List, ListItem } from 'react-native-elements';
import productList from '../assets/productList.json';

const products = productList;

export default class ListItemsScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      color: 'grey'
    }
  }

  onPress = () => {
    console.log('sonmethign pressed');
  }

  onLongPress = () => {
    console.log('sonmethign pressed longly');
  }

  renderRow ({ item }) {
    return (
      <ListItem
        style={styles.titleText}
        onPress={this.onPress}
        onLongPress={this.onLongPress}
        title={item.item}
        rightIcon={<Icon
          name='heart'
          color='grey'
          type='font-awesome'
        />}
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
      <TouchableHighlight onPress={this.onPress}>
        <List key={products.id}>
          <FlatList
            data={products}
            renderItem={this.renderRow}
            keyExtractor={item => item.id.toString()}
          />
        </List>
      </TouchableHighlight>
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

