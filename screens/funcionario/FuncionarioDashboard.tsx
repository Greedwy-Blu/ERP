import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useQuery } from '@tanstack/react-query';
import { useFuncionarioControllerFindOne, useOrdersControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const FuncionarioDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Get user ID from storage
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
          console.error('User ID not found in storage.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user ID from storage:', error);
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

  // Fetch employee data
  const { 
    data: userResponse, 
    isLoading: isLoadingUser, 
    error: userError 
  } = useFuncionarioControllerFindOne(
    userId!, 
    {
      query: {
        queryKey: ['funcionario', userId],
        enabled: !!userId,
      }
    }
  );
  const user = userResponse?.data;

  // Fetch orders assigned to the employee
  const { 
    data: ordensResponse, 
    isLoading: isLoadingOrdens, 
    error: ordensError 
  } = useOrdersControllerFindAll({
    query: {
      queryKey: ['orders', userId],
      enabled: !!userId,
    },
    request: {
      params: { employeeId: userId }
    }
  });
  
  const ordensRecentes = (ordensResponse?.data || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  const menuItems = [
    {
      id: 'perfil',
      title: 'Meu Perfil',
      icon: '👤',
      onPress: () => handleNavigation('/(home)/funcionario/PerfilScreen')
    },
    {
      id: 'ordens',
      title: 'Minhas Ordens',
      icon: '📋',
      onPress: () => handleNavigation('/(home)/funcionario/OrdensListScreen')
    },
    {
      id: 'historico',
      title: 'Histórico',
      icon: '📊',
      onPress: () => handleNavigation('/(home)/funcionario/HistoricoScreen')
    },
     {
      id: 'interromper',
      title: 'Interromper Ordem',
      icon: '⏸️',
      onPress: () => handleNavigation('/(home)/funcionario/motivosinterrupcaoscreen')
    }
  ];

  const handleNavigation = (path: string, params?: any) => {
    if (isMounted) {
      if (params) {
        router.push({ pathname: path, params });
      } else {
        router.push(path);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberto': return COLORS.accent;
      case 'em_andamento': return COLORS.secondary;
      case 'interrompido': return COLORS.warning;
      case 'finalizado': return COLORS.success;
      default: return COLORS.gray;
    }
  };

  // Handle API errors
  useEffect(() => {
    if (userError) {
      console.error('Error fetching user data:', userError);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
    }
    if (ordensError) {
      console.error('Error fetching orders:', ordensError);
    }
  }, [userError, ordensError]);

  if (isLoadingUserId || (isLoadingUser && userId)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando seu painel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.nome || 'Funcionário'}</Text>
        <Text style={styles.subtitle}>Bem-vindo ao seu painel de controle</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Ordens Recentes</Text>
          
          {isLoadingOrdens ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loadingIndicator} />
          ) : ordensRecentes.length > 0 ? (
            ordensRecentes.map(ordem => (
              <TouchableOpacity 
                key={ordem.id}
                style={styles.recentItem}
                onPress={() => handleNavigation(
                  '/(app_main)/funcionario/OrdemDetailScreen', 
                  { orderId: ordem.id }
                )}
              >
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemTitle}>OP-{ordem.id}</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(ordem.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {ordem.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recentItemDesc}>
                  {ordem.product?.name || 'Produto não especificado'}
                  {ordem.quantity ? ` - Quantidade: ${ordem.quantity}` : ''}
                </Text>
                <Text style={styles.recentItemDate}>
                  {new Date(ordem.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma ordem recente encontrada.</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => handleNavigation('/(home)/funcionario/OrdensListScreen')}
          >
            <Text style={styles.viewAllText}>Ver Todas as Ordens</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  loadingIndicator: {
    padding: 20,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
    textAlign: 'center',
  },
  recentSection: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  recentItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingVertical: 12,
    marginBottom: 10,
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  recentItemDesc: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginBottom: 4,
  },
  recentItemDate: {
    fontSize: 12,
    color: COLORS.text?.secondary || '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 10,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.text?.secondary || '#666',
  },
});

export default FuncionarioDashboard;