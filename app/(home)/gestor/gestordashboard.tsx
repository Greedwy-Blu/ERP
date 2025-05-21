import { View } from 'react-native';
import GestorDashboard from '@/screens/gestor/gestordashboard'; // Ajuste o caminho

export default function gestorhomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <GestorDashboard />
    </View>
  );
}
