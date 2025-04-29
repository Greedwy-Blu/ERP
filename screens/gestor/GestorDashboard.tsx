import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/colors'; // Adjust path if needed
import { useDependency } from '@/context/DependencyContext'; // Assuming DependencyContext exists and is set up
import { useQuery } from '@tanstack/react-query';
import { useGestaoControllerFindOne, useOrdersControllerFindAll } from '@/api/generated'; // Adjust path if needed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const GestorDashboard = () => {
  const router = useRouter();
  const { checkFeatureUnlocked } = useDependency(); // Use dependency hook
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);

  // Get user ID from storage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('accessToken');
        const userRole = await AsyncStorage.getItem('userRole');

        if (!token || userRole !== 'gestor') {
          // If no token or role is not gestor, redirect to login
          router.replace('/(login)/login'); // Adjust route as needed
          return;
        }
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
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

  // Fetch manager data using the retrieved userId
  const { data: gestorResponse, isLoading: isLoadingGestor, error: gestorError } = useGestaoControllerFindOne(
    userId!, // Pass userId, ensure it's not null
    {
      query: {
        enabled: !!userId, // Only run query when userId is available
      }
    }
  );
  const gestor = gestorResponse?.data; // Assuming API returns { data: GestorObject }

  // Fetch all orders (for recent orders section)
  // Assuming the API returns orders sorted by creation date or we sort them client-side
  const { data: ordensResponse, isLoading: isLoadingOrdens, error: ordensError } = useOrdersControllerFindAll({
    query: {
        enabled: !!userId, // Only run query when userId is available
    },
    // Add sorting/limiting params if API supports it
    // axios: { params: { _sort: 'createdAt:DESC', _limit: 3 } }
  });

  // Sort by creation date (most recent first) and take the top 3
  const ordensRecentes = (ordensResponse?.data || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleNavigation = (screen, featureName = null, prerequisiteMessage = null) => {
    // Check feature unlock status if applicable
    // The original code had a checkFeatureUnlocked, keeping it similar
    // This might need adjustment based on how DependencyContext is implemented
    if (featureName && typeof checkFeatureUnlocked === 'function' && !checkFeatureUnlocked(featureName)) {
      Alert.alert(
        'Ação Bloqueada',
        prerequisiteMessage || `Funcionalidade ${featureName} requer configurações prévias.`,
        [{ text: 'OK' }]
      );
    } else {
      // Use expo-router for navigation
      router.push(screen); // Pass the route path directly
    }
  };

  const menuItems = [
    {
      id: 'ordens',
      title: 'Ordens de Serviço',
      icon: '📋',
      // Adjust route path according to your expo-router setup
      onPress: () => handleNavigation('/(home)/OrdensGestorListScreen') 
    },
    {
      id: 'funcionarios',
      title: 'Funcionários',
      icon: '👥',
      // Adjust route path and feature check logic as needed
      onPress: () => handleNavigation('/(home)/FuncionariosListScreen', 'criarFuncionario', 'É necessário criar setores antes de gerenciar funcionários.')
    },
    {
      id: 'setores',
      title: 'Setores',
      icon: '🏢',
      // Adjust route path and feature check logic as needed
      onPress: () => handleNavigation('/(home)/SetoresListScreen', 'criarSetor')
    },
    {
      id: 'produtos',
      title: 'Produtos',
      icon: '📦',
      // Adjust route path and feature check logic as needed
      onPress: () => handleNavigation('/(home)/ProdutosListScreen', 'criarProduto')
    },
    {
      id: 'gestores',
      title: 'Gestores',
      icon: '👤',
      // Adjust route path as needed
      onPress: () => handleNavigation('/(home)/GestoresListScreen')
    },
    {
      id: 'historico',
      title: 'Histórico Geral',
      icon: '📊',
      // Adjust route path as needed
      onPress: () => handleNavigation('/(home)/HistoricoListScreen') 
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
    if (gestorError) {
      console.error('Error fetching manager data:', gestorError);
      Alert.alert('Erro', 'Não foi possível carregar os dados do gestor.');
    }
    if (ordensError) {
      console.error('Error fetching orders:', ordensError);
      // Decide if you want to alert the user or just log the error
      // Alert.alert('Erro', 'Não foi possível carregar as ordens recentes.');
    }
  }, [gestorError, ordensError]);

  if (isLoadingUserId || (isLoadingGestor && userId)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando painel de gestão...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Adjust field name based on actual Gestor data structure from API */}
        <Text style={styles.greeting}>Olá, {gestor?.nome || 'Gestor'}</Text> 
        <Text style={styles.subtitle}>Painel de Gestão</Text>
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
                // Adjust route path and params for expo-router
                onPress={() => router.push({ pathname: '/(home)/OrdemGestorDetailScreen', params: { orderId: ordem.id }})}
              >
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemTitle}>OP-{ordem.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ordem.status) }]}>
                    <Text style={styles.statusText}>{ordem.status}</Text>
                  </View>
                </View>
                <Text style={styles.recentItemDesc}>
                  {/* Adjust field names based on actual Order data structure */} 
                  {ordem.product?.name || 'Produto não especificado'} 
                  {ordem.quantity ? ` - Qtd: ${ordem.quantity}` : ''}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma ordem recente encontrada.</Text>
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            // Adjust route path for expo-router
            onPress={() => handleNavigation('/(home)/OrdensGestorListScreen')}
          >
            <Text style={styles.viewAllText}>Ver Todas as Ordens</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.createButton}
          // Adjust route path and feature check logic as needed
          onPress={() => handleNavigation(
            '/(home)/OrdemCreateScreen', 
            'criarOrdem', 
            'Para criar uma Ordem de Serviço, é necessário cadastrar Setores, Funcionários e Produtos primeiro.'
          )}
        >
          <Text style={styles.createButtonText}>+ Criar Nova Ordem de Serviço</Text>
        </TouchableOpacity>
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
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.text?.secondary || '#666',
    padding: 10,
  },
});

export default GestorDashboard;

