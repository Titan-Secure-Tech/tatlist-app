// SearchBar.js

import React, { Component } from 'react';
import { SearchBar } from 'react-native-elements';

export default class Search extends Component {
  render() {
    return (
      <SearchBar placeholder="Search for an item..." lightTheme round />
    );
  }
}

