import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { updatePrice } from '../../actions/cartActions';

class TotalAmount extends Component {

  render() {

    const { totalPrice } = this.props.cart;

    return (
      <View>
        <Text>Delivery</Text>
        <Text>Free</Text>
        <Text> Total: $ {totalPrice} </Text>
        <View>
          <TouchableOpacity >
            <Text> Go to checkout </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  cart: state.cart
});

export default connect(
  mapStateToProps,
  { updatePrice }
)(TotalAmount);
