import { View } from 'react-native';
import OrdemInterruptScreen from '@/screens/gestor/OrdemInterruptScreen'; // Ajuste o caminho

export default function interruperOrdemProducao() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <OrdemInterruptScreen />
    </View>
  );
}