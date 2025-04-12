import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Página não encontrada!</Text>
      <Link href="/" style={{ marginTop: 15, color: 'blue' }}>
       <Text> Voltar para o início</Text>
      </Link>
    </View>
  );
}