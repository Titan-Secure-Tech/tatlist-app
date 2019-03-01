// ==================
// SignUpScreen.js
// ==================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { Firebase } from '../config/db';


const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

export default class SignUpScreen extends React.Component {

  state = { ...INITIAL_STATE  }

  handleSignUp = () => {

    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => this.props.navigation.navigate('Main'))
      .catch(error => this.setState({ errorMessage: error.message}))
  }

  render() {

    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <View style={styles.container}>
        <Text>Sign Up</Text>
        {
          this.state.errorMessage &&
            <Text style={{ color: 'red' }}>
              {this.state.errorMessage}
            </Text>
        }
        <Input
          placeholder="Username"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={username => this.setState({ username })}
          value={this.state.username}
        />
        <Input
          placeholder="Email"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <Input
          secureTextEntry
          placeholder="Password"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={passwordOne => this.setState({ passwordOne })}
          value={this.state.passwordOne}
        />
        <Input
          secureTextEntry
          placeholder="Repeat Password"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={passwordTwo => this.setState({ passwordTwo })}
          value={this.state.passwordTwo}
        />

          <Button
            title="Submit"
            disabled={isInvalid}
            onPress={this.handleSignUp}
          />

        {error && <Text>{error.message}</Text>}

        <Text>Already have an account?</Text>

        <Button
          title="Login"
          onPress={() => this.props.navigation.navigate('Login')}
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
    marginTop: 8,
    marginBottom: 10
  }
})
