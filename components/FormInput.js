// ==========
// FormInput.js
// ==========

import React, { Component } from 'react';
import { Icon, Input } from 'react-native-elements';

export const FormInput = props => {
  const { icon, refInput, ...otherProps } = props
  return (
    <Input
      {...otherProps}
      ref={refInput}
      inputContainerStyle={styles.inputContainer}
      leftIcon={<Icon name={icon} color="#7384B4" size={18} />}
      inputStyle={styles.inputStyle}
      autoFocus={false}
      autoCapitalize="none"
      keyboardAppearance="dark"
      errorStyle={styles.errorInputStyle}
      autoCorrect={false}
      blurOnSubmit={false}
      placeholderTextColor="#7384B4"
    />
  )
}


