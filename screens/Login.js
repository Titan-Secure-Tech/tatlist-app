// Login.js

import React, { Component } from 'react';
import FirebaseLogin from '../FirebaseLogin';

export default class LoginScreen extends Component {
  render() {
    return (
      <FirebaseLogin
        login={user => console.warn(user)}
      />
    );
  }
}

