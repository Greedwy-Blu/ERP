import { View } from 'react-native';
import FuncionarioDashboard from '@/screens/funcionario/FuncionarioDashboard'; // Ajuste o caminho

export default function funcionariohomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <FuncionarioDashboard />
    </View>
  );
}
