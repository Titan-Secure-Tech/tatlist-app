// =============
// CheckoutScreen.js
// =============

import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { List, ListItem, SearchBar, Button } from 'react-native-elements';
import Cart from '../components/Cart/Cart';
import Product from '../components/Product';
import * as firebase from 'firebase';

export default class CheckoutScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      items: [],
      currentUser: null,
      error: null,
    }
  }

  componentDidMount() {
    this.getProductsInCart();
  }

  getProductsInCart = () => {
    this.setState({loading: true});
    firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .collection('Cart')
      .get()
      .then((querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price
          });
        });
        this.setState({items, loading: false});
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }


  render() {
    const {items, currentUser } = this.state;
    console.log(this.state.items);


    if (this.state.loading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <List style={{ flex: 1, backgroundColor: '#FFF' }}>
        {
          this.state.items.map((item) => (
            <ListItem
              key={item.id}
              title={item.name}
              subtitle={item.price}
            />
          ))
        }
        <Button
          title="Proceed to Checkout"
          onPress={() => console.log('proceed to checkout pressed')}
        />
        <Button
          title="Go to HomeScreen"
          onPress={() => this.props.navigation.navigate('HomeScreen')}
        />
        <Button
          title="Go back"
          onPress={() => this.props.navigation.goBack()}
        />
      </List>
    );
  }
}
