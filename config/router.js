import React from "react";
import { Platform, StatusBar } from "react-native";
import { Icon } from "react-native-elements";
import { createBottomTabNavigator } from "react-navigation";
import HomeScreen from "../screens/HomeScreen";
import ListItemsScreen from "../screens/ListItemsScreen";

export const Tabs = createBottomTabNavigator({
  HomeScreen: {
    screen: HomeScreen,
    navigationOptions: {
      tabBarLabel: 'Home',
      tabBarIcon: ({ tintColor }) => <Icon name="home" size={35} color={tintColor} />
    },
  },
  ListItemsScreen: {
    screen: ListItemsScreen,
    navigationOptions: {
      tabBarLabel: 'Product List',
      tabBarIcon: ({ tintColor }) => <Icon name="list" size={35} color={tintColor} />
    },
  },
});
