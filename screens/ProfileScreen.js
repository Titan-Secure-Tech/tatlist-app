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
<<<<<<< HEAD
import * as firebase  from 'firebase';
=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const IMAGE_SIZE = SCREEN_WIDTH - 80;

class CustomButton extends Component {
  constructor() {
    super();

    this.state = {
<<<<<<< HEAD
      currentUser: null,
=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
      selected: false
    };
  }

  componentDidMount() {
    const { selected } = this.props;
<<<<<<< HEAD
    this.setState({ selected });
  }
  render() {
    const { currentUser } = this.state;
=======

    this.setState({
      selected
    });
  }

  render() {
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
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
<<<<<<< HEAD
      currentUser: null,
      fontLoaded: false
    };
  }


=======
      fontLoaded: false,
    };
  }

>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
  async componentDidMount() {
    await Font.loadAsync({
      'georgia': require('../assets/fonts/Georgia.ttf'),
      'regular': require('../assets/fonts/Montserrat-Regular.ttf'),
      'light': require('../assets/fonts/Montserrat-Light.ttf'),
      'bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    });

<<<<<<< HEAD
    const { currentUser } = firebase.auth();
    this.setState({ currentUser, fontLoaded: true });
  }

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => this.props.navigation.navigate('Login'))
      .catch(error => this.setState({ errorMessage: error.message }))
=======
    this.setState({ fontLoaded: true });
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
  }

  render() {

    const { currentUser } = this.state;

    return (
      <View style={{flex: 1}}>
        <StatusBar
          barStyle="light-content"
        />
        { this.state.fontLoaded ?
<<<<<<< HEAD
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
=======
          <View style={{flex: 1, backgroundColor: 'rgba(47,44,60,1)'}}>
            <View style={styles.statusBar} />
            <View style={styles.navBar}>
              <Text style={styles.nameHeader}>
                Dan's Tattoos
              </Text>
            </View>
            <ScrollView style={{flex: 1}}>
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: 'https://data.whicdn.com/images/65321493/large.jpg' }}
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10}}
                />
              </View>
              <View style={{flex: 1, flexDirection: 'row', marginTop: 20, marginHorizontal: 40, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{flex: 1, fontSize: 26, color: 'white', fontFamily: 'bold'}}>
                  Daniel
                </Text>
                <Text style={{flex: 0.5, fontSize: 15, color: 'gray', textAlign: 'left', marginTop: 5}}>
                  0.8 mi
                </Text>
                <Text style={{flex: 1, fontSize: 26, color: 'green', fontFamily: 'bold', textAlign: 'right'}}>
                  84%
                </Text>
              </View>
              <View style={{flex: 1, marginTop: 20, width: SCREEN_WIDTH - 80, marginLeft: 40}}>
                <Text style={{flex: 1, fontSize: 15, color: 'white', fontFamily: 'regular'}}>Something about the shop here.</Text>
              </View>
              <View style={{flex: 1, marginTop: 30}}>
                <Text style={{flex: 1, fontSize: 15, color: 'rgba(216, 121, 112, 1)', fontFamily: 'regular', marginLeft: 40}}>
                  INFLUENCES
                </Text>
                <View style={{flex: 1, width: SCREEN_WIDTH, marginTop: 20}}>
                  <ScrollView
                    style={{flex: 1}}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    <View style={{flex: 1, flexDirection: 'column', height: 170, marginLeft: 40, marginRight: 10}}>
                      <View style={{flex: 1, flexDirection: 'row'}}>
                        <CustomButton title="Warhol" selected={true} />
                        <CustomButton title="Stash" />
                        <CustomButton title="ESPO" selected={true} />
                        <CustomButton title="Ces" />
                      </View>
                      <View style={{flex: 1, flexDirection: 'row' }}>
                        <CustomButton title="Basquiat" />
                        <CustomButton title="Sane" selected={true} />
                        <CustomButton title="T-Kid 170" selected={true} />
                        <CustomButton title="Kahinde Wiley" />
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
              <View style={{flex: 1, marginTop: 30}}>
                <Text style={{flex: 1, fontSize: 15, color: 'rgba(216, 121, 112, 1)', fontFamily: 'regular', marginLeft: 40}}>
                  INFO
                </Text>
                <View style={{flex: 1, flexDirection: 'row', marginTop: 20, marginHorizontal: 30}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      <Text style={styles.infoTypeLabel}>Age</Text>
                      <Text style={styles.infoTypeLabel}>Height</Text>
                      <Text style={styles.infoTypeLabel}>Ethnicity</Text>
                      <Text style={styles.infoTypeLabel}>Sign</Text>
                      <Text style={styles.infoTypeLabel}>Religion</Text>
                    </View>
                    <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.infoAnswerLabel}>26</Text>
                      <Text style={styles.infoAnswerLabel}>5'4"</Text>
                      <Text style={styles.infoAnswerLabel}>White</Text>
                      <Text style={styles.infoAnswerLabel}>Pisces</Text>
                      <Text style={styles.infoAnswerLabel}>Catholic</Text>
                    </View>
                  </View>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      <Text style={styles.infoTypeLabel}>Body Type</Text>
                      <Text style={styles.infoTypeLabel}>Diet</Text>
                      <Text style={styles.infoTypeLabel}>Smoke</Text>
                      <Text style={styles.infoTypeLabel}>Drink</Text>
                      <Text style={styles.infoTypeLabel}>Drugs</Text>
                    </View>
                    <View style={{flex: 1, marginLeft: 10, marginRight: -20}}>
                      <Text style={styles.infoAnswerLabel}>Fit</Text>
                      <Text style={styles.infoAnswerLabel}>Vegan</Text>
                      <Text style={styles.infoAnswerLabel}>No</Text>
                      <Text style={styles.infoAnswerLabel}>No</Text>
                      <Text style={styles.infoAnswerLabel}>Never</Text>
                    </View>
                  </View>
                </View>
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
                title="Share Profile"
                titleStyle={{ fontFamily: 'regular', fontSize: 20, color: 'white', textAlign: 'center' }}
                onPress={() => console.log('Message Theresa')}
                activeOpacity={0.5}
              />
            </ScrollView>
          </View> :
          <Text>Loading...</Text>
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
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
<<<<<<< HEAD


=======
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269

