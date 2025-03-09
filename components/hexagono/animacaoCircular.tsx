import React from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface AnimaCircularProps {
  children?: React.ReactNode;
  radius: number; // Raio do círculo
  duration: number; // Duração da animação
  initialAngle: number; // Ângulo inicial
  offset: number; // Deslocamento inicial
}

export default function AnimaCircular({ children, radius, duration, initialAngle, offset }: AnimaCircularProps) {
  const angle = useSharedValue(initialAngle + offset); // Aplica o deslocamento

  // Configura a animação do ângulo
  angle.value = withRepeat(
    withTiming(initialAngle + offset + 360, { duration }),
    -1, // Repetição infinita
    true // Reverte a animação
  );
  const animatedStyle = useAnimatedStyle(() => {
    const x = radius * Math.cos((angle.value * Math.PI) / 180); // Posição X
    const y = radius * Math.sin((angle.value * Math.PI) / 180); // Posição Y

    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  return (
    <Animated.View className='absolute' style={animatedStyle}>
      {children}
    </Animated.View>
  );
}