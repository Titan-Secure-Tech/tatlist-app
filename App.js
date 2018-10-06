// App.js

import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import HomeScreen from './screens/Home';
import AddItemScreen from './screens/AddItem';
import ListItemsScreen from './screens/ListItems';

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    AddItem: AddItemScreen,
    ListItems: ListItemsScreen,
  },
  {
    initialRouteName: 'Home',
  }
);

export default class App extends Component {
  render() {
    return <RootStack />;
  }
}
