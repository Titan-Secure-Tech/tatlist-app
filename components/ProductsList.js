import React from 'react'
import PropTypes from 'prop-types'
import { Text, View } from 'react-native';

const ProductsList = ({ title, children }) => (
  <View>
    <Text>{title}</Text>
    <Text>{children}</Text>
  </View>
)

ProductsList.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired
}

export default ProductsList
