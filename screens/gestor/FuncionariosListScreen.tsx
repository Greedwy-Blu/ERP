import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useFuncionarioControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

const FuncionariosListScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is a logged-in gestor
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');

        console.log('Token:', token);
        console.log('User Role:', userRole);

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

  // Fetch all employees
  const { 
    data: funcionariosResponse, 
    isLoading: isLoadingFuncionarios, 
    error: funcionariosError, 
    refetch 
  } = useFuncionarioControllerFindAll({
    query: {
      enabled: !isLoadingUserCheck,
      onSuccess: (data) => {
        console.log('Funcionários carregados:', data);
        setRefreshing(false);
      },
      onError: (error) => {
        console.error('Erro ao carregar funcionários:', error);
        setRefreshing(false);
      }
    }
  });

  // Handle different response structures
  const funcionarios = Array.isArray(funcionariosResponse) 
    ? funcionariosResponse 
    : funcionariosResponse?.data 
    ? funcionariosResponse.data 
    : [];

  // Handle API errors
  useEffect(() => {
    if (funcionariosError) {
      console.error('Detalhes do erro:', {
        message: funcionariosError.message,
        response: funcionariosError.response?.data,
        status: funcionariosError.response?.status
      });
      
      Alert.alert(
        'Erro', 
        funcionariosError.response?.data?.message || 
        'Não foi possível carregar a lista de funcionários.'
      );
    }
  }, [funcionariosError]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!isLoadingUserCheck) {
        refetch();
      }
    }, [refetch, isLoadingUserCheck])
  );

  if (isLoadingUserCheck || isLoadingFuncionarios) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando funcionários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciar Funcionários</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/(home)/gestor/funcionariocreatescreen')}
        >
          <Text style={styles.createButtonText}>+ Novo Funcionário</Text>
        </TouchableOpacity>
      </View>

      {funcionarios.length > 0 ? (
        <FlatList
          data={funcionarios}
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
              style={styles.itemCard}
              onPress={() => router.push({ 
                pathname: '/(home)/gestor/funcionariodetailscreen', 
                params: { funcionarioId: item.id }
              })}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.nome}</Text>
                <Text style={styles.itemSubtitle}>Código: {item.code}</Text>
              </View>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemDetailText}>
                  <Text style={styles.itemDetailLabel}>Cargo: </Text>
                  {item.cargo || 'Não especificado'}
                </Text>
                <Text style={styles.itemDetailText}>
                  <Text style={styles.itemDetailLabel}>Salário: </Text>
                  {item.salario ? `R$ ${item.salario.toFixed(2)}` : 'Não especificado'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum funcionário cadastrado.</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/(home)/gestor/funcionariocreatescreen')}
          >
            <Text style={styles.createButtonText}>Cadastrar Primeiro Funcionário</Text>
          </TouchableOpacity>
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
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  itemSubtitle: {
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

export default FuncionariosListScreen;