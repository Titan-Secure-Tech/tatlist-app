// ================
// HomeScreen.js
// ================

import React from 'react'
import { StyleSheet, Platform, Image, Text, View } from 'react-native'
import { Button } from 'react-native-elements'

export default class MainScreen extends React.Component {

  state = {
    currentUser: null
  }

  render() {
    const { currentUser } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>
          SettingsScreen.js {currentUser && currentUser.email}
        </Text>
        <Button
          title="sign up"
          onPress={() => this.props.navigation.navigate('SignUp')}
        />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heading: {
    fontSize: 24,
    fontWeight: "800"
  }
})
