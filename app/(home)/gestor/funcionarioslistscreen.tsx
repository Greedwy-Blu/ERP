import { View } from 'react-native';
import FuncionariosListScreen from '@/screens/gestor/FuncionariosListScreen'; // Ajuste o caminho

export default function funcionariolistScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <FuncionariosListScreen />
    </View>
  );
}
