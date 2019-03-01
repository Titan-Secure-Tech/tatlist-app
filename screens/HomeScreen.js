// =============
// HomeScreen.js
// =============

import React, { Component } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import Product from '../components/Product';
import * as firebase from 'firebase';

export default class HomeScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      data: [],
      error: null,
    }
    this.arrayholder = [];
  }

  componentDidMount() {
    this.makeFirebaseRequest();
  }

  makeFirebaseRequest = () => {
    this.setState({ loading: true });
    firebase
      .database()
      .ref('/Products')
      .once('value', (snapshot) => {
        let data = snapshot.val();
        let products = Object.values(data);
        this.setState({
          data: products,
          loading: false
        });
        this.arrayholder = products;
      });
  }


  searchFilterFunction = (text) => {
    const newData = this.arrayholder.filter(item => {
      const itemData = ` ${ item.name.toUpperCase()}
                         ${ item.category.toUpperCase()}
                         ${ item.brand.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({ data: newData });
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Type Here..."
        dark
        round
        onChangeText={text => this.searchFilterFunction(text)}
        autoCorrect={false}
      />
    );
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '86%',
          backgroundColor: '#CED0CE',
          marginLeft: '14%',
        }}
      />
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF' }}>
        <FlatList
          data={this.state.data}
          renderItem={({ item }) => (
            <ListItem
              onPress={() => this.props.navigation.navigate(
                'ProductDetailScreen',
                  {
                itemId: item.id,
                itemBrand: item.brand,
                itemCategory: item.category,
                itemName: item.name,
                itemVendor: item.vendor,
                itemPrice: item.price,
                itemVendorSKU: item.vendor_sku,
                  }
              )}
              title={`${item.name}`}
              subtitle={`${item.category}  `+ `$` +`${item.price} `}
            />
          )}
          keyExtractor={item => item.id.toString()}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
        />
      </View>
    );
  }
}
