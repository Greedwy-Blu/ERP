import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useOrdersControllerFindOne, useOrdersControllerAtualizarStatus, useOrdersControllerListMotivosInterrupcao, useOrdersControllerCreateEtapa } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OrdemGestorDetailScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);

  // Verificar se o usuário é um gestor logado
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userRole = await AsyncStorage.getItem('userRole');

        if (!token || userRole !== 'gestor') {
          // Se não houver token ou o papel não for gestor, redirecionar para login
          router.replace('/(login)/login');
        }
      } catch (error) {
        console.error('Falha ao verificar papel do usuário no armazenamento:', error);
        Alert.alert('Erro', 'Falha ao verificar permissões. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserCheck(false);
      }
    };

    checkUserRole();
  }, [router]);

  // Buscar detalhes da ordem usando o hook gerado pelo Orval
  const { data: ordemResponse, isLoading: isLoadingOrdem, error: ordemError, refetch } = useOrdersControllerFindOne(
    Number(orderId),
    {
      query: {
        enabled: !isLoadingUserCheck && !!orderId, // Só executar a consulta quando o orderId estiver disponível
      }
    }
  );

  // Assumindo que a API retorna { data: Order }
  const ordem = ordemResponse?.data;

  // Buscar motivos de interrupção para uso posterior
  const { data: motivosResponse, isLoading: isLoadingMotivos } = useOrdersControllerListMotivosInterrupcao({
    query: {
      enabled: !isLoadingUserCheck, // Só executar a consulta após a verificação do usuário
    }
  });
  const motivos = motivosResponse?.data || [];

  // Hook para atualizar o status da ordem
  const { mutate: atualizarStatus, isLoading: isUpdatingStatus } = useOrdersControllerAtualizarStatus({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Status da ordem atualizado com sucesso.');
        refetch(); // Recarregar os dados da ordem
      },
      onError: (error) => {
        console.error('Erro ao atualizar status da ordem:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o status da ordem.');
      }
    }
  });

  // Hook para criar uma nova etapa
  const { mutate: criarEtapa, isLoading: isCreatingEtapa } = useOrdersControllerCreateEtapa({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Nova etapa criada com sucesso.');
        refetch(); // Recarregar os dados da ordem
      },
      onError: (error) => {
        console.error('Erro ao criar nova etapa:', error);
        Alert.alert('Erro', 'Não foi possível criar a nova etapa.');
      }
    }
  });

  // Função para iniciar uma ordem
  const handleStartOrder = () => {
    if (!ordem || !orderId) return;
    
    atualizarStatus({
      id: Number(orderId),
      data: {
        status: 'em_andamento'
      }
    });
  };

  // Função para interromper uma ordem (redireciona para tela de interrupção)
  const handleInterruptOrder = () => {
    if (!ordem || !orderId) return;
    
    router.push({
      pathname: '/(home)/OrdemUpdateStatusScreen',
      params: { orderId: orderId, action: 'interrupt' }
    });
  };

  // Função para finalizar uma ordem
  const handleFinishOrder = () => {
    if (!ordem || !orderId) return;
    
    atualizarStatus({
      id: Number(orderId),
      data: {
        status: 'finalizado'
      }
    });
  };

  // Função para adicionar uma nova etapa
  const handleAddEtapa = () => {
    if (!ordem || !orderId) return;
    
    router.push({
      pathname: '/(home)/OrdemFillScreen',
      params: { orderId: orderId, action: 'add_etapa' }
    });
  };

  // Função para obter a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'aberto': return COLORS.accent;
      case 'em_andamento': return COLORS.secondary;
      case 'interrompido': return COLORS.warning;
      case 'finalizado': return COLORS.success;
      default: return COLORS.gray;
    }
  };

  // Função para formatar a data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Lidar com erros da API
  useEffect(() => {
    if (ordemError) {
      console.error('Erro ao buscar detalhes da ordem:', ordemError);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da ordem de serviço.');
    }
  }, [ordemError]);

  // Recarregar dados quando a tela receber foco
  useEffect(() => {
    const unsubscribe = router.addListener('focus', () => {
      if (!isLoadingUserCheck && orderId) {
        refetch();
      }
    });

    return unsubscribe;
  }, [router, refetch, isLoadingUserCheck, orderId]);

  if (isLoadingUserCheck || isLoadingOrdem) {
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
            <Text style={styles.orderTitle}>OP-{ordem.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ordem.status) }]}>
              <Text style={styles.statusText}>{ordem.status}</Text>
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
              <Text style={styles.detailLabel}>Funcionário:</Text>
              <Text style={styles.detailValue}>{ordem.funcionario?.nome || 'Não atribuído'}</Text>
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
                      <Text style={styles.etapaStatusText}>{etapa.status}</Text>
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
                  
                  {/* Botões de ação para etapas (apenas para gestor) */}
                  <View style={styles.etapaActions}>
                    {etapa.status === 'aberto' && (
                      <TouchableOpacity 
                        style={[styles.etapaActionButton, styles.startButton]}
                        onPress={() => {
                          // Implementar lógica para iniciar etapa
                          Alert.alert('Iniciar Etapa', 'Deseja iniciar esta etapa?', [
                            { text: 'Cancelar', style: 'cancel' },
                            { 
                              text: 'Iniciar', 
                              onPress: () => {
                                // Chamar API para iniciar etapa
                                // Exemplo: iniciarEtapa({ id: etapa.id })
                              } 
                            }
                          ]);
                        }}
                      >
                        <Text style={styles.etapaActionButtonText}>Iniciar</Text>
                      </TouchableOpacity>
                    )}
                    
                    {etapa.status === 'em_andamento' && (
                      <TouchableOpacity 
                        style={[styles.etapaActionButton, styles.finishButton]}
                        onPress={() => {
                          // Implementar lógica para finalizar etapa
                          Alert.alert('Finalizar Etapa', 'Deseja finalizar esta etapa?', [
                            { text: 'Cancelar', style: 'cancel' },
                            { 
                              text: 'Finalizar', 
                              onPress: () => {
                                // Chamar API para finalizar etapa
                                // Exemplo: finalizarEtapa({ id: etapa.id })
                              } 
                            }
                          ]);
                        }}
                      >
                        <Text style={styles.etapaActionButtonText}>Finalizar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              
              {/* Botão para adicionar nova etapa */}
              <TouchableOpacity 
                style={styles.addEtapaButton}
                onPress={handleAddEtapa}
                disabled={isCreatingEtapa || ordem.status === 'finalizado'}
              >
                {isCreatingEtapa ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.addEtapaButtonText}>+ Adicionar Nova Etapa</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          {/* Botões de ação baseados no status atual */}
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
          
          {/* Botão para ver histórico detalhado */}
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => router.push({ pathname: '/(home)/HistoricoListScreen', params: { orderId: orderId }})}
          >
            <Text style={styles.historyButtonText}>Ver Histórico Detalhado</Text>
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
  },
  etapaStatusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  etapaDetails: {
    marginTop: 4,
    marginBottom: 10,
  },
  etapaDetailText: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    marginBottom: 4,
  },
  etapaDetailLabel: {
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
  },
  etapaActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  etapaActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  etapaActionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  addEtapaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addEtapaButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 15,
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
  historyButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  historyButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default OrdemGestorDetailScreen;
