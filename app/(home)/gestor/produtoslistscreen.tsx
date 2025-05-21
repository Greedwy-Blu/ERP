import { View } from 'react-native';
import ProdutosListScreen from '@/screens/gestor/ProdutosListScreen'; // Ajuste o caminho

export default function produtolistaScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ProdutosListScreen />
    </View>
  );
}
