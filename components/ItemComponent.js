// ItemComponent.js

import React, { Component } from 'react';
import {  View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';

export default class ItemComponent extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired
  };

  render() {
    return (
      <View style={styles.itemsList}>
        {
          this.props.items.forEach((item, index) => {
            console.log(item, "item component triggered" );
            return (
              <View key={index}>
                <Text style={styles.itemtext}>{item.name}</Text>
              <View>
                <Text style={styles.itemtext}>{item.price}</Text>
              </View>
              </View>
            )}
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemsList: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  itemtext: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  }
});

