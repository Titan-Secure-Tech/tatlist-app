// registrationScreen.js

import React from 'react'
import * as firebase from 'firebase';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native'

export default class registrationScreen extends React.Component {

  state = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    shop_name: '',
    shop_address: '',
    shop_phone: '',
    errorMessage: null
  }

  handleRegistration = () => {
    firebase.auth().createUserWithEmailAndPassword(
      this.state.email,
      this.state.password
    )
      .then((resp) => {
        return firebase
          .firestore()
          .collection('Users')
          .doc(resp.user.uid).set({
          username: this.state.username,
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          email: this.state.email,
          phone: this.state.phone,
          shop_name: this.state.shop_name,
          shop_address: this.state.shop_address,
          shop_phone: this.state.shop_phone
        })
      })
      .then(() => console.log("document added successfully with ID: ", doc.id))
      .then(() => this.props.navigation.navigate('HomeScreen'))
      .catch(error => this.setState({ errorMessage: error.message}))
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Registration</Text>
        {
          this.state.errorMessage &&
            <Text style={{ color: 'red' }}>
              {this.state.errorMessage}
            </Text>
        }

            <TextInput
              placeholder="Email Address"
              textContentType="emailAddress"
              autoCapitalize="none"
              style={styles.textInput}
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
            <TextInput
              placeholder="Username"
              textContentType="name"
              autoCapitalize="none"
              style={styles.textInput}
              onChangeText={username => this.setState({ username })}
              value={this.state.username}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              style={styles.textInput}
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
            <TextInput
              placeholder="First Name"
              textContentType="givenName"
              autoCapitalize="words"
              style={styles.textInput}
              onChangeText={first_name => this.setState({ first_name })}
              value={this.state.first_name}
            />
            <TextInput
              placeholder="Last Name"
              textContentType="familyName"
              autoCapitalize="words"
              style={styles.textInput}
              onChangeText={last_name => this.setState({ last_name })}
              value={this.state.last_name}
            />
            <TextInput
              placeholder="Phone Number"
              textContentType="telephoneNumber"
              style={styles.textInput}
              keyboardType="phone-pad"
              onChangeText={phone => this.setState({ phone })}
              value={this.state.phone}
            />
            <TextInput
              placeholder="Shop Name"
              textContentType="organizationName"
              autoCapitalize="words"
              style={styles.textInput}
              onChangeText={shop_name => this.setState({ shop_name })}
              value={this.state.shop_name}
            />
            <TextInput
              placeholder="Shop Address"
              autoCapitalize="words"
              textContentType="fullStreetAddress"
              style={styles.textInput}
              onChangeText={shop_address => this.setState({ shop_address })}
              value={this.state.shop_address}
            />
            <TextInput
              placeholder="Shop Phone No."
              textContentType="telephoneNumber"
              style={styles.textInput}
              onChangeText={shop_phone => this.setState({ shop_phone })}
              value={this.state.shop_phone}
            />
            <Button title="Sign Up" onPress={this.handleRegistration} />
            <Button
              title="Already have an account? Login"
              onPress={() => this.props.navigation.navigate('LoginScreen')}
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
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})


