import { View } from 'react-native';
import RastreamentoScreen from '@/screens/gestor/RastreamentoScreen'; // Ajuste o caminho

export default function rastreamentoProducao() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <RastreamentoScreen />
    </View>
  );
}