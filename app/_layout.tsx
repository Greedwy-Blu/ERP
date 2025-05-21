import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// Create a client
const queryClient = new QueryClient();
export function BackButton() {
  const router = useRouter();
  
  return (
    <TouchableOpacity onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 15 }} />
    </TouchableOpacity>
  );
}
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <Stack screenOptions={{
            headerShown: false,
          }}>
          {/* Login Route */}
          <Stack.Screen name="(login)/login" options={{ headerShown: false }} />
          
          {/* Main App Routes (Funcionário e Gestor) */}
          <Stack.Screen name="(home)/funcionario/funcionariodashboard" options={{ title: 'Dashboard Funcionário' }} />
          <Stack.Screen name="(home)/funcionario/ordenslistscreen" options={{ title: 'Minhas Ordens' }} />
          <Stack.Screen name="(home)/funcionario/ordemdetailscreen" options={{ title: 'Detalhes da Ordem' }} />
          <Stack.Screen name="(home)/funcionario/ordemupdatestatusscreen" options={{ title: 'Atualizar Status' }} />
          <Stack.Screen name="(home)/funcionario/ordemfillscreen" options={{ title: 'Preencher Informações' }} />
          <Stack.Screen name="(home)/funcionario/historicoscreen" options={{ title: 'Histórico' }} />
          <Stack.Screen name="(home)/funcionario/perfilscreen" options={{ title: 'Perfil' }} />

          <Stack.Screen name="(home)/gestor/gestordashboard" options={{ title: 'Dashboard Gestor' }} />
          {/* Adicionar outras rotas do gestor aqui conforme necessário */}
          <Stack.Screen name="(home)/gestor/funcionarioslistscreen" options={{ title: 'Funcionários' }} />
          <Stack.Screen name="(home)/gestor/funcionariodetailscreen" options={{ title: 'Detalhes Funcionário' }} />
          <Stack.Screen name="(home)/gestor/funcionariocreatescreen" options={{ title: 'Criar Funcionário' }} />
          <Stack.Screen name="(home)/gestor/setoreslistscreen" options={{ title: 'Setores' }} />
          <Stack.Screen name="(home)/gestor/setordetailscreen" options={{ title: 'Detalhes Setor' }} />
          <Stack.Screen name="(home)/gestor/setorcreatescreen" options={{ title: 'Criar Setor' }} />
          <Stack.Screen name="(home)/gestor/produtoslistscreen" options={{ title: 'Produtos', headerLeft: ({ canGoBack }) => canGoBack && <BackButton /> }} />
          <Stack.Screen name="(home)/gestor/produtodetailscreen" options={{ title: 'Detalhes Produto' }} />
          <Stack.Screen name="(home)/gestor/produtocreatescreen" options={{ title: 'Criar Produto' }} />
          <Stack.Screen name="(home)/gestor/ordensgestorlistscreen" options={{ title: 'Ordens (Gestor)' }} />
          <Stack.Screen name="(home)/gestor/ordemgestordetailscreen" options={{ title: 'Detalhes Ordem (Gestor)' }} />
          <Stack.Screen name="(home)/gestor/ordemcreatescreen" options={{ title: 'Criar Ordem' }} />
          <Stack.Screen name="(home)/gestor/gestoreslistscreen" options={{ title: 'Gestores' }} />
          <Stack.Screen name="(home)/gestor/historicolistscreen" options={{ title: 'Histórico (Gestor)' }} />

          {/* Rotas do guia */}
          <Stack.Screen name="(home)/guide/guiaHome" options={{ headerShown: false }} />
          <Stack.Screen name="(home)/guide/livroSelecao" options={{ headerShown: false }} />
          <Stack.Screen name="(home)/guide/funcionario/funcionario" options={{ headerShown: false }} />
          <Stack.Screen name="(home)/guide/gestores/gestor" options={{ headerShown: false }} />

          {/* Rotas de tabs */}
          <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} /> 
          <Stack.Screen name="(tabs)/carregamento" options={{ headerShown: false }} /> 
          
          {/* Not Found Route */}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
