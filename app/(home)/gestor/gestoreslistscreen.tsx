import { View } from 'react-native';
import GestoresListScreen from '@/screens/gestor/GestoresListScreen'; // Ajuste o caminho

export default function gestorlistScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <GestoresListScreen />
    </View>
  );
}
