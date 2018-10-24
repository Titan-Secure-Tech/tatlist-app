import React from 'react';
import { View, Text, Image } from 'react-native';

export default const ListItem = ({ post }) => {
  return (
    <View>
      <View>
        <Text>{post.title}</Text>
      </View>
    </View>
  );
};
