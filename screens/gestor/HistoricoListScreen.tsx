import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '@/constants/colors'; // Ajuste o caminho conforme necessário
import { useOrdersControllerListHistoricoProducao } from '@/api/generated'; // Ajuste o caminho conforme necessário
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const HistoricoListScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams(); // Opcional: ID da ordem para filtrar histórico específico
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        
        if (!token) {
          router.replace('/(login)/login');
          return;
        }
      } catch (error) {
        console.error('Falha ao verificar autenticação:', error);
        Alert.alert('Erro', 'Falha ao verificar autenticação. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserCheck(false);
      }
    };

    checkUserAuth();
  }, [router]);

  // Buscar histórico de produção usando o hook gerado pelo Orval
  const { data: historicoResponse, isLoading: isLoadingHistorico, error: historicoError, refetch } = useOrdersControllerListHistoricoProducao(
    orderId ? Number(orderId) : undefined, // Se orderId estiver definido, buscar histórico específico
    {
      query: {
        enabled: !isLoadingUserCheck, // Só executar a consulta após a verificação do usuário
      }
    }
  );

  // Assumindo que a API retorna { data: HistoricoProducao[] }
  const historicos = historicoResponse?.data || [];

  // Função para formatar a data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lidar com erros da API
  useEffect(() => {
    if (historicoError) {
      console.error('Erro ao buscar histórico de produção:', historicoError);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de produção.');
    }
  }, [historicoError]);

  // Recarregar dados quando a tela receber foco
  useEffect(() => {
    const unsubscribe = router.addListener('focus', () => {
      if (!isLoadingUserCheck) {
        refetch();
      }
    });

    return unsubscribe;
  }, [router, refetch, isLoadingUserCheck]);

  if (isLoadingUserCheck || isLoadingHistorico) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando histórico de produção...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {orderId ? `Histórico da Ordem #${orderId}` : 'Histórico Geral de Produção'}
        </Text>
      </View>

      {historicos.length > 0 ? (
        <FlatList
          data={historicos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {item.tipo === 'status_change' ? 'Alteração de Status' : 
                   item.tipo === 'etapa_start' ? 'Início de Etapa' : 
                   item.tipo === 'etapa_end' ? 'Finalização de Etapa' : 
                   'Registro de Produção'}
                </Text>
                <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
              </View>
              
              <View style={styles.itemDetails}>
                {item.ordem && (
                  <Text style={styles.itemDetailText}>
                    <Text style={styles.itemDetailLabel}>Ordem: </Text>
                    OP-{item.ordem.id}
                  </Text>
                )}
                
                {item.funcionario && (
                  <Text style={styles.itemDetailText}>
                    <Text style={styles.itemDetailLabel}>Funcionário: </Text>
                    {item.funcionario.nome}
                  </Text>
                )}
                
                {item.etapa && (
                  <Text style={styles.itemDetailText}>
                    <Text style={styles.itemDetailLabel}>Etapa: </Text>
                    {item.etapa.nome}
                  </Text>
                )}
                
                {item.statusAnterior && (
                  <Text style={styles.itemDetailText}>
                    <Text style={styles.itemDetailLabel}>Status Anterior: </Text>
                    {item.statusAnterior}
                  </Text>
                )}
                
                {item.statusNovo && (
                  <Text style={styles.itemDetailText}>
                    <Text style={styles.itemDetailLabel}>Novo Status: </Text>
                    {item.statusNovo}
                  </Text>
                )}
                
                {item.motivoInterrupcao && (
                  <Text style={styles.itemDetailText}>
                    <Text style={styles.itemDetailLabel}>Motivo de Interrupção: </Text>
                    {item.motivoInterrupcao.descricao}
                  </Text>
                )}
                
                {item.observacoes && (
                  <Text style={styles.itemDetailText}>
                    <Text style={styles.itemDetailLabel}>Observações: </Text>
                    {item.observacoes}
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum registro de histórico encontrado.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  itemDate: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginTop: 4,
  },
  itemDetails: {
    marginTop: 8,
  },
  itemDetailText: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginBottom: 4,
  },
  itemDetailLabel: {
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
    textAlign: 'center',
  },
});

export default HistoricoListScreen;
