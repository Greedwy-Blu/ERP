import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimaProps {
    children?: React.ReactNode; // Aceita children
  }
export default function Anima({ children}: AnimaProps){

  return (
    <View className=' w-[100] h-[100] px-2 py-1'>
      <LottieView
        source={require('@/assets/animationHex.json')} // Substitua pelo nome do seu arquivo JSON
        autoPlay
        loop
        style={styles.animation}
      />
        {children} 
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 100,
    height: 100,
  },
});