// ==========
// Product.js
// ==========

import React, { Component } from 'react';
import { Text, View, StyleSheet, LayoutAnimation } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';

export default class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      price: '',
      category: '',
      favorite: false
    };
  }

  componentWillMount() {
    const { name, price, category, favorite } = this.props;
    this.setState({ name, price, category, favorite });
  }

  render() {

    const { name, price, category, favorite } = this.state;

    return (
      <ListItem
        style={styles.titleText}
        title={name}
        rightIcon={
          <Icon
            name={favorite ? 'heart' : 'heart-o'}
            color={favorite ? '#F44336' : 'rgb(50, 50, 50)'}
            onPress={() => this.setState({ favorite: !favorite })}
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
  },
  priceText: {
    paddingLeft: 10,
  },
  categoryText: {
    paddingLeft: 10,
  },
})
