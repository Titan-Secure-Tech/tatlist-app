// Home.js

import React, { Component } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';

export default class AddButton extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Add Item"
          onPress={() => this.props.navigation.navigate('AddItem')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header_text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
})


