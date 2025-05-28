import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Divider, List, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/cor';
import { useAuth } from '@/hooks/useAuth';
import {
  useOrdersControllerFindOne,
  useOrdersControllerAtualizarStatus,
  useOrdersControllerListMotivosInterrupcao,
  useOrdersControllerCreateMotivoInterrupcao,
} from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OrderStatus = 'aberto' | 'em_andamento' | 'interrompido' | 'finalizado';

interface Order {
  id: number;
  orderNumber: string;
  product?: {
    name?: string;
    code?: string;
  };
  lotQuantity?: number;
  status?: OrderStatus;
  motivoInterrupcao?: {
    descricao?: string;
  };
  funcionarioResposavel?: {
    nome?: string;
  };
  created_at?: string;
}

interface MotivoInterrupcao {
  id: number;
  descricao: string;
}

export default function OrdemInterruptScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { data: authData } = useAuth();

  const [orderId, setOrderId] = useState<number | null>(null);
  const [ordem, setOrdem] = useState<Order | null>(null);
  const [motivoSelecionado, setMotivoSelecionado] = useState<number | null>(null);
  const [showFormNovoMotivo, setShowFormNovoMotivo] = useState(false);
  const [novoMotivo, setNovoMotivo] = useState('');
  const [isCreatingMotivo, setIsCreatingMotivo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Verificar papel do usuário
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');

        if (!token || userRole !== 'gestao') {
          router.replace('/(login)/login');
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Failed to check user role:', error);
        Alert.alert('Erro', 'Falha ao verificar permissões. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserCheck(false);
      }
    };

    checkUserRole();
  }, [router]);

  // Configurar ID da ordem
  useEffect(() => {
    if (params.id && isAuthorized) {
      const id = parseInt(params.id, 10);
      if (!isNaN(id)) {
        setOrderId(id);
      } else {
        Alert.alert('Erro', 'ID da ordem inválido');
        router.back();
      }
    }
  }, [params.id, router, isAuthorized]);

  // Buscar dados da ordem
  const {
    data: ordemResponse,
    isLoading: isLoadingOrdem,
    error: ordemError,
    refetch: refetchOrdem,
  } = useOrdersControllerFindOne(
    { id: orderId! },
    {
      query: {
        enabled: !!orderId && isAuthorized,
        onSuccess: (data) => {
          console.log('Dados da ordem:', data);
          setOrdem(data);
        },
        onError: (err) => {
          console.error('Erro ao buscar ordem:', err);
          Alert.alert(
            'Erro',
            err.response?.data?.message || 'Falha ao carregar dados da ordem.'
          );
        },
      },
    }
  );

  // Busca de Motivos de Interrupção
  const {
    data: motivosResponse,
    isLoading: isLoadingMotivos,
    error: motivosError,
    refetch: refetchMotivos,
  } = useOrdersControllerListMotivosInterrupcao({
    query: {
      enabled: isAuthorized,
      onError: (err) => {
        console.error('Erro ao buscar motivos:', err);
        Alert.alert(
          'Erro',
          err.response?.data?.message || 'Falha ao carregar motivos de interrupção.'
        );
      },
    },
  });

  const motivos = Array.isArray(motivosResponse)
    ? motivosResponse
    : motivosResponse?.data
    ? motivosResponse.data
    : [];

  // Mutações
  const { mutateAsync: atualizarStatusOrdem, isLoading: isUpdating } =
    useOrdersControllerAtualizarStatus();

  const { mutateAsync: criarMotivoInterrupcao } =
    useOrdersControllerCreateMotivoInterrupcao();

  // Função para atualizar dados
  const onRefresh = useCallback(() => {
    if (!isAuthorized) return;
    
    setRefreshing(true);
    Promise.all([refetchOrdem(), refetchMotivos()])
      .catch((err) => {
        console.error('Erro ao atualizar:', err);
        Alert.alert('Erro', 'Falha ao atualizar dados');
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refetchOrdem, refetchMotivos, isAuthorized]);

  // Funções de ação
  const handleInterrupt = async () => {
    if (!motivoSelecionado) {
      Alert.alert('Atenção', 'Selecione um motivo para interromper a ordem.');
      return;
    }

    try {
      await atualizarStatusOrdem({
        id: orderId!,
        data: {
          status: 'interrompido',
          motivoId: motivoSelecionado,
        },
      });

      Alert.alert('Sucesso', 'Ordem interrompida com sucesso!');
      router.back();
    } catch (err: any) {
      console.error('Erro ao interromper:', err);
      Alert.alert(
        'Erro',
        err.response?.data?.message || 'Falha ao interromper a ordem'
      );
    }
  };

  const handleCriarNovoMotivo = async () => {
    if (!novoMotivo.trim()) {
      Alert.alert('Atenção', 'Digite um motivo válido');
      return;
    }

    setIsCreatingMotivo(true);
    try {
      await criarMotivoInterrupcao({
        data: {
          descricao: novoMotivo,
        },
      });

      setNovoMotivo('');
      setShowFormNovoMotivo(false);
      await refetchMotivos();
    } catch (err: any) {
      console.error('Erro ao criar motivo:', err);
      Alert.alert(
        'Erro',
        err.response?.data?.message || 'Falha ao criar novo motivo'
      );
    } finally {
      setIsCreatingMotivo(false);
    }
  };

  const getStatusColor = (status?: OrderStatus) => {
    switch (status) {
      case 'aberto': return COLORS.accent;
      case 'em_andamento': return COLORS.secondary;
      case 'interrompido': return COLORS.warning;
      case 'finalizado': return COLORS.success;
      default: return COLORS.gray;
    }
  };

  const getStatusText = (status?: OrderStatus) => {
    if (!status) return 'Desconhecido';
    const statusMap = {
      aberto: 'Aberto',
      em_andamento: 'Em Andamento',
      interrompido: 'Interrompido',
      finalizado: 'Finalizado',
    };
    return statusMap[status] || status;
  };

  if (isLoadingUserCheck) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Acesso não autorizado</Text>
      </View>
    );
  }

  if (!orderId || ordemError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {ordemError?.response?.data?.message || 'Ordem não encontrada'}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.button}
        >
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Olá, {authData?.gestao?.name || authData?.name || 'Gestor'}
        </Text>
        <Text style={styles.subtitle}>Interromper Ordem #{orderId}</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <Card.Content>
            {isLoadingOrdem ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : ordem ? (
              <>
                <Text style={styles.orderNumber}>Ordem #{ordem.orderNumber}</Text>
                <Divider style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Produto:</Text>
                  <Text style={styles.value}>
                    {ordem.product?.name || 'N/A'} ({ordem.product?.code || 'N/A'})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Quantidade:</Text>
                  <Text style={styles.value}>{ordem.lotQuantity || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Responsável:</Text>
                  <Text style={styles.value}>
                    {ordem.funcionarioResposavel?.nome || 'N/A'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={[styles.value, { color: getStatusColor(ordem.status) }]}>
                    {getStatusText(ordem.status)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Criado em:</Text>
                  <Text style={styles.value}>
                    {ordem.created_at ? new Date(ordem.created_at).toLocaleString() : 'N/A'}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>Dados não disponíveis</Text>
            )}

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Selecione o motivo:</Text>

            {isLoadingMotivos ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <RadioButton.Group
                  onValueChange={(value) => setMotivoSelecionado(parseInt(value, 10))}
                  value={motivoSelecionado?.toString() || ''}
                >
                  {motivos.map((motivo) => (
                    <List.Item
                      key={motivo.id}
                      title={motivo.descricao}
                      left={() => (
                        <RadioButton 
                          value={motivo.id.toString()} 
                          color={COLORS.primary}
                        />
                      )}
                      style={styles.radioItem}
                    />
                  ))}
                </RadioButton.Group>

                <Button
                  mode="text"
                  onPress={() => setShowFormNovoMotivo(true)}
                  style={styles.addMotivoButton}
                >
                  + Novo Motivo
                </Button>

                {showFormNovoMotivo && (
                  <View style={styles.novoMotivoContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Descreva o novo motivo"
                      value={novoMotivo}
                      onChangeText={setNovoMotivo}
                      multiline
                    />
                    <View style={styles.buttonGroup}>
                      <Button
                        mode="contained"
                        onPress={handleCriarNovoMotivo}
                        loading={isCreatingMotivo}
                        style={styles.smallButton}
                      >
                        Salvar
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => setShowFormNovoMotivo(false)}
                        style={styles.smallButton}
                      >
                        Cancelar
                      </Button>
                    </View>
                  </View>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleInterrupt}
          loading={isUpdating}
          disabled={!motivoSelecionado || isUpdating}
          style={styles.actionButton}
          labelStyle={styles.buttonLabel}
        >
          Confirmar Interrupção
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
          labelStyle={styles.buttonLabel}
        >
          Cancelar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.gray,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: COLORS.primary,
  },
  radioItem: {
    paddingVertical: 5,
    paddingHorizontal: 0,
  },
  addMotivoButton: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  novoMotivoContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 80,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  smallButton: {
    minWidth: 100,
  },
  actionButton: {
    marginTop: 10,
    marginBottom: 5,
  },
  cancelButton: {
    marginBottom: 15,
  },
  buttonLabel: {
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});