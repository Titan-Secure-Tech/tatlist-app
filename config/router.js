import React from "react";
import { Platform, StatusBar } from "react-native";
import { Icon } from "react-native-elements";
import {
  createBottomTabNavigator,
  createSwitchNavigator,
  createAppContainer
} from "react-navigation";

// import the auth screens
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';

import mainTabNavigator from './mainTabNavigator';

// create our app's authentication stack
const authNavigator = createSwitchNavigator(
  {
    LoadingScreen,
    LoginScreen,
    RegistrationScreen
  },
  {
    initialRouteName: 'LoadingScreen'
  }
)

// create our app's navigation stack
const AppNavigator = createSwitchNavigator(
  {
    authNavigator,
    mainTabNavigator
  }
)

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;

