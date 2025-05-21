import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerFindOne, useOrdersControllerAtualizarStatus } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OrdemDetailScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Buscar ID do usuário do armazenamento
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
          console.error('ID do usuário não encontrado no armazenamento.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
        }
      } catch (error) {
        console.error('Falha ao buscar ID do usuário do armazenamento:', error);
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

  // Buscar detalhes da ordem
  const { 
    data: ordemResponse, 
    isLoading: isLoadingOrdem, 
    error: ordemError,
    refetch 
  } = useOrdersControllerFindOne(
    Number(orderId),
    {
      query: {
        queryKey: ['order', orderId],
        enabled: !!orderId && !isLoadingUserId && isMounted,
      }
    }
  );

  const ordem = ordemResponse?.data;

  // Hook para atualizar o status da ordem
  const { mutate: atualizarStatus, isLoading: isUpdatingStatus } = useOrdersControllerAtualizarStatus({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Status da ordem atualizado com sucesso.');
        refetch();
      },
      onError: (error) => {
        console.error('Erro ao atualizar status da ordem:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível atualizar o status da ordem.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  const handleStartOrder = () => {
    if (!ordem || !orderId) return;
    
    atualizarStatus({
      id: Number(orderId),
      data: {
        status: 'em_andamento',
        funcionarioId: userId
      }
    });
  };

  const handleInterruptOrder = () => {
    if (!ordem || !orderId || !isMounted) return;
    
    setTimeout(() => {
      router.push({
        pathname: '/(app_main)/funcionario/OrdemUpdateStatusScreen',
        params: { orderId: orderId.toString(), action: 'interrupt' }
      });
    }, 0);
  };

  const handleFinishOrder = () => {
    if (!ordem || !orderId) return;
    
    atualizarStatus({
      id: Number(orderId),
      data: {
        status: 'finalizado'
      }
    });
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
    if (ordemError) {
      console.error('Erro ao buscar detalhes da ordem:', ordemError);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da ordem de serviço.');
    }
  }, [ordemError]);

  const handleBack = () => {
    if (isMounted) {
      router.back();
    }
  };

  if (isLoadingUserId || isLoadingOrdem) {
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
        <Text style={styles.errorText}>Ordem não encontrada ou você não tem permissão para visualizá-la.</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
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

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>OP-{ordem.id}</Text>
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
              <Text style={styles.detailValue}>{ordem.quantity || 'Não especificada'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Destino Final:</Text>
              <Text style={styles.detailValue}>{ordem.finalDestination || 'Não especificado'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Criado em:</Text>
              <Text style={styles.detailValue}>{formatDate(ordem.createdAt)}</Text>
            </View>
            
            {ordem.updatedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Atualizado em:</Text>
                <Text style={styles.detailValue}>{formatDate(ordem.updatedAt)}</Text>
              </View>
            )}
          </View>
          
          {ordem.etapas && ordem.etapas.length > 0 && (
            <View style={styles.etapasSection}>
              <Text style={styles.sectionTitle}>Etapas</Text>
              
              {ordem.etapas.map((etapa, index) => (
                <View key={etapa.id} style={styles.etapaItem}>
                  <View style={styles.etapaHeader}>
                    <Text style={styles.etapaTitle}>{index + 1}. {etapa.nome}</Text>
                    <View style={[styles.etapaStatusBadge, { backgroundColor: getStatusColor(etapa.status) }]}>
                      <Text style={styles.etapaStatusText}>{etapa.status.replace('_', ' ')}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.etapaDetails}>
                    <Text style={styles.etapaDetailText}>
                      <Text style={styles.etapaDetailLabel}>Funcionário: </Text>
                      {etapa.funcionario?.nome || 'Não atribuído'}
                    </Text>
                    
                    {etapa.startedAt && (
                      <Text style={styles.etapaDetailText}>
                        <Text style={styles.etapaDetailLabel}>Iniciado em: </Text>
                        {formatDate(etapa.startedAt)}
                      </Text>
                    )}
                    
                    {etapa.finishedAt && (
                      <Text style={styles.etapaDetailText}>
                        <Text style={styles.etapaDetailLabel}>Finalizado em: </Text>
                        {formatDate(etapa.finishedAt)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.actionsContainer}>
            {ordem.status === 'aberto' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={handleStartOrder}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Iniciar Ordem</Text>
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
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
    minWidth: 100,
    alignItems: 'center',
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
    fontWeight: '600',
    color: COLORS.text?.primary || '#333',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
  },
  etapasSection: {
    marginBottom: 20,
  },
  etapaItem: {
    backgroundColor: COLORS.lightGray || '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  etapaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  etapaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  etapaStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  etapaStatusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  etapaDetails: {
    marginTop: 4,
  },
  etapaDetailText: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  etapaDetailLabel: {
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
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

export default OrdemDetailScreen;