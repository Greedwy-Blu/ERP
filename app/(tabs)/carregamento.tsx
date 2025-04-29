import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function Carregamento() {
  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
  
    scale.value = withRepeat(
      withTiming(1.2, { 
        duration: 1000, 
        easing: Easing.inOut(Easing.ease) 
      }),
      -1,
      true
    );

    const timer = setTimeout(() => {
      router.push('/(login)/login');
    }, 2000); 

    return () => clearTimeout(timer); 
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOLARIUM: Transformando dados {'\n'}em produtividade</Text>
      <Text style={styles.subtitle}>
        Com o SOLARIUM,{'\n'} cada movimento na fábrica vira informação valiosa.
      </Text>

      <View style={styles.deliverySection}>
        <View style={styles.circleBackground}>
          <Animated.View style={[animatedStyle, { padding: 10 }]}>
            <MaterialIcons 
              name="precision-manufacturing" 
              size={80} 
              color="#2d3748" 
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2d3748',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4a5568',
    marginBottom: 40,
    lineHeight: 20,
  },
  deliverySection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    backgroundColor: '#e2e8f0',
    width: 180,
    height: 250,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
});