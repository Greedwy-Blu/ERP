import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function Layout() {
  return (
    <View className='bg-slate-50'>
    <Stack>
      <Stack.Screen
        name="(tab)/index"
        options={{ headerShown: false }} // Oculta o cabeçalho na tela inicial
      />
      <Stack.Screen
        name="carregamento"
        options={{ headerShown: false }} // Oculta o cabeçalho na tela de carregamento
      />
      <Stack.Screen
        name="+not_found"
        options={{ headerShown: false }} // Oculta o cabeçalho na tela de página não encontrada
      />
    </Stack>
    </View>
  );
}