// ItemList.js
// ===========

import React, { Component } from 'react';
import { View, FlatList} from 'react-native';
import {List, Icon, ListItem, SearchBar} from 'react-native-elements';
import { db } from '../db';

let productsRef = db.ref('/products/');

export default class ItemList extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      data: [],
      products: [],
      error: null,
    }
    this.arrayholder = [];
  }

  componentWillMount() {
    productsRef.on('value', (snapshot) => {
      let data = snapshot.val();
      let products = Object.values(data);
      this.setState({products});
    });
  }

  searchFilterFunction = text => {
    const newData = this.arrayholder.filter(item => {
      const itemData = `${item.name.title.toUpperCase()}
                ${item.name.first.toUpperCase()} ${item.name.last.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({ data: newData });
  };

  render() {
    return (
      <List>
        {
          this.state.products.map((item, index) => {
            return (
              <View key="index">
                <SearchBar
                  placeholder="Search for an item..."
                  onChangeText={text => this.searchFilterFunction(text)}
                  autoCorrect={false}
                  icon={{ type: 'font-awesome', name: 'search' }}
                />
                <FlatList
                  data={item}
                  keyExtractor= {
                    (item,index) => index.toString()
                  }
                  renderItem= {
                    ({item}) =>
                      <ListItem
                        title={item.name}
                        onPress={ () => { console.log('pressed anywhere on product list item in ItemList.js'); } }
                        onLongPress={ () => { console.log('long pressed anywhere on product list item in ItemList.js'); } }
                        key={index}
                        subtitle={'$' + item.price}
                      />
                  }
                />
              </View>
            )}
          )
        }
      </List>
    )
  }
}

