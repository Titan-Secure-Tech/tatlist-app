import React from 'react';
import { Text, Button, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Product from './Product';

const Cart  = ({ products, total, onCheckoutClicked }) => {
  const hasProducts = products.length > 0
  const nodes = hasProducts ? (
    products.map(product =>
      <Product
        title={product.title}
        price={product.price}
        quantity={product.quantity}
        key={product.id}
      />
    )
  ) : (
    <Text>Please add some products to cart.</Text>
  )

  return (
    <View style={styles.container}>
      <Text>Your Cart</Text>
      {nodes}
      <Text>Total: &#36;{total}</Text>
      <Button
        title="Checkout"
        disabled={hasProducts}
        onPress={onCheckoutClicked}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})

Cart.propTypes = {
  products: PropTypes.array,
  total: PropTypes.string,
  onCheckoutClicked: PropTypes.func
}

export default Cart
