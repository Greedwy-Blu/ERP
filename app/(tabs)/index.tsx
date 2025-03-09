import { Image, StyleSheet, Platform, View, Text, Button, Alert } from 'react-native';

import enableStrictMode  from 'react-native-reanimated';
import { LogBox } from 'react-native'; 
import Welcome from '@/screens/Welcome'; 
import "@/global.css"
import { Stack } from 'expo-router';
LogBox.ignoreAllLogs();
export default function HomeScreen() {
  return (
    <View className='bg-slate-50'>
       <Stack.Screen
        options={{ headerShown: false }} // Remove o cabeçalho
      />

   <Welcome/>
  </View>
  );
}

