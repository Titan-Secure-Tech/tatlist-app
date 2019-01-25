// Main.js
import React from 'react'
import { StyleSheet, TextInput, Platform, Image, Text, View, Button } from 'react-native'
import * as firebase from 'firebase';

export default class Main extends React.Component {

  state = {
    currentUser: null,
    textInput: '',
    errorMessage: null
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
  }

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => this.props.navigation.navigate('Login'))
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  handleAddItem = () => {
    // TODO: Firebase stuff...
    firebase
      .firestore()
      .collection('users')
      .add({
        favorites: this.state.textInput
      })
      .then(() => console.log("document added successfully with ID: ", doc.id))
      .catch(error => this.setState({ errorMessage: error.message}))
  }

  render() {

    const { currentUser } = this.state

    return (
      <View style={styles.container}>
        <Text>
          Hi {currentUser && currentUser.email}!
        </Text>
        <Text>
          displayName: {currentUser && currentUser.displayName}
        </Text>
        <Button
          title="Sign Out"
          onPress={this.handleSignOut}
        />
        <Text>
          UID: {currentUser && currentUser.uid}
        </Text>
        <TextInput
          style={styles.title}
          placeholder="Add a product here..."
          onChangeText={textInput => this.setState({ textInput })}
          value={this.state.textInput}
        />
        <Button
          title={'Submit'}
          disabled={!this.state.textInput.length}
          onPress={this.handleAddItem}
        />
        <Text>List of added products:</Text>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
