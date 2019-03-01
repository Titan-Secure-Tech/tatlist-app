<<<<<<< HEAD
// Login.js
import React from 'react';
import * as firebase from 'firebase';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';

export default class loginScreen extends React.Component {

  state = { email: '',
=======
// LoginScreen.js
// ==============

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input, Button } from 'react-native-elements';
import * as firebase from 'firebase';

export default class LoginScreen extends React.Component {

  state = {
    email: '',
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
    password: '',
    errorMessage: null
  }

  handleLogin = () => {
    const { email, password } = this.state
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
<<<<<<< HEAD
      .then(() => this.props.navigation.navigate('HomeScreen'))
=======
      .then(() => this.props.navigation.navigate('Main'))
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  render() {
    return (
      <View style={styles.container}>
<<<<<<< HEAD
        <Text>Login </Text>
        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Password"
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <Button title="Login" onPress={this.handleLogin} />
        <Button
          title="Don't have an account? Sign Up"
          onPress={() => this.props.navigation.navigate('RegistrationScreen')}
        />
      </View>
=======
        <Text>Login</Text>
        {this.state.errorMessage &&
            <Text style={{ color: 'red' }}>
              {this.state.errorMessage}
            </Text>}
            <Input
              style={styles.textInput}
              autoCapitalize="none"
              placeholder="Email"
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
            <Input
              secureTextEntry
              style={styles.textInput}
              autoCapitalize="none"
              placeholder="Password"
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
            <Button title="Login" onPress={this.handleLogin} />
            <Button
              title="Don't have an account? Sign Up"
              onPress={() => this.props.navigation.navigate('SignUp')}
            />
          </View>
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
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
<<<<<<< HEAD


=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
