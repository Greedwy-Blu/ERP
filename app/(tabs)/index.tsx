import { View } from 'react-native';
import Welcome from '@/screens/Welcome'; // Ajuste o caminho

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Welcome />
    </View>
  );
}
