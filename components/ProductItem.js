import React from 'react'
import PropTypes from 'prop-types'
import Product from './Product'
import { View, StyleSheet } from 'react-native';

const ProductItem = ({ product, onAddToCartClicked }) => (
  <View style={styles.container}>
    <Product
      title={product.name}
      price={product.price}
      quantity={product.inventory}
    />
    <Button
      onPress={onAddToCartClicked}
      disabled={product.inventory > 0 ? '' : 'disabled'}
      title={product.inventory > 0 ? 'Add to cart' : 'Sold Out'}
    />
  </View>
)

ProductItem.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired
  }).isRequired,
  onAddToCartClicked: PropTypes.func.isRequired
}


const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  }
})

export default ProductItem
