import { Image, StyleSheet, Platform, View, Text } from 'react-native';
import Welcome from '@/screens/Welcome'; 
import "@/global.css"
export default function HomeScreen() {
  return (
    <View style={{ pointerEvents: 'none' }}>
      
   <Welcome/>
  </View>
  );
}

