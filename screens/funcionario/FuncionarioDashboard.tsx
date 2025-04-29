import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '@/constants/colors'; // Assuming colors are defined here
import { useQuery } from '@tanstack/react-query';
import { useFuncionarioControllerFindOne, useOrdersControllerFindAll } from '@/api/generated'; // Adjust path if needed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const FuncionarioDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);

  // Get user ID from storage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('accessToken');
        const userRole = await AsyncStorage.getItem('userRole');

        if (!token || userRole !== 'funcionario') {
          // If no token or role is not funcionario, redirect to login
          router.replace('/(login)/login'); // Adjust route as needed
          return;
        }
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          // Handle case where userId is missing but token exists (should ideally not happen)
          console.error('User ID not found in storage.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          router.replace('/(login)/login'); // Adjust route as needed
        }
      } catch (error) {
        console.error('Failed to fetch user ID from storage:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário. Por favor, faça login novamente.');
        router.replace('/(login)/login'); // Adjust route as needed
      } finally {
        setIsLoadingUserId(false);
      }
    };

    fetchUserId();
  }, [router]);

  // Fetch employee data using the retrieved userId
  const { data: userResponse, isLoading: isLoadingUser, error: userError } = useFuncionarioControllerFindOne(
    userId!, // Pass userId, ensure it's not null
    {
      query: {
        enabled: !!userId, // Only run query when userId is available
      }
    }
  );
  const user = userResponse?.data; // Assuming API returns { data: UserObject }

  // Fetch orders assigned to the employee
  // Assuming the API supports filtering by employeeId via query params
  const { data: ordensResponse, isLoading: isLoadingOrdens, error: ordensError } = useOrdersControllerFindAll({
    query: {
        enabled: !!userId, // Only run query when userId is available
    },
    axios: {
        params: { employeeId: userId } // Pass employeeId as a query parameter
    }
  });
  
  // Assuming API returns { data: Order[] }
  // Sort by creation date and take the first 2
  const ordensRecentes = (ordensResponse?.data || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  const menuItems = [
    {
      id: 'perfil',
      title: 'Meu Perfil',
      icon: '👤',
      onPress: () => router.push('/(home)/PerfilScreen') // Adjust route as needed
    },
    {
      id: 'ordens',
      title: 'Minhas Ordens',
      icon: '📋',
      onPress: () => router.push('/(home)/OrdensListScreen') // Adjust route as needed
    },
    {
      id: 'historico',
      title: 'Histórico',
      icon: '📊',
      onPress: () => router.push('/(home)/HistoricoScreen') // Adjust route as needed
    }
  ];

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
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
      // It might be okay to show the dashboard even if orders fail to load
      // Alert.alert('Erro', 'Não foi possível carregar as ordens de serviço.');
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
        <Text style={styles.greeting}>Olá, {user?.nome || 'Funcionário'}</Text> {/* Adjusted field name based on DTO */} 
        <Text style={styles.subtitle}>Bem-vindo ao seu painel de controle</Text>
      </View>

      <ScrollView style={styles.content}>
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
                // Adjust navigation route and params as needed
                onPress={() => router.push({ pathname: '/(home)/OrdemDetailScreen', params: { orderId: ordem.id }})}
              >
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemTitle}>OP-{ordem.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ordem.status) }]}>
                    <Text style={styles.statusText}>{ordem.status}</Text>
                  </View>
                </View>
                <Text style={styles.recentItemDesc}>
                  {/* Assuming order object has product details nested */} 
                  {ordem.product?.name || 'Produto não especificado'} 
                  {ordem.quantity ? ` - Quantidade: ${ordem.quantity}` : ''}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma ordem recente encontrada.</Text>
          )}

          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(home)/OrdensListScreen')} // Adjust route as needed
          >
            <Text style={styles.viewAllText}>Ver Todas as Ordens</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Add styles here (assuming they are similar to the original file)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Use color from constants
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
    color: COLORS.text?.secondary || '#666', // Use color from constants with fallback
  },
  loadingIndicator: {
    padding: 20,
  },
  header: {
    backgroundColor: COLORS.primary, // Use color from constants
    padding: 20,
    paddingTop: 40, // Adjust as needed for status bar
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white, // Use color from constants
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    width: '30%', // Adjust width as needed for layout
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
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
    color: COLORS.text?.primary || '#333', // Use color from constants with fallback
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
    borderBottomColor: COLORS.lightGray || '#eee', // Use color from constants with fallback
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
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
  emptyText: {
    textAlign: 'center',
    color: COLORS.text?.secondary || '#666',
    padding: 10,
  },
});

export default FuncionarioDashboard;

