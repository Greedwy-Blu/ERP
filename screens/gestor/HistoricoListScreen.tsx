import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerListHistoricoProducao } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

const HistoricoListScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [parsedOrderId, setParsedOrderId] = useState<number | null>(null);

  // Verificar autenticação do usuário e parsear orderId
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        if (!token) {
          setInitialCheckDone(true);
          setTimeout(() => router.replace('/(login)/login'), 0);
          return;
        }

        // Parsear orderId se existir
        if (orderId) {
          const id = Number(orderId);
          if (!isNaN(id)) {
            setParsedOrderId(id);
          } else {
            Alert.alert('Erro', 'ID da ordem inválido');
          }
        }
      } catch (error) {
        console.error('Falha ao verificar autenticação:', error);
        Alert.alert('Erro', 'Falha ao verificar autenticação. Por favor, faça login novamente.');
        setInitialCheckDone(true);
        setTimeout(() => router.replace('/(login)/login'), 0);
      } finally {
        setIsLoadingUserCheck(false);
        setInitialCheckDone(true);
      }
    };

    checkUserAuth();
  }, [router, orderId]);

  // Buscar histórico de produção
  const { 
    data: historicoResponse, 
    isLoading: isLoadingHistorico, 
    error: historicoError, 
    refetch 
  } = useOrdersControllerListHistoricoProducao(
    parsedOrderId || 0, // Usar parsedOrderId ou 0 se não existir
    {
      query: {
        queryKey: ['historicoProducao', parsedOrderId],
        enabled: initialCheckDone && (parsedOrderId !== null || orderId === undefined),
        onSuccess: (data) => {
          console.log('Histórico carregado:', data);
        },
        onError: (error) => {
          console.error('Erro ao carregar histórico:', error);
        }
      }
    }
  );

  const historicos = Array.isArray(historicoResponse) 
    ? historicoResponse 
    : historicoResponse?.data 
    ? historicoResponse.data 
    : [];

  // Função para formatar a data
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
      console.error('Erro ao buscar histórico de produção:', {
        message: historicoError.message,
        response: historicoError.response?.data,
        status: historicoError.response?.status
      });
      Alert.alert(
        'Erro', 
        historicoError.response?.data?.message || 
        'Não foi possível carregar o histórico de produção.'
      );
    }
  }, [historicoError]);

  // Recarregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (initialCheckDone) {
        refetch();
      }
    }, [initialCheckDone, refetch])
  );

  const renderHistoricoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>
          {item.tipo === 'status_change' ? 'Alteração de Status' : 
           item.tipo === 'etapa_start' ? 'Início de Etapa' : 
           item.tipo === 'etapa_end' ? 'Finalização de Etapa' : 
           'Registro de Produção'}
        </Text>
        <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <View style={styles.itemDetails}>
        {item.ordem && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Ordem ID: </Text>
            {item.ordem.id}
          </Text>
        )}
        
        {item.ordem?.orderNumber && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Número: </Text>
            {item.ordem.orderNumber}
          </Text>
        )}
        
        {item.funcionario && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Funcionário: </Text>
            {item.funcionario.nome}
          </Text>
        )}
        
        {item.etapa && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Etapa: </Text>
            {item.etapa.nome}
          </Text>
        )}
        
        {item.statusAnterior && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Status Anterior: </Text>
            {item.statusAnterior}
          </Text>
        )}
        
        {item.statusNovo && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Novo Status: </Text>
            {item.statusNovo}
          </Text>
        )}
        
        {item.motivoInterrupcao && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Motivo: </Text>
            {item.motivoInterrupcao.descricao}
          </Text>
        )}
        
        {item.observacoes && (
          <Text style={styles.itemDetailText}>
            <Text style={styles.itemDetailLabel}>Observações: </Text>
            {item.observacoes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!initialCheckDone || isLoadingUserCheck || isLoadingHistorico) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando histórico de produção...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {parsedOrderId ? `Histórico da Ordem #${parsedOrderId}` : 'Histórico Geral de Produção'}
        </Text>
      </View>

      <FlatList
        data={historicos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={renderHistoricoItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum registro de histórico encontrado.</Text>
            {!parsedOrderId && (
              <Text style={styles.emptyHint}>
                Selecione uma ordem específica para ver seu histórico
              </Text>
            )}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  itemDate: {
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

export default HistoricoListScreen;