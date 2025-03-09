import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Página não encontrada!</Text>
      <Link href="/" style={{ marginTop: 20, color: '#4FD1C5', fontSize: 16 }}>
        Voltar para a tela inicial
      </Link>
    </View>
  );
}
