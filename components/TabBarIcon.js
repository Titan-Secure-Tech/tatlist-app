import React from 'react';
import { Icon } from 'expo';
<<<<<<< HEAD
=======

>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
import Colors from '../constants/Colors';

export default class TabBarIcon extends React.Component {
  render() {
    return (
      <Icon.Ionicons
        name={this.props.name}
        size={26}
        style={{ marginBottom: -3 }}
        color={this.props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> dbdc6092ea3dfa9d3a06f94b7f64a138746aa269
