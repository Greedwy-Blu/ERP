import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import AnimaCircular from './animacaoCircular';
import Anima from './animcao';

const elements: number[] = [0, 1, 2, 3, 4]; // 5 elementos
const radius: number = 80; // Raio do círculo
const offsets: number[] = [0, 45, 90, 135, 180]; // Deslocamentos fixos


export default function HexagonMask() {
  return (
    <View style={styles.container}>
      {elements.map((_, index) => {
        const initialAngle = (360 / elements.length) * index;
        const offset = offsets[index];
        const duration = 12000 + index * 1000;

        return (
          <View key={index} style={styles.absolute}>
            <AnimaCircular radius={radius} duration={duration} initialAngle={initialAngle} offset={offset}>
              <Anima>
               
              </Anima>
            </AnimaCircular>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
  },
  imageContainer: {
    position: 'absolute',
    left: 10,
    top: 8,
    width: 80,
    height: 80,
  },
  image: {
    width: '70%',
    height: '70%',
  },
});