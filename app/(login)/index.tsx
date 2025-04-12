import { View } from 'react-native';
import Login from './login'; // Ajuste o caminho

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Login />
    </View>
  );
}