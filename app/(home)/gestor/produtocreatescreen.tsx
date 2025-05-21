import { View } from 'react-native';
import ProdutoCreateScreen from '@/screens/gestor/ProdutoCreateScreen'; // Ajuste o caminho

export default function produtocreateScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ProdutoCreateScreen />
    </View>
  );
}
