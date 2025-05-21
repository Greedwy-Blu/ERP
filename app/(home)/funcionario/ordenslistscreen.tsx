import { View } from 'react-native';
import OrdensListScreen from '@/screens/funcionario/OrdensListScreen'; // Ajuste o caminho

export default function funcionarioprdemlistaScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <OrdensListScreen />
    </View>
  );
}
