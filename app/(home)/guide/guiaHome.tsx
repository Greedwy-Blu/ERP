import { View } from 'react-native';
import GuideScreen from '@/screens/guide'; // Ajuste o caminho

export default function guiasScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <GuideScreen />
    </View>
  );
}
