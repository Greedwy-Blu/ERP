import { View } from 'react-native';
import SetorCreateScreen from '@/screens/gestor/SetorCreateScreen'; // Ajuste o caminho

export default function setorScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <SetorCreateScreen />
    </View>
  );
}
