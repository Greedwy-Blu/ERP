import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const OrdensGestorListScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check user authentication and role
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');

        if (!token || userRole !== 'gestao') {
          setInitialCheckDone(true);
          setTimeout(() => router.replace('/(login)/login'), 0);
          return;
        }
      } catch (error) {
        console.error('Failed to check user role:', error);
        Alert.alert('Erro', 'Falha ao verificar permissões. Por favor, faça login novamente.');
        setInitialCheckDone(true);
        setTimeout(() => router.replace('/(login)/login'), 0);
      } finally {
        setIsLoadingUserCheck(false);
        setInitialCheckDone(true);
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
      queryKey: ['orders'],
      enabled: initialCheckDone,
    }
  });

  const ordens = ordensResponse?.data || [];

  // Helper functions
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

  // Handle API errors
  useEffect(() => {
    if (ordensError) {
      console.error('Error fetching orders:', ordensError);
      Alert.alert('Erro', 'Não foi possível carregar as ordens de serviço.');
    }
  }, [ordensError]);

  // Refetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (initialCheckDone) {
        refetch();
      }
    }, [initialCheckDone, refetch])
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({ 
        pathname: '/(home)/gestor/ordemgestordetailscreen', 
        params: { orderId: item.id }
      })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>OP-{item.id}</Text>
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
          {item.quantity || 'Não especificada'}
        </Text>

        <Text style={styles.orderDetailText}>
          <Text style={styles.orderDetailLabel}>Funcionário: </Text>
          {item.funcionario?.nome || 'Não atribuído'}
        </Text>
        
        <Text style={styles.orderDetailText}>
          <Text style={styles.orderDetailLabel}>Criado em: </Text>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!initialCheckDone || isLoadingUserCheck || isLoadingOrdens) {
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
        renderItem={renderOrderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma ordem de serviço encontrada.</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => router.push('/(home)/gestor/ordemcreatescreen')}
            >
              <Text style={styles.addFirstButtonText}>Criar Primeira Ordem</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  createButton: {
    backgroundColor: COLORS.accent || '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    marginTop: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginBottom: 4,
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
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrdensGestorListScreen;