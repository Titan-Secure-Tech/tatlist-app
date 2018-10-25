import React from "react";
import { Platform, StatusBar } from "react-native";
import { Icon } from "react-native-elements";
import { createBottomTabNavigator } from "react-navigation";
import HomeScreen from "../screens/HomeScreen";
import ListItemsScreen from "../screens/ListItemsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import FavoritesScreen from "../screens/FavoritesScreen";

export const Tabs = createBottomTabNavigator({
  HomeScreen: {
    screen: HomeScreen,
    navigationOptions: {
      tabBarLabel: 'Home',
      tabBarIcon: ({ tintColor }) => <Icon name="home" size={35} color={tintColor} />
    },
  },
  FavoritesScreen: {
    screen: FavoritesScreen,
    navigationOptions: {
      tabBarLabel: 'Favorites',
      tabBarIcon: ({ tintColor }) => <Icon type="font-awesome" name="heart" size={24} color={tintColor} />
    },
  },
  ListItemsScreen: {
    screen: ListItemsScreen,
    navigationOptions: {
      tabBarLabel: 'Product List',
      tabBarIcon: ({ tintColor }) => <Icon name="list" size={35} color={tintColor} />
    },
  },
  ProfileScreen: {
    screen: ProfileScreen,
    navigationOptions: {
      tabBarLabel: 'Profile',
      tabBarIcon: ({ tintColor }) => <Icon type='font-awesome' name="user" size={25} color={tintColor} />
    },
  },
});
