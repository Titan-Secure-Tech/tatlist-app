import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from "../screens/HomeScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import ProfileScreen from "../screens/ProfileScreen";


const HomeStack = createStackNavigator({
  HomeScreen: HomeScreen,
  ProductDetailScreen: ProductDetailScreen,
});
const CheckoutStack = createStackNavigator({
  Checkout: CheckoutScreen,
});
const ProfileStack = createStackNavigator({
  Profile: ProfileScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-pricetags' : 'md-pricetags'}
    />
  ),
};

CheckoutStack.navigationOptions = {
  tabBarLabel: 'Checkout',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-card' : 'md-card'}
    />
  ),
};

ProfileStack.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-person' : 'md-person'}
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  CheckoutStack,
  ProfileStack
});
