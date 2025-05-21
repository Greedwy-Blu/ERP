import { View } from 'react-native';
import SetoresListScreen from '@/screens/gestor/SetoresListScreen'; // Ajuste o caminho

export default function setoreslistaScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <SetoresListScreen />
    </View>
  );
}
