import { View } from 'react-native';
import OrdensGestorListScreen from '@/screens/gestor/OrdensGestorListScreen'; // Ajuste o caminho

export default function ordengestorlistScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <OrdensGestorListScreen />
    </View>
  );
}
