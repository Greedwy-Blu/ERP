import { View } from 'react-native';
import EtapasProducaoScreen from '@/screens/gestor/EtapasProducaoScreen'; // Ajuste o caminho

export default function etapasProducao() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <EtapasProducaoScreen />
    </View>
  );
}