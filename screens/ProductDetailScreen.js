// =============
// ProductDetailScreen.js
// =============

import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, LayoutAnimation } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import Product from '../components/Product';
import * as firebase from 'firebase';

export default class ProductDetailsScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentUser: null,
      name: '',
      price: '',
      category: '',
      isFavorite: false
    };
  }

  addToCart = () => {
    const itemName = this.props.navigation.getParam('itemName');
    const itemPrice = this.props.navigation.getParam('itemPrice');
    const itemId = this.props.navigation.getParam('itemId');
    const {currentUser}= firebase.auth();
    this.setState({currentUser});
    firebase
      .firestore()
      .collection('Users')
      .doc(currentUser.uid)
      .collection('Cart')
      .add({
        id: itemId,
        name: itemName,
        price: itemPrice.toFixed(2),
        added_on: new Date(),
      })
      .then(() => {
        console.log("item added successfully: ", itemName);
      });
  }

  toggleFavorite = () => {
    const { isFavorite } = this.state;
    this.setState({
      isFavorite: !this.state.isFavorite
    });
    console.log("item added to Favorites: ", this.props.name);
  }

  componentWillMount() {
    const { name, price, category, isFavorite } = this.props;
    this.setState({ name, price, category, isFavorite });
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  componentDidMount() {
    const {currentUser } = firebase.auth();
    this.setState({currentUser});
    // console.log("current User ID: ", currentUser.uid);
  }


  render() {

    const { navigation } = this.props;
    const { currentUser, name, price, category, isFavorite } = this.state;

    const itemId = navigation.getParam('itemId', 'No Item ID Found!');
    const itemBrand = navigation.getParam('itemBrand', 'Item Brand Not Found!');
    const itemCategory = navigation.getParam('itemCategory', 'Item Category Not Found!');
    const itemName = navigation.getParam('itemName', 'Item Name Not Found!');
    const itemVendor = navigation.getParam('itemVendor', 'Item Vendor Not Found!');
    const itemPrice = navigation.getParam('itemPrice', 'Item Price Not Found!');
    const itemVendorSKU = navigation.getParam('itemVendorSKU', 'Item SKU Not Found!');


    return (
      <View style={{ flex: 1, alignItems: 'left', justifyContent: 'center' }}>
        <Text>Item Details</Text>
        <Text>itemId: {JSON.stringify(itemId)}</Text>
        <Text>itemBrand: {JSON.stringify(itemBrand)}</Text>
        <Text>itemCategory: {JSON.stringify(itemCategory)}</Text>
        <Text>itemName: {JSON.stringify(itemName)}</Text>
        <Text>itemVendor: {JSON.stringify(itemVendor)}</Text>
        <Text>itemPrice: {JSON.stringify(itemPrice)}</Text>
        <Text>itemVendorSKU: {JSON.stringify(itemVendorSKU)}</Text>
        <Button
          title="Add To Cart"
          onPress={this.addToCart}
        />
        <Button
          title="Add To Favorites"
          onPress={() => console.log('add to favs pressed')}
        />
        <Button
          title="Go to Home"
          onPress={() => this.props.navigation.navigate('HomeScreen')}
        />
        <Button
          title="Go back"
          onPress={() => this.props.navigation.goBack()}
        />
      </View>
    );
  }
}
