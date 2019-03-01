import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  deleteItem,
  addItem,
  decrement
} from '../../actions/cartActions';

class CartItem extends Component {
  onClick = id => {
    const { deleteItem } = this.props;
    deleteItem(id);
  };

  increment = () => {
    const { addItem } = this.props;
    addItem(this.props.item);
  };

  decrement = id => {
    const { item } = this.props;
    if (item.qty > 1) {
      const { decrement } = this.props;
      decrement(this.props.item);
    } else {
      const { deleteItem } = this.props;
      deleteItem(id);
    }
  };

  render() {

    const { item } = this.props;

    return (
      <View>
        <Text>{item.name}</Text>
        <View>
          <Text> Quantity:{' '} </Text>
          <TouchableOpacity onPress={this.decrement.bind(this, item.id)} >
            <Text>-</Text>
          </TouchableOpacity>
          <Text> {item.qty} </Text>
          <TouchableOpacity onPress={this.increment.bind(this)}>
            <Text>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.increment.bind(this)}>
            <Text>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onClick.bind(this, item.id)} >
            <Text> &#xd7; </Text>
          </TouchableOpacity>
        </View>
        <Text>$ {(item.price * item.qty).toFixed(2)}</Text>
      </View>
    );
  }
}

export default connect(
  null,
  {
    deleteItem,
    addItem,
    decrement
  }
)(CartItem);
