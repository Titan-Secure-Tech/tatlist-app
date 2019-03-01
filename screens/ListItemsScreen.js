// ==================
// ListItemsScreen.js
// ==================

import React, { Component } from 'react';
import * as firebase from 'firebase';
import { View, Text, FlatList, StyleSheet } from 'react-native';
// import { SearchBar, Icon } from 'react-native-elements';
// import Product from '../components/Product';


export default class ListItemsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      products: [],
      arrayholder: []
    };

    // this.handleQueryChange = this.handleQueryChange.bind(this);
    // this.handleSearchClear = this.handleSearchClear.bind(this);
  }

  componentDidMount() {
    let productsRef =
      firebase
      .database()
      .ref('/Products');
    productsRef.on('value', (snapshot) => {
      let data = snapshot.val();
      let products = Object.values(data);
      this.setState({products});
    });
  }

//   searchFilterFunction = text => {
//     const newData = this.arrayholder.filter(item => {
//       const itemData = `${item.name.toUpperCase()} ${item.category.toUpperCase()} ${item.sku.toUpperCase()}`;
//       const textData = text.toUpperCase();
//       return itemData.indexOf(textData) > -1;
//     });
//     this.setState({data:newData});
//   };

//   handleQueryChange = query =>
//     this.setState(state => ({ ...state, query: query || "" }));

//   handleSearchCancel = () => this.handleQueryChange("");
//   handleSearchClear = () => this.handleQueryChange("");

  render() {
    return (
      <View style={styles.container}>
        <Text> listItemsScreen.js </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: 25,
    paddingTop: 25
  },
})

