import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { DependencyContext } from '@/context/DependencyContext';
import { useQuery } from '@tanstack/react-query';
import { useGestaoControllerFindOne, useOrdersControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, RelativePathString } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface DependencyContextType {
  checkFeatureUnlocked?: (featureName: string) => boolean;
}

const GestorDashboard = () => {
  const router = useRouter();
  const dependencyContext = useContext(DependencyContext) as DependencyContextType;
  const { checkFeatureUnlocked } = dependencyContext || {};
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { data, isLoading: isLoadingAuth } = useAuth();

  // Get user ID from storage and validate session
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (!data?.gestao) {
          throw new Error('Gestão data not available');
        }

        const storedUserId = data.gestao.id;
        const token = await AsyncStorage.getItem('access_token');
        const userRole = data.gestao.role;

        if (!token || userRole !== 'gestao') {
          setInitialCheckDone(true);
          setTimeout(() => router.replace('/(login)/login' as RelativePathString), 0);
          return;
        }
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId.toString(), 10));
        } else {
          console.error('User ID not found in storage.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          setInitialCheckDone(true);
          setTimeout(() => router.replace('/(login)/login' as RelativePathString), 0);
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário. Por favor, faça login novamente.');
        setInitialCheckDone(true);
        setTimeout(() => router.replace('/(login)/login' as RelativePathString), 0);
      } finally {
        setIsLoadingUserId(false);
        setInitialCheckDone(true);
      }
    };

    if (data) {
      fetchUserId();
    }
  }, [data, router]);

  // Fetch manager data
  const { 
    data: gestorResponse, 
    isLoading: isLoadingGestor, 
    error: gestorError 
  } = useGestaoControllerFindOne(userId!, {
    query: {
      queryKey: ['gestao', userId],
      enabled: !!userId,
    }
  });

  // Fetch all orders
  const { 
    data: ordensResponse, 
    isLoading: isLoadingOrdens, 
    error: ordensError 
  } = useOrdersControllerFindAll({
    query: {
      queryKey: ['orders', userId],
      enabled: !!userId,
    },
  });

  // Handle navigation with feature check
  const handleNavigation = (
    screen: RelativePathString,
    featureName?: string,
    prerequisiteMessage?: string
  ) => {
    if (featureName && checkFeatureUnlocked && !checkFeatureUnlocked(featureName)) {
      Alert.alert(
        'Ação Bloqueada',
        prerequisiteMessage || `Funcionalidade ${featureName} requer configurações prévias.`,
        [{ text: 'OK' }]
      );
    } else {
      router.replace(screen);
      console.log(`Navigating to ${screen}`);
      
      console.log(`Navigating to ${router}`);
    }
  };

  // Recent orders sorted by date
  const ordensRecentes = (ordensResponse?.data || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Menu items configuration
  const menuItems = [
    {
      id: 'ordens',
      title: 'Ordens de Serviço',
      icon: '📋',
      onPress: () => handleNavigation('/(home)/gestor/ordensgestorlistscreen' as RelativePathString) 
    },
    {
      id: 'funcionarios',
      title: 'Funcionários',
      icon: '👥',
      onPress: () => handleNavigation(
        '/(home)/gestor/funcionarioslistscreen' as RelativePathString
      )
    },
    {
      id: 'setores',
      title: 'Setores',
      icon: '🏢',
      onPress: () => handleNavigation(
        '/(home)/gestor/setoreslistscreen' as RelativePathString
      )
    },
    {
      id: 'produtos',
      title: 'Produtos',
      icon: '📦',
      onPress: () => handleNavigation(
        '/(home)/gestor/produtoslistscreen' as RelativePathString
      )
    },
    {
      id: 'gestores',
      title: 'Gestores',
      icon: '👤',
      onPress: () => handleNavigation(
        '/(home)/gestor/gestoreslistscreen' as RelativePathString
      )
    },
    {
      id: 'historico',
      title: 'Histórico Geral',
      icon: '📊',
      onPress: () => handleNavigation('/(home)/gestor/historicolistscreen' as RelativePathString) 
    }
  ];

  // Get status color for orders
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
    if (gestorError) {
      console.error('Error fetching manager data:', gestorError);
      Alert.alert('Erro', 'Não foi possível carregar os dados do gestor.');
    }
    if (ordensError) {
      console.error('Error fetching orders:', ordensError);
    }
  }, [gestorError, ordensError]);

  // Loading state
  if (!initialCheckDone || isLoadingUserId || isLoadingAuth || (isLoadingGestor && userId)) {
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
        <Text style={styles.greeting}>Olá, {gestorResponse?.nome || 'Gestor'}</Text> 
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
                onPress={() => router.push({ 
                  pathname: '/(home)/gestor/ordemgestordetailscreen' as RelativePathString,
                  params: { orderId: ordem.id.toString() }
                })}
              >
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemTitle}>OP-{ordem.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ordem.status) }]}>
                    <Text style={styles.statusText}>{ordem.status}</Text>
                  </View>
                </View>
                <Text style={styles.recentItemDesc}>
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
            onPress={() => handleNavigation('/(home)/ordensgestorlistscreen' as RelativePathString)}
          >
            <Text style={styles.viewAllText}>Ver Todas as Ordens</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => handleNavigation(
            '/(home)/gestor/ordemcreatescreen' as RelativePathString, 
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