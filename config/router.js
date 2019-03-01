<<<<<<< HEAD
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
=======
import React from 'react';
import { StyleSheet, Platform, Image, Text, View } from 'react-native';
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
//
// import the different screens
import Loading from '../screens/Loading';
import Registration from '../screens/Registration';
import SignUp from '../screens/SignUp';
import Login from '../screens/Login';
// import LoadingScreen from '../screens/LoadingScreen';
// import SignUpScreen from '../screens/SignUpScreen';
// import LoginScreen from '../screens/LoginScreen';


import MainTabNavigator from './MainTabNavigator';

// create our app's authentication stack
const AuthNavigator = createSwitchNavigator(
  {
    Loading: Loading,
    Registration: Registration,
    SignUp: SignUp,
    Login: Login
  },
  {
    initialRouteName: 'Loading'
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
  }
)

// create our app's navigation stack
const AppNavigator = createSwitchNavigator(
  {
<<<<<<< HEAD
    authNavigator,
    mainTabNavigator
=======
    Auth: AuthNavigator,
    Main: MainTabNavigator
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
  }
)

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
<<<<<<< HEAD

=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
