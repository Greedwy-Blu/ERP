import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

const OrdensGestorListScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is a logged-in gestor
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');

        if (!token || userRole !== 'gestao') {
          router.replace('/(login)/login');
        }
      } catch (error) {
        console.error('Failed to check user role from storage:', error);
        Alert.alert('Erro', 'Falha ao verificar permissões. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserCheck(false);
      }
    };

    checkUserRole();
  }, [router]);

  // Fetch all orders
  const { 
    data: ordensResponse, 
    isLoading: isLoadingOrdens, 
    error: ordensError, 
    refetch 
  } = useOrdersControllerFindAll({
    query: {
      enabled: !isLoadingUserCheck,
      onSuccess: (data) => {
        console.log('Ordens carregadas:', data);
        setRefreshing(false);
      },
      onError: (error) => {
        console.error('Erro ao carregar ordens:', error);
        setRefreshing(false);
      }
    }
  });

  // Handle different response structures
  const ordens = Array.isArray(ordensResponse) 
    ? ordensResponse 
    : ordensResponse?.data 
    ? ordensResponse.data 
    : [];

  // Handle API errors
  useEffect(() => {
    if (ordensError) {
      console.error('Detalhes do erro:', {
        message: ordensError.message,
        response: ordensError.response?.data,
        status: ordensError.response?.status
      });
      
      Alert.alert(
        'Erro', 
        ordensError.response?.data?.message || 
        'Não foi possível carregar a lista de ordens.'
      );
    }
  }, [ordensError]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isLoadingUserCheck) {
        refetch();
      }
    }, [refetch, isLoadingUserCheck])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'aberto': return COLORS.accent;
      case 'em_andamento': return COLORS.secondary;
      case 'interrompido': return COLORS.warning;
      case 'finalizado': return COLORS.success;
      default: return COLORS.gray;
    }
  };

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

  if (isLoadingUserCheck || isLoadingOrdens) {
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
        <Text style={styles.headerTitle}>Todas as Ordens de Serviço</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/(home)/gestor/ordemcreatescreen')}
        >
          <Text style={styles.createButtonText}>+ Criar Ordem</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ordens}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push({ 
              pathname: '/(home)/gestor/ordemgestordetailscreen', 
              params: { orderId: item.id }
            })}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>{item.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <View style={styles.orderDetails}>
              <Text style={styles.orderDetailText}>
                <Text style={styles.orderDetailLabel}>Produto: </Text>
                {item.product?.name || 'Não especificado'}
              </Text>
              
              <Text style={styles.orderDetailText}>
                <Text style={styles.orderDetailLabel}>Quantidade: </Text>
                {item.lotQuantity || 'Não especificada'}
              </Text>

              <Text style={styles.orderDetailText}>
                <Text style={styles.orderDetailLabel}>Funcionário: </Text>
                {item.funcionarioResposavel?.nome || 'Não atribuído'}
              </Text>
              
              <Text style={styles.orderDetailText}>
                <Text style={styles.orderDetailLabel}>Criado em: </Text>
                {formatDate(item.created_at)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma ordem de serviço encontrada.</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(home)/gestor/ordemcreatescreen')}
            >
              <Text style={styles.createButtonText}>Criar Primeira Ordem</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  createButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.black,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginTop: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  orderDetailLabel: {
    fontWeight: 'bold',
    color: COLORS.black,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default OrdensGestorListScreen;