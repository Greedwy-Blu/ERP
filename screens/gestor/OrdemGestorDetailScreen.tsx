import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerFindOne, useOrdersControllerAtualizarStatus } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

const OrdemGestorDetailScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
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
        console.error('Falha ao verificar papel do usuário:', error);
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

  // Buscar detalhes da ordem
  const { 
    data: ordemResponse, 
    isLoading: isLoadingOrdem, 
    error: ordemError, 
    refetch 
  } = useOrdersControllerFindOne(Number(orderId), {
    query: {
      queryKey: ['order', orderId],
      enabled: initialCheckDone && !!orderId,
      onSuccess: (data) => {
        console.log('Detalhes da ordem carregados:', data);
      },
      onError: (error) => {
        console.error('Erro ao carregar ordem:', error);
      }
    }
  });

  // Hook para atualizar status
  const { mutate: atualizarStatus, isLoading: isUpdatingStatus } = useOrdersControllerAtualizarStatus({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Status da ordem atualizado com sucesso.');
        refetch();
      },
      onError: (error) => {
        console.error('Erro ao atualizar status:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível atualizar o status.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  // Extrair os dados da ordem corretamente
  const ordem = ordemResponse?.data || ordemResponse;

  // Função para iniciar a ordem
  const handleStartOrder = () => {
    if (!ordem || !orderId) return;
    
    Alert.alert(
      'Confirmar Início',
      'Deseja iniciar esta ordem de produção?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            atualizarStatus({
              id: Number(orderId),
              data: { status: 'em_andamento' }
            });
          }
        }
      ]
    );
  };

  // Função para interromper a ordem
  const handleInterruptOrder = () => {
    if (!ordem || !orderId) return;
    
    router.push({
      pathname: '/(home)/gestor/ordeminterruptscreen',
      params: { orderId: orderId }
    });
  };

  // Função para finalizar a ordem
  const handleFinishOrder = () => {
    if (!ordem || !orderId) return;
    
    Alert.alert(
      'Confirmar Finalização',
      'Deseja finalizar esta ordem de produção?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            atualizarStatus({
              id: Number(orderId),
              data: { status: 'finalizado' }
            });
          }
        }
      ]
    );
  };

  // Funções auxiliares
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

  // Lidar com erros
  useEffect(() => {
    if (ordemError) {
      console.error('Erro ao buscar ordem:', ordemError);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da ordem.');
    }
  }, [ordemError]);

  // Recarregar dados ao focar na tela
  useFocusEffect(
    useCallback(() => {
      if (initialCheckDone && orderId) {
        refetch();
      }
    }, [initialCheckDone, orderId, refetch])
  );

  if (!initialCheckDone || isLoadingUserCheck || isLoadingOrdem) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando detalhes da ordem...</Text>
      </View>
    );
  }

  if (!ordem) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ordem não encontrada.</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detalhes da Ordem</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>{ordem.orderNumber || `OP-${ordem.id}`}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ordem.status) }]}>
              <Text style={styles.statusText}>{ordem.status.replace('_', ' ')}</Text>
            </View>
          </View>
          
          <View style={styles.orderDetails}>
            <Text style={styles.sectionTitle}>Informações Gerais</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Produto:</Text>
              <Text style={styles.detailValue}>{ordem.product?.name || 'Não especificado'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantidade:</Text>
              <Text style={styles.detailValue}>{ordem.lotQuantity || 'Não especificada'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Funcionário:</Text>
              <Text style={styles.detailValue}>{ordem.funcionarioResposavel?.nome || 'Não atribuído'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Criado em:</Text>
              <Text style={styles.detailValue}>{formatDate(ordem.created_at)}</Text>
            </View>
          </View>
          
          {/* Ações baseadas no status */}
          <View style={styles.actionsContainer}>
            {ordem.status === 'aberto' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={handleStartOrder}
                disabled={isUpdatingStatus || !ordem.funcionarioResposavel}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {!ordem.funcionarioResposavel ? 
                      'Atribua um funcionário primeiro' : 
                      'Iniciar Ordem'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            
            {ordem.status === 'em_andamento' && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.interruptButton]}
                  onPress={handleInterruptOrder}
                  disabled={isUpdatingStatus}
                >
                  <Text style={styles.actionButtonText}>Interromper</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.finishButton]}
                  onPress={handleFinishOrder}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>Finalizar</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
            
            {ordem.status === 'interrompido' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={handleStartOrder}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Retomar Ordem</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error || 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
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
  content: {
    flex: 1,
    padding: 16,
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
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 20,
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
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: '40%',
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: COLORS.secondary || '#4CAF50',
  },
  interruptButton: {
    backgroundColor: COLORS.warning || '#FF9800',
  },
  finishButton: {
    backgroundColor: COLORS.success || '#2196F3',
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default OrdemGestorDetailScreen;