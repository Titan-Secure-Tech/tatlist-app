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
  }
)

// create our app's navigation stack
const AppNavigator = createSwitchNavigator(
  {
    Auth: AuthNavigator,
    Main: MainTabNavigator
  }
)

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
