// ================
// ProfileScreen.js
// ================

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Button } from 'react-native-elements'
import { Font } from 'expo';
import * as firebase  from 'firebase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const IMAGE_SIZE = SCREEN_WIDTH - 80;

class CustomButton extends Component {
  constructor() {
    super();

    this.state = {
      currentUser: null,
      selected: false
    };
  }

  componentDidMount() {
    const { selected } = this.props;
    this.setState({ selected });
  }
  render() {
    const { currentUser } = this.state;
    const { title } = this.props;
    const { selected } = this.state;

    return (
      <Button
        title={title}
        titleStyle={{ fontSize: 15, color: 'white', fontFamily: 'regular' }}
        buttonStyle={selected ? { backgroundColor: 'rgba(213, 100, 140, 1)', borderRadius: 100, width: 127 } : { borderWidth: 1, borderColor: 'white', borderRadius: 30, width: 127, backgroundColor: 'transparent' }}
        containerStyle={{ marginRight: 10 }}
        onPress={() => this.setState({ selected: !selected })}
      />
    );
  }
}

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: null,
      fontLoaded: false
    };
  }


  async componentDidMount() {
    await Font.loadAsync({
      'georgia': require('../assets/fonts/Georgia.ttf'),
      'regular': require('../assets/fonts/Montserrat-Regular.ttf'),
      'light': require('../assets/fonts/Montserrat-Light.ttf'),
      'bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    });

    const { currentUser } = firebase.auth();
    this.setState({ currentUser, fontLoaded: true });
  }

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => this.props.navigation.navigate('Login'))
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  render() {

    const { currentUser } = this.state;

    return (
      <View style={{flex: 1}}>
        <StatusBar
          barStyle="light-content"
        />
        { this.state.fontLoaded ?
            <View style={{flex: 1, backgroundColor: 'rgba(47,44,60,1)'}}>
              <View style={styles.statusBar} />
              <ScrollView style={{flex: 1}}>
                <View style={{flex: 1, flexDirection: 'row', marginTop: 20, marginHorizontal: 40, justifyContent: 'center', alignItems: 'center'}}>
                </View>
                <View style={{flex: 1, marginTop: 20, width: SCREEN_WIDTH - 80, marginLeft: 40}}>
                  <Text style={{flex: 1, fontSize: 15, color: 'white', fontFamily: 'regular'}}>Update Profile Photo</Text>
                  <Text style={{flex: 1, fontSize: 15, color: 'white', fontFamily: 'regular'}}>Update Address</Text>
                  <Text style={{flex: 1, fontSize: 15, color: 'white', fontFamily: 'regular'}}>{currentUser.email}</Text>
                  <Text style={{flex: 1, fontSize: 15, color: 'white', fontFamily: 'regular'}}>{currentUser.displayName}</Text>
                </View>
                <Button
                  containerStyle={{ marginVertical: 20 }}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  buttonStyle={{ height: 55, width: SCREEN_WIDTH - 40, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}
                  linearGradientProps = {{
                    colors: ['rgba(214,116,112,1)', 'rgba(233,174,87,1)'],
                    start: [1, 0],
                    end: [0.2, 0]
                  }}
                  title="Sign Out"
                  titleStyle={{ fontFamily: 'regular', fontSize: 20, color: 'white', textAlign: 'center' }}
                  onPress={this.handleSignOut}
                  activeOpacity={0.5}
                />
              </ScrollView>
            </View> :
            <Text>Loading...</Text>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statusBar: {
    height: 10,
  },
  navBar: {
    height: 60,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignContent: 'center'
  },
  nameHeader: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center'
  },
  infoTypeLabel: {
    fontSize: 15,
    textAlign: 'right',
    color: 'rgba(126,123,138,1)',
    fontFamily: 'regular',
    paddingBottom: 10,
  },
  infoAnswerLabel: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'regular',
    paddingBottom: 10,
  }
});



