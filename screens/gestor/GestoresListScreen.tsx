import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '@/constants/cor';
import { useGestaoControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

const GestoresListScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Verificar autenticação e papel do usuário
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
        console.error('Erro ao verificar papel do usuário:', error);
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

  // Buscar todos os gestores
  const { 
    data: gestoresResponse, 
    isLoading: isLoadingGestores, 
    error: gestoresError, 
    refetch 
  } = useGestaoControllerFindAll({
    query: {
      queryKey: ['gestoresList'],
      enabled: initialCheckDone,
      onSuccess: (data) => {
        console.log('Gestores carregados:', data);
      },
      onError: (error) => {
        console.error('Erro ao carregar gestores:', error);
      }
    }
  });

  // Extrair os gestores corretamente da resposta
  const gestores = Array.isArray(gestoresResponse) 
    ? gestoresResponse 
    : gestoresResponse?.data 
    ? gestoresResponse.data 
    : [];

  // Lidar com erros da API
  useEffect(() => {
    if (gestoresError) {
      console.error('Erro ao buscar gestores:', gestoresError);
      Alert.alert('Erro', 'Não foi possível carregar a lista de gestores.');
    }
  }, [gestoresError]);

  // Recarregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (initialCheckDone) {
        refetch();
      }
    }, [initialCheckDone, refetch])
  );

  const renderGestorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => {
        router.push({ 
          pathname: '/(home)/gestor/gestordetailscreen', 
          params: { gestorId: item.id }
        });
      }}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.name || 'Nome não especificado'}</Text>
        <Text style={styles.itemSubtitle}>Código: {item.code || 'Não especificado'}</Text>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemDetailText}>
          <Text style={styles.itemDetailLabel}>Email: </Text>
          {item.email || 'Não especificado'}
        </Text>
        <Text style={styles.itemDetailText}>
          <Text style={styles.itemDetailLabel}>Telefone: </Text>
          {item.phone || 'Não especificado'}
        </Text>
        <Text style={styles.itemDetailText}>
          <Text style={styles.itemDetailLabel}>Setor: </Text>
          {item.department || 'Não especificado'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!initialCheckDone || isLoadingUserCheck || isLoadingGestores) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando gestores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciar Gestores</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/(home)/gestor/gestorcreatescreen')}
        >
          <Text style={styles.createButtonText}>+ Novo Gestor</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={gestores}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={gestores.length === 0 ? styles.emptyContainer : styles.listContent}
        renderItem={renderGestorItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum gestor cadastrado.</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => router.push('/(home)/gestor/gestorcreatescreen')}
            >
              <Text style={styles.addFirstButtonText}>Adicionar Primeiro Gestor</Text>
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

export default GestoresListScreen;