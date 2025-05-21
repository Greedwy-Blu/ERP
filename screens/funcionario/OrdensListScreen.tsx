import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

const OrdensListScreen = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Buscar ID do usuário do armazenamento
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
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
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          console.error('ID do usuário não encontrado no armazenamento.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
        }
      } catch (error) {
        console.error('Falha ao buscar ID do usuário do armazenamento:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário. Por favor, faça login novamente.');
        if (isMounted) {
          setTimeout(() => {
            router.replace('/(login)/login');
          }, 0);
        }
      } finally {
        setIsLoadingUserId(false);
      }
    };

    fetchUserId();
  }, [router, isMounted]);

  // Buscar todas as ordens
  const { 
    data: ordensResponse, 
    isLoading: isLoadingOrdens, 
    error: ordensError,
    refetch 
  } = useOrdersControllerFindAll({
    query: {
      queryKey: ['orders', userId],
      enabled: !!userId && isMounted,
    },
    request: {
      params: { employeeId: userId }
    }
  });

  const ordens = ordensResponse?.data || [];

  // Recarregar quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (isMounted && userId) {
        refetch();
      }
    }, [isMounted, userId, refetch])
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberto': return COLORS.accent;
      case 'em_andamento': return COLORS.secondary;
      case 'interrompido': return COLORS.warning;
      case 'finalizado': return COLORS.success;
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

  const handleNavigateToDetail = (orderId: number) => {
    if (isMounted) {
      router.push({ 
        pathname: '/(app_main)/funcionario/OrdemDetailScreen', 
        params: { orderId } 
      });
    }
  };

  // Lidar com erros da API
  useEffect(() => {
    if (ordensError) {
      console.error('Erro ao buscar ordens:', ordensError);
      Alert.alert('Erro', 'Não foi possível carregar as ordens de serviço.');
    }
  }, [ordensError]);

  if (isLoadingUserId || (isLoadingOrdens && userId)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando ordens de serviço...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Ordens de Serviço</Text>
      </View>

      {ordens.length > 0 ? (
        <FlatList
          data={ordens}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => handleNavigateToDetail(item.id)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>OP-{item.id}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(item.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderDetails}>
                <Text style={styles.orderDetailText}>
                  <Text style={styles.orderDetailLabel}>Produto: </Text>
                  {item.product?.name || 'Não especificado'}
                </Text>
                
                <Text style={styles.orderDetailText}>
                  <Text style={styles.orderDetailLabel}>Quantidade: </Text>
                  {item.quantity || 'Não especificada'}
                </Text>
                
                <Text style={styles.orderDetailText}>
                  <Text style={styles.orderDetailLabel}>Criado em: </Text>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma ordem de serviço encontrada.</Text>
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
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginTop: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  orderDetailLabel: {
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

export default OrdensListScreen;