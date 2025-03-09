import React, { useRef } from 'react';
import { TouchableOpacity, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function Button({ title, onPress }) {
  const navigation = useNavigation();
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleX: scaleX.value }, { scaleY: scaleY.value }],
    };
  });

  const handlePress = () => {
    scaleX.value = withSpring(width / 100, { damping: 10 }, () => {
      scaleY.value = withSpring(1, { damping: 10 }, () => {
        runOnJS(onPress)();
      });
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: '#4FD1C5',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}