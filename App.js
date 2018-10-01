// App.js

import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import HomeScreen from './screens/Home';
import AddItemScreen from './screens/AddItem';
import ListItemScreen from './screens/ListItem';

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    AddItem: AddItemScreen,
    ListItem: ListItemScreen,
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
