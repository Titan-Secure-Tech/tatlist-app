import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';

const tabBarIcon = name => ({ tintColor }) => (
  <MaterialIcons
    style={{ backgroundColor: 'transparent' }}
    name={name}
    color={tintColor}
    size={25}
  />
);

export default tabBarIcon;
