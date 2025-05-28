import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Divider, DataTable, Menu, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { 
  useOrdersControllerFindOne,
  useOrdersControllerListRastreamentosByOrder,
  useOrdersControllerStartTracking,
  useOrdersControllerEndTracking,
  useOrdersControllerGetOrderReport,
  useOrdersControllerListEtapasByOrder,
} from '@/api/generated';
import { COLORS } from '@/constants/cor';

interface Etapa {
  id: number;
  nome: string;
}

interface Rastreamento {
  id: number;
  dataInicio: string;
  dataFim?: string;
  etapa?: {
    nome: string;
  };
  funcionario?: {
    id: number;
    nome: string;
    codigo: string;
  };
  observacao?: string;
  etapaId: number;
}

interface Ordem {
  id: number;
  produto?: {
    nome: string;
  };
  quantidade?: number;
  status: string;
  rastreamentos?: Rastreamento[];
  funcionarioResposavel?: {
    id: number;
    nome: string;
    codigo: string;
  };
}

interface OrderReport {
  tempoTotal: string;
  etapasConcluidas: number;
  produtividade: string;
}

const LoadingIndicator = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  </SafeAreaView>
);

export default function RastreamentoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: authData, isLoading: isLoadingAuth } = useAuth();
  
  const [isValidOrderId, setIsValidOrderId] = useState<boolean | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedEtapa, setSelectedEtapa] = useState<Etapa | null>(null);
  const [observacao, setObservacao] = useState('');
  const [showEtapaMenu, setShowEtapaMenu] = useState(false);
  const [trackingInProgress, setTrackingInProgress] = useState(false);
  const [currentTracking, setCurrentTracking] = useState<Rastreamento | null>(null);
  const [filterText, setFilterText] = useState('');

  const safeNavigateBack = useCallback(async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      if (router.canGoBack()) {
        await router.back();
      } else {
        await router.replace('/(home)/gestor/gestordashboard');
      }
    } finally {
      setIsNavigating(false);
    }
  }, [router]);

  useEffect(() => {
    const checkOrderId = async () => {
      try {
        const orderId = Number(id);
        if (isNaN(orderId)) {
          Alert.alert('Erro', 'ID da ordem inválido');
          setIsValidOrderId(false);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await safeNavigateBack();
        } else {
          setIsValidOrderId(true);
        }
      } catch (error) {
        console.error('Error validating order ID:', error);
        setIsValidOrderId(false);
      }
    };

    checkOrderId();
  }, [id, router, safeNavigateBack]);

  const orderId = Number(id);
  
  if (isValidOrderId === false || isLoadingAuth || isValidOrderId === null) {
    return <LoadingIndicator />;
  }

  // Query hooks
  const { 
    data, 
    isLoading: isLoadingOrdem,
    refetch: refetchOrdem 
  } = useOrdersControllerFindOne(orderId);

  const { 
    data: rastreamentosData, 
    isLoading: isLoadingRastreamentos,
    refetch: refetchRastreamentos 
  } = useOrdersControllerListRastreamentosByOrder(orderId);

  const { 
    data: etapasData,
    isLoading: isLoadingEtapas
  } = useOrdersControllerListEtapasByOrder(orderId);

  // Report query
  const { 
    data: reportData,
    refetch: fetchReport,
    isLoading: isLoadingReport,
    isSuccess: isReportSuccess,
    isError: isReportError,
    error: reportError
  } = useOrdersControllerGetOrderReport(orderId, {
    query: {
      enabled: false
    }
  });

  // Start tracking mutation
  const { 
    mutateAsync: startTracking, 
    isLoading: isStartingTracking,
    isSuccess: isStartTrackingSuccess,
    isError: isStartTrackingError,
    error: startTrackingError
  } = useOrdersControllerStartTracking();

  // End tracking mutation
  const { 
    mutateAsync: endTracking, 
    isLoading: isEndingTracking,
    isSuccess: isEndTrackingSuccess,
    isError: isEndTrackingError,
    error: endTrackingError
  } = useOrdersControllerEndTracking();

  const ordemData = data as Ordem | undefined;
  const funcionarioResponsavel = ordemData?.funcionarioResposavel;

  // Effects for handling side effects
  useEffect(() => {
    if (ordemData) {
      checkTrackingInProgress(ordemData);
    }
  }, [ordemData]);

  useEffect(() => {
    if (isReportSuccess && reportData) {
      Alert.alert(
        'Relatório da Ordem',
        `Tempo total: ${reportData?.tempoTotal || 'N/A'}\nEtapas concluídas: ${reportData?.etapasConcluidas || 'N/A'}\nProdutividade: ${reportData?.produtividade || 'N/A'}`
      );
    }
  }, [isReportSuccess, reportData]);

  useEffect(() => {
    if (isReportError) {
      console.error('Erro ao buscar relatório:', reportError);
      Alert.alert('Erro', 'Não foi possível carregar o relatório da ordem.');
    }
  }, [isReportError, reportError]);

  useEffect(() => {
    if (isStartTrackingSuccess) {
      Alert.alert('Sucesso', 'Rastreamento iniciado com sucesso!');
      setTrackingInProgress(true);
      setSelectedEtapa(null);
      setObservacao('');
      refetchOrdem();
      refetchRastreamentos();
    }
  }, [isStartTrackingSuccess, refetchOrdem, refetchRastreamentos]);

  useEffect(() => {
    if (isStartTrackingError) {
      console.error('Erro ao iniciar rastreamento:', startTrackingError);
      Alert.alert('Erro', 'Não foi possível iniciar o rastreamento. Tente novamente.');
    }
  }, [isStartTrackingError, startTrackingError]);

  useEffect(() => {
    if (isEndTrackingSuccess) {
      Alert.alert('Sucesso', 'Rastreamento finalizado com sucesso!');
      setTrackingInProgress(false);
      setCurrentTracking(null);
      setObservacao('');
      refetchOrdem();
      refetchRastreamentos();
    }
  }, [isEndTrackingSuccess, refetchOrdem, refetchRastreamentos]);

  useEffect(() => {
    if (isEndTrackingError) {
      console.error('Erro ao finalizar rastreamento:', endTrackingError);
      Alert.alert('Erro', 'Não foi possível finalizar o rastreamento. Tente novamente.');
    }
  }, [isEndTrackingError, endTrackingError]);

  const checkTrackingInProgress = (ordem: Ordem) => {
    if (!ordem.rastreamentos) return;
    
    const hasActiveTracking = ordem.rastreamentos.some(r => !r.dataFim);
    setTrackingInProgress(hasActiveTracking);
    
    if (hasActiveTracking) {
      const activeTracking = ordem.rastreamentos.find(r => !r.dataFim);
      setCurrentTracking(activeTracking || null);
    }
  };

  const handleStartTracking = async () => {
    if (!selectedEtapa) {
      Alert.alert('Atenção', 'Selecione uma etapa para iniciar o rastreamento.');
      return;
    }

    if (!funcionarioResponsavel?.codigo) {
      Alert.alert('Erro', 'Funcionário responsável não identificado na ordem.');
      return;
    }

    try {
      await startTracking({
        data: {
          orderId: orderId,
          employeeCode: funcionarioResponsavel.codigo,
          lostQuantity: 0,
          processedQuantity: 0,
        }
      });
    } catch (error) {
      // Error handled in useEffect
    }
  };

  const handleEndTracking = async () => {
    if (!currentTracking?.id || !funcionarioResponsavel?.codigo) {
      Alert.alert('Erro', 'Dados insuficientes para finalizar o rastreamento.');
      return;
    }

    try {
      await endTracking({
        id: currentTracking.id,
        data: {
          ordemId: orderId,
          etapaId: currentTracking.etapaId,
          funcionarioId: funcionarioResponsavel.id,
          observacao: observacao
        }
      });
    } catch (error) {
      // Error handled in useEffect
    }
  };

  const handleViewReport = () => {
    fetchReport();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const filteredRastreamentos = rastreamentosData?.filter((item: Rastreamento) => {
    if (!filterText) return true;
    
    const funcionarioNome = item.funcionario?.nome?.toLowerCase() || '';
    const etapaNome = item.etapa?.nome?.toLowerCase() || '';
    const searchText = filterText.toLowerCase();
    
    return funcionarioNome.includes(searchText) || etapaNome.includes(searchText);
  });

  const etapas = etapasData?.data || [];

  if (isLoadingOrdem) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {authData?.user?.name || 'Gestor'}</Text> 
        <Text style={styles.subtitle}>Painel de Gestão</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Rastreamento - Ordem #{orderId}</Text>
            <Divider style={styles.divider} />
            
            {ordemData && (
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Produto:</Text>
                <Text style={styles.value}>{ordemData.produto?.nome || 'N/A'}</Text>
                
                <Text style={styles.label}>Quantidade:</Text>
                <Text style={styles.value}>{ordemData.quantidade || 0}</Text>
                
                <Text style={styles.label}>Status Atual:</Text>
                <Text style={[styles.value, styles.statusText]}>
                  {ordemData.status === 'em_andamento' ? 'Em Andamento' : 
                   ordemData.status === 'concluido' ? 'Concluído' : 
                   ordemData.status === 'interrompido' ? 'Interrompido' : 
                   ordemData.status === 'pendente' ? 'Pendente' : ordemData.status}
                </Text>
                
                <Text style={styles.label}>Responsável:</Text>
                <Text style={styles.value}>
                  {funcionarioResponsavel?.nome || 'N/A'} ({funcionarioResponsavel?.codigo || 'N/A'})
                </Text>
              </View>
            )}
            
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Ações de Rastreamento:</Text>
            
            <View style={styles.actionContainer}>
              {trackingInProgress ? (
                <>
                  <Text style={styles.trackingInfo}>
                    Rastreamento em andamento: {currentTracking?.etapa?.nome || 'Etapa atual'}
                  </Text>
                  <Button
                    mode="contained"
                    onPress={handleEndTracking}
                    style={styles.actionButton}
                    loading={isEndingTracking}
                    disabled={isEndingTracking}
                    icon="stop-circle"
                  >
                    Finalizar Rastreamento
                  </Button>
                </>
              ) : (
                <>
                  <View style={styles.etapaSelector}>
                    <Text style={styles.etapaLabel}>Selecione a etapa:</Text>
                    <Menu
                      visible={showEtapaMenu}
                      onDismiss={() => setShowEtapaMenu(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setShowEtapaMenu(true)}
                          style={styles.etapaButton}
                        >
                          {selectedEtapa ? selectedEtapa.nome : 'Selecionar Etapa'}
                        </Button>
                      }
                    >
                      {etapas.map((etapa: Etapa) => (
                        <Menu.Item
                          key={etapa.id}
                          onPress={() => {
                            setSelectedEtapa(etapa);
                            setShowEtapaMenu(false);
                          }}
                          title={etapa.nome}
                        />
                      ))}
                    </Menu>
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={handleStartTracking}
                    style={styles.actionButton}
                    loading={isStartingTracking}
                    disabled={isStartingTracking || !selectedEtapa}
                    icon="play-circle"
                  >
                    Iniciar Rastreamento
                  </Button>
                </>
              )}
              
              <Button
                mode="outlined"
                onPress={handleViewReport}
                style={styles.reportButton}
                loading={isLoadingReport}
                disabled={isLoadingReport}
                icon="file-document"
              >
                Ver Relatório
              </Button>
            </View>
            
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Registros de Rastreamento:</Text>
            
            <TextInput
              label="Filtrar por funcionário ou etapa"
              value={filterText}
              onChangeText={setFilterText}
              style={styles.filterInput}
              mode="outlined"
            />
            
            {isLoadingRastreamentos ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loadingRastreamentos} />
            ) : filteredRastreamentos?.length ? (
              <DataTable style={styles.table}>
                <DataTable.Header>
                  <DataTable.Title>Data Início</DataTable.Title>
                  <DataTable.Title>Data Fim</DataTable.Title>
                  <DataTable.Title>Etapa</DataTable.Title>
                  <DataTable.Title>Responsável</DataTable.Title>
                  <DataTable.Title>Observação</DataTable.Title>
                </DataTable.Header>

                {filteredRastreamentos.map((item: Rastreamento, index: number) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>{formatDate(item.dataInicio)}</DataTable.Cell>
                    <DataTable.Cell>{formatDate(item.dataFim) || 'Em andamento'}</DataTable.Cell>
                    <DataTable.Cell>{item.etapa?.nome || 'N/A'}</DataTable.Cell>
                    <DataTable.Cell>{item.funcionario?.nome || 'N/A'}</DataTable.Cell>
                    <DataTable.Cell>{item.observacao || '-'}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <Text style={styles.emptyText}>
                {filterText ? 'Nenhum registro encontrado com o filtro aplicado' : 'Nenhum registro de rastreamento encontrado.'}
              </Text>
            )}
          </Card.Content>
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={safeNavigateBack}
            style={styles.button}
            icon="arrow-left"
            disabled={isNavigating}
          >
            Voltar
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },
  divider: {
    marginVertical: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#64748b',
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
  statusText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  loadingRastreamentos: {
    marginVertical: 24,
  },
  table: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 16,
    color: '#64748b',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    borderColor: COLORS.primary,
  },
  actionContainer: {
    marginBottom: 16,
  },
  etapaSelector: {
    marginBottom: 16,
  },
  etapaLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#64748b',
  },
  etapaButton: {
    marginBottom: 8,
    borderColor: COLORS.primary,
  },
  actionButton: {
    marginBottom: 8,
    backgroundColor: COLORS.primary,
  },
  reportButton: {
    borderColor: COLORS.primary,
  },
  trackingInfo: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  filterInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primary,
  },
});