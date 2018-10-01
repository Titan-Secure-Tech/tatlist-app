// App.js

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import Home from './src/screens/Home';
import AddItem from './src/screens/AddItem';
import ListItem from './src/screens/ListItem';

const AppNavigator = createStackNavigator(
  {
    HomeScreen: { screen: Home },
    AddItemScreen: { screen: AddItem },
    ListItemScreen: { screen: ListItem }
  },
  {
    initialRouteName: 'HomeScreen',
  }
);

export default class App extends Component {
  render() {
    return (
      <AppNavigator />
    );
  }
}
