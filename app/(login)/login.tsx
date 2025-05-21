import { View } from 'react-native';
import LoginScreen from '@/screens/Login'; // Ajuste o caminho

export default function guiasScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <LoginScreen />
    </View>
  );
}
