import { View } from 'react-native';
import ProdutoDetailScreen from '@/screens/gestor/ProdutoDetailScreen'; // Ajuste o caminho

export default function produtodeatilScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ProdutoDetailScreen />
    </View>
  );
}
