import React from 'react';
import { View, Text, ActivityIndicator, LogBox } from 'react-native';
LogBox.ignoreAllLogs();
export default function Carregamento() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Carregando...</Text>
   
    </View>
  );
}