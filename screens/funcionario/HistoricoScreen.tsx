import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerListHistoricoProducao } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const HistoricoScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');
        
        if (!token || userRole !== 'funcionario') {
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
          return;
        }
      } catch (error) {
        console.error('Falha ao verificar autenticação:', error);
        Alert.alert('Erro', 'Falha ao verificar autenticação. Por favor, faça login novamente.');
        if (isMounted) {
          setTimeout(() => {
            router.replace('/(login)/login');
          }, 0);
        }
      } finally {
        setIsLoadingUserCheck(false);
      }
    };
    checkUserAuth();
  }, [router, isMounted]);

  // Usar o hook de query gerado pela API para buscar o histórico
  const { 
    data: historicoResponse, 
    isLoading: isLoadingHistorico, 
    error: historicoError, 
    refetch 
  } = useOrdersControllerListHistoricoProducao(
    orderId ? Number(orderId) : 0,
    {
      query: {
        queryKey: ['historicoProducao', orderId],
        enabled: !isLoadingUserCheck && isMounted,
      },
    }
  );
    
  const historicoItems = historicoResponse?.data || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finalizado': return COLORS.success;
      case 'em_andamento': return COLORS.secondary;
      case 'interrompido': return COLORS.warning;
      case 'aberto': return COLORS.accent;
      default: return COLORS.gray;
    }
  };

  const formatDate = (dateString: string) => {
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
      console.error('Erro ao buscar histórico:', historicoError);
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    }
  }, [historicoError]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoadingUserCheck && isMounted) {
        refetch();
      }
    }, [refetch, isLoadingUserCheck, isMounted])
  );

  const handleNavigateToOrder = (orderId: string) => {
    if (isMounted) {
      router.push({ 
        pathname: '/(app_main)/funcionario/OrdemDetailScreen', 
        params: { orderId } 
      });
    }
  };

  const renderHistoricoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historicoItem}
      onPress={() => item.ordem?.id && handleNavigateToOrder(item.ordem.id)}
      disabled={!item.ordem?.id}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.orderNumber}>OP-{item.ordem?.id || 'N/A'}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.itemContent}>
         <Text style={styles.description}>
            <Text style={styles.label}>Tipo: </Text>
            {item.tipo === 'status_change' ? 'Alteração de Status' : 
             item.tipo === 'etapa_start' ? 'Início de Etapa' : 
             item.tipo === 'etapa_end' ? 'Finalização de Etapa' : 
             item.tipo || 'Registro'}
          </Text>
          {item.funcionario && (
             <Text style={styles.description}>
                <Text style={styles.label}>Funcionário: </Text>
                {item.funcionario.nome}
             </Text>
          )}
          {item.etapa && (
             <Text style={styles.description}>
                <Text style={styles.label}>Etapa: </Text>
                {item.etapa.nome}
             </Text>
          )}
          {item.statusAnterior && (
             <Text style={styles.description}>
                <Text style={styles.label}>Status Anterior: </Text>
                <Text style={{ color: getStatusColor(item.statusAnterior) }}>
                  {item.statusAnterior.replace('_', ' ')}
                </Text>
             </Text>
          )}
          {item.statusNovo && (
             <Text style={styles.description}>
                <Text style={styles.label}>Novo Status: </Text>
                <Text style={{ color: getStatusColor(item.statusNovo) }}>
                  {item.statusNovo.replace('_', ' ')}
                </Text>
             </Text>
          )}
          {item.motivoInterrupcao && (
              <Text style={styles.description}>
                <Text style={styles.label}>Motivo: </Text>
                {item.motivoInterrupcao.descricao}
              </Text>
            )}
          {item.observacoes && (
             <Text style={styles.description}>
                <Text style={styles.label}>Obs: </Text>
                {item.observacoes}
             </Text>
          )}
      </View>
    </TouchableOpacity>
  );

  if (isLoadingUserCheck || isLoadingHistorico) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
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
      
      {historicoItems.length > 0 ? (
        <FlatList
          data={historicoItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoricoItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum histórico encontrado.</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum histórico encontrado.</Text>
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
  errorText: {
    color: COLORS.error || 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
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
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  historicoItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  date: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
  },
  itemContent: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  label: {
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

export default HistoricoScreen;