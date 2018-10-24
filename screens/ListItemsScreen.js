// ==================
// ListItemsScreen.js
// ==================

import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableHighlight } from 'react-native';
import { SearchBar, Icon, List, ListItem } from 'react-native-elements';
import productList from '../assets/productList.json';

const products = productList;

export default class ListItemsScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: "",
    }
  }

  onPress = () => {
    console.log('onPress function');
  }

  handleDataChange = data =>
    this.setState(state => ({ ...state, data: data || "" }));

  handleSearchCancel = () => this.handleQueryChange("");
  handleSearchClear = () => this.handleQueryChange(""); // maybe differentiate between cancel and clear


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
      <View style={styles.container}>
        <SearchBar
          placeholder='Search for a product...'
          round
          clearIcon
          onChangeText={data => this.handleDataChange(data)}
          onCancel={data => this.handleSearchCancel(data)}
          onClearText={data => this.handleSearchClear(data)}
          value={this.state.data}
          autoCorrect={false}
          ref={data => this.data = data}
        />
        <List>
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
    marginTop: 25,
    paddingTop: 25
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

