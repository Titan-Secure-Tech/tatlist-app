import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default const listItem = (props) => (
  <ListItem
    style={styles.listItem}
    title={props.name}
    rightIcon={
      <Icon
        name={favorite ? 'heart' : 'heart-o'}
        color={favorite ? '#F44336' : 'rgb(50, 50, 50)'}
        onPress={props.onItemPressed}
        type='font-awesome'
      />
    }
    subtitle = {
      <View style={styles.subtitleView}>
        <Text style={styles.priceText}>{'$' + props.price}</Text>
        <Text style={styles.categoryText}>{props.category}</Text>
      </View>
    }
  />

);
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
  listItem: {
    width: '100%',
    padding: 10,
    backgroundColor: "#eee",
    marginBottom: 5
  },
});

