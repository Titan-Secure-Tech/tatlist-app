import React, { Component } from 'react';
import { Text, View, StyleSheet, LayoutAnimation } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { showCart, updatePrice } from '../../actions/cartActions';
import PropTypes from 'prop-types';

class CartIcon extends Component {
  showCart = () => {
    const { showCart } = this.props;
    showCart();
  };

  render() {
    const { cartItems, totalPrice } = this.props.cart;
    return (
      <View className="cart-icon ml-auto">
        <TouchableOpacity type="button" onClick={this.showCart}>
          <Icon
            name="shopping-cart"
            type='font-awesome'
          />
          <Text> {cartItems.reduce((acc, curr) => acc + curr.qty, 0)} Products </Text>
        </TouchableOpacity>
        <Text>{totalTextrice} $</Text>
      </View>
    );
  }
}

CartIcon.propTypes = {
  showCart: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  cart: state.cart
});

export default connect(
  mapStateToProps,
  {
    showCart,
    updatePrice
  }
)(CartIcon);
