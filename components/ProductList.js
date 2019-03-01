import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import Product from './components/Product';

const ProductList = props => {
  return (
    <FlatList
      style={styles.listContainer}
      data={props.products}
      renderItem={ ({ item }) => (
        <Product
          name={item.name}
          price={item.price}
          category={item.category}
          favorite={item.favorite}
        />
      )}
    />
  )
};

const styles = StyleSheet.create({
  listContainer: {
    width: '100%'
  }
});

export default ProductList;
