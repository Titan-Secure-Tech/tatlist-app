import React, { Component } from 'react';
// import { Scrollbars } from 'react-custom-scrollbars';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { List } from 'react-native-elements';
import { connect } from 'react-redux';
import {
  showCart,
  addItem
} from '../../actions/cartActions';
import CartItem from './CartItem';
import TotalAmount from './TotalAmount';
import uuid from 'uuid';

class Cart extends Component {

  showCart = () => {
    const { showCart } = this.props;
    showCart();
  };

  render() {
    const { isOpen, cartItems } = this.props.cart;
    return (
      <View className={`cart ${!isOpen ? 'transparent' : ''}`}>
        <View className={`cart-inside ${isOpen ? 'active' : ''}`}>
          <Text>Shopping cart</Text>
          <TouchableOpacity onPress={this.showCart}>
            <Text> &#xd7; </Text>
          </TouchableOpacity>
          <View>
            {cartItems.length === 0 ? (
              <Text> Nothing was added yet</Text>
            ) : (
              <View>
                {
                  cartItems.map(item => (
                    <List key={uuid()}>
                      <CartItem item={item} />
                    </List>
                  ))
                }
              </View>
            )}
          </View>
          <TotalAmount />
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
  {
    showCart,
    addItem
  }
)(Cart);
