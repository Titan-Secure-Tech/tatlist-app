// ==========
// Product.js
// ==========

import React, { Component } from 'react';
import { Text, View, StyleSheet, LayoutAnimation } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import * as firebase from 'firebase';

export default class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      price: '',
      category: '',
      isFavorite: false
    };
  }

  handleSubmit = () =>  {
    const itemsRef = firebase.database().ref('/Items');
    const item = {
      name: this.state.name,
      price: this.state.price
    }
    itemsRef.push(item);
    console.log("added to firebase cart: ", this.state.name);
  }

  addToCart = () => {
    const uid = firebase.auth().user.uid;
    console.log("added to cart: ", uid);
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

  render() {
    const { name, price, category, isFavorite } = this.state;
    return (

      <ListItem
        style={styles.titleText}
        onPress={() => this.handleSubmit()}
        title={name}
        rightIcon={
          <Icon
            name={isFavorite ? 'heart' : 'heart-o'}
            color={isFavorite ? '#F44336' : 'rgb(50, 50, 50)'}
            onPress={() => this.toggleFavorite()}
            type='font-awesome'
          />
        }
        subtitle = {
          <View style={styles.subtitleView}>
            <Text style={styles.priceText}>{'$' + price}</Text>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        }
      />
    );
  }
}

const styles = StyleSheet.create({
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

