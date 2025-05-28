import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Divider, List, FAB, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { 
  useOrdersControllerCreateEtapa,
  useOrdersControllerListEtapasByOrder,
  useOrdersControllerFindAll
} from '@/api/generated';
import { COLORS } from '@/constants/cor';

interface Etapa {
  id: number;
  nome: string;
  descricao: string;
  ordemId: number;
}

interface Ordem {
  id: number;
  orderNumber: string;
}

export default function EtapasProducaoScreen() {
  const router = useRouter();
  const { data: authData, isLoading: isLoadingAuth } = useAuth();
  const user = authData?.user;
  const userId = user?.id;

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Ordem | null>(null);

  // Busca todas as ordens
  const { 
    data: ordensResponse, 
    isLoading: isLoadingOrdens, 
    error: ordensError,
    refetch: refetchOrdens
  } = useOrdersControllerFindAll({
    query: {
      queryKey: ['orders', userId],
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('Ordens carregadas:', data);
        // Seleciona a primeira ordem por padrão (ou lógica alternativa)
        if (data && data.length > 0) {
          setSelectedOrder(data[0]);
        }
      },
      onError: (error) => {
        console.error('Erro ao carregar ordens:', error);
      }
    },
  });

  const ordens = ordensResponse?.data || [];

  // Busca etapas da ordem selecionada
  const { 
    data: etapasData, 
    isLoading: isLoadingEtapas,
    refetch: refetchEtapas
  } = useOrdersControllerListEtapasByOrder(
    selectedOrder?.id || 0,
    {
      query: {
        enabled: !!selectedOrder?.id,
        onError: (error) => {
          console.error('Erro ao buscar etapas:', error);
          Alert.alert(
            'Erro', 
            error.response?.data?.message || 'Falha ao carregar etapas da ordem'
          );
        }
      }
    }
  );

  const etapas = etapasData?.data || [];

  const { mutateAsync: createEtapa, isLoading: isCreating } = useOrdersControllerCreateEtapa();

  const isGestor = user?.role === 'gestao';

  const handleSubmit = async () => {
    if (!nome.trim() || !descricao.trim()) {
      Alert.alert('Atenção', 'Todos os campos são obrigatórios.');
      return;
    }

    if (!selectedOrder) {
      Alert.alert('Erro', 'Nenhuma ordem selecionada');
      return;
    }

    setSubmitting(true);
    try {
      await createEtapa({
        data: {
          nome,
          descricao,
          ordemId: selectedOrder.id
        }
      });

      Alert.alert('Sucesso', 'Etapa de produção criada com sucesso!');
      setNome('');
      setDescricao('');
      setShowForm(false);
      refetchEtapas(); // Atualiza a lista após criação
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível criar a etapa. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderChange = (order: Ordem) => {
    setSelectedOrder(order);
    setShowForm(false);
  };

  if (isLoadingAuth || isLoadingOrdens || !userId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
      </View>
    );
  }

  if (!selectedOrder && ordens.length > 0) {
    setSelectedOrder(ordens[0]);
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name || 'Gestor'}</Text>
        <Text style={styles.subtitle}>Etapas de Produção</Text>
      </View>

      {/* Seletor de Ordem */}
      {ordens.length > 1 && (
        <Card style={styles.orderSelector}>
          <Card.Content>
            <Text style={styles.selectorTitle}>Selecione a Ordem:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ordens.map((ordem) => (
                <Button
                  key={ordem.id}
                  mode={selectedOrder?.id === ordem.id ? 'contained' : 'outlined'}
                  onPress={() => handleOrderChange(ordem)}
                  style={styles.orderButton}
                  labelStyle={selectedOrder?.id === ordem.id ? styles.selectedOrderButtonLabel : styles.orderButtonLabel}
                >
                  #{ordem.orderNumber}
                </Button>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>
              Etapas da Ordem #{selectedOrder?.orderNumber || 'N/A'}
            </Text>
            <Divider style={styles.divider} />
            
            {isLoadingEtapas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando etapas...</Text>
              </View>
            ) : etapas.length > 0 ? (
              <List.Section>
                {etapas.map((etapa) => (
                  <List.Item
                    key={etapa.id}
                    title={etapa.nome}
                    description={etapa.descricao}
                    left={() => <List.Icon icon="clipboard-list" color={COLORS.primary} />}
                    style={styles.listItem}
                  />
                ))}
              </List.Section>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma etapa cadastrada para esta ordem</Text>
                {isGestor && (
                  <Button 
                    mode="contained" 
                    onPress={() => setShowForm(true)}
                    style={styles.createButton}
                  >
                    Criar Primeira Etapa
                  </Button>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {isGestor && showForm && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.formTitle}>Adicionar Nova Etapa</Text>
              
              <TextInput
                label="Nome da Etapa"
                value={nome}
                onChangeText={setNome}
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.primary}
                activeOutlineColor={COLORS.primary}
              />
              
              <TextInput
                label="Descrição"
                value={descricao}
                onChangeText={setDescricao}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput]}
                outlineColor={COLORS.primary}
                activeOutlineColor={COLORS.primary}
              />
              
              <View style={styles.buttonGroup}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  loading={submitting}
                  disabled={submitting || !nome.trim() || !descricao.trim()}
                >
                  Salvar Etapa
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowForm(false);
                    setNome('');
                    setDescricao('');
                  }}
                  style={styles.button}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {isGestor && !showForm && etapas.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setShowForm(true)}
          color="white"
          label="Nova Etapa"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  orderSelector: {
    margin: 16,
    marginBottom: 8,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
  },
  orderButton: {
    marginRight: 8,
    borderRadius: 20,
  },
  orderButtonLabel: {
    color: COLORS.primary,
  },
  selectedOrderButtonLabel: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  formCard: {
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  createButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  multilineInput: {
    minHeight: 80,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});