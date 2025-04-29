import { Stack } from 'expo-router';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <Stack initialRouteName="(login)/login" screenOptions={{
            headerShown: false,
          }}>
          {/* Login Route */}
          <Stack.Screen name="(login)/login" options={{ headerShown: false }} />
          
          {/* Main App Routes (Funcionário e Gestor) */}
          <Stack.Screen name="(tes)/funcionario/FuncionarioDashboard" options={{ title: 'Dashboard Funcionário' }} />
          <Stack.Screen name="(app_main)/funcionario/OrdensListScreen" options={{ title: 'Minhas Ordens' }} />
          <Stack.Screen name="(app_main)/funcionario/OrdemDetailScreen" options={{ title: 'Detalhes da Ordem' }} />
          <Stack.Screen name="(app_main)/funcionario/OrdemUpdateStatusScreen" options={{ title: 'Atualizar Status' }} />
          <Stack.Screen name="(app_main)/funcionario/OrdemFillScreen" options={{ title: 'Preencher Informações' }} />
          <Stack.Screen name="(app_main)/funcionario/HistoricoScreen" options={{ title: 'Histórico' }} />
          <Stack.Screen name="(app_main)/funcionario/PerfilScreen" options={{ title: 'Perfil' }} />

          <Stack.Screen name="(app_main)/gestor/GestorDashboard" options={{ title: 'Dashboard Gestor' }} />
          {/* Adicionar outras rotas do gestor aqui conforme necessário */}
          <Stack.Screen name="(app_main)/gestor/FuncionariosListScreen" options={{ title: 'Funcionários' }} />
          <Stack.Screen name="(app_main)/gestor/FuncionarioDetailScreen" options={{ title: 'Detalhes Funcionário' }} />
          <Stack.Screen name="(app_main)/gestor/FuncionarioCreateScreen" options={{ title: 'Criar Funcionário' }} />
          <Stack.Screen name="(app_main)/gestor/SetoresListScreen" options={{ title: 'Setores' }} />
          <Stack.Screen name="(app_main)/gestor/SetorDetailScreen" options={{ title: 'Detalhes Setor' }} />
          <Stack.Screen name="(app_main)/gestor/SetorCreateScreen" options={{ title: 'Criar Setor' }} />
          <Stack.Screen name="(app_main)/gestor/ProdutosListScreen" options={{ title: 'Produtos' }} />
          <Stack.Screen name="(app_main)/gestor/ProdutoDetailScreen" options={{ title: 'Detalhes Produto' }} />
          <Stack.Screen name="(app_main)/gestor/ProdutoCreateScreen" options={{ title: 'Criar Produto' }} />
          <Stack.Screen name="(app_main)/gestor/OrdensGestorListScreen" options={{ title: 'Ordens (Gestor)' }} />
          <Stack.Screen name="(app_main)/gestor/OrdemGestorDetailScreen" options={{ title: 'Detalhes Ordem (Gestor)' }} />
          <Stack.Screen name="(app_main)/gestor/OrdemCreateScreen" options={{ title: 'Criar Ordem' }} />
          <Stack.Screen name="(app_main)/gestor/GestoresListScreen" options={{ title: 'Gestores' }} />
          <Stack.Screen name="(app_main)/gestor/HistoricoListScreen" options={{ title: 'Histórico (Gestor)' }} />

          {/* Rotas antigas/outras - verificar se ainda são necessárias */}
          <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} /> 
           <Stack.Screen name="(tabs)/carregamento" options={{ headerShown: false }} /> 
           <Stack.Screen name="(home)/(guide)/gestores/gestor" options={{ headerShown: false }} /> 
           <Stack.Screen name="(home)/(guide)/funcionario/funcionario" options={{ headerShown: false }} /> 
           <Stack.Screen name="(home)/(guide)/guiaHome" options={{ headerShown: false }} /> 
           <Stack.Screen name="(home)/(guide)/livroSelecao"  /> 
          
          {/* Not Found Route */}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
