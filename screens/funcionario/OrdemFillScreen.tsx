import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useOrdersControllerCreateEtapa, useOrdersControllerAtualizarStatus, useOrdersControllerAddHistorico } from '@/api/generated'; // Ajustado para usar hooks relevantes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OrdemFillScreen = () => {
  const router = useRouter();
  const { orderId, action, etapaId } = useLocalSearchParams(); // action: 'add_etapa', 'interrupt'
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);

  // Estados para formulário
  const [nomeEtapa, setNomeEtapa] = useState(''); // Para 'add_etapa'
  const [motivoInterrupcao, setMotivoInterrupcao] = useState(''); // Para 'interrupt'
  const [observacoes, setObservacoes] = useState('');

  // Verificar autenticação e buscar ID do funcionário
  useEffect(() => {
    const checkAuthAndFetchId = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const storedFuncionarioId = await AsyncStorage.getItem('userId'); // Assumindo que userId é o ID do funcionário

        if (!token || !storedFuncionarioId) {
          router.replace('/(login)/login');
          return;
        }
        setFuncionarioId(parseInt(storedFuncionarioId, 10));
      } catch (error) {
        console.error('Falha ao verificar autenticação ou buscar ID:', error);
        Alert.alert('Erro', 'Falha ao carregar dados. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserCheck(false);
      }
    };
    checkAuthAndFetchId();
  }, [router]);

  // Hook para criar etapa
  const { mutate: criarEtapa, isLoading: isCreatingEtapa } = useOrdersControllerCreateEtapa({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Nova etapa criada com sucesso.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (error) => {
        console.error('Erro ao criar etapa:', error);
        Alert.alert('Erro', 'Não foi possível criar a nova etapa.');
      }
    }
  });

  // Hook para atualizar status (usado para interrupção)
  const { mutate: atualizarStatus, isLoading: isUpdatingStatus } = useOrdersControllerAtualizarStatus({
    mutation: {
      onSuccess: () => {
        // Após atualizar status, adicionar histórico
        if (funcionarioId && motivoInterrupcao) {
          addHistorico({ 
            data: { 
              ordemId: Number(orderId),
              funcionarioId: funcionarioId,
              tipo: 'status_change',
              statusAnterior: 'em_andamento', // Assumindo que estava em andamento antes de interromper
              statusNovo: 'interrompido',
              motivoInterrupcaoId: Number(motivoInterrupcao), // Assumindo que motivoInterrupcao é o ID
              observacoes: observacoes || undefined
            }
          });
        } else {
           Alert.alert('Sucesso', 'Status da ordem atualizado para interrompido.', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      },
      onError: (error) => {
        console.error('Erro ao atualizar status:', error);
        Alert.alert('Erro', 'Não foi possível interromper a ordem.');
      }
    }
  });
  
  // Hook para adicionar histórico (usado após interrupção)
  const { mutate: addHistorico, isLoading: isAddingHistorico } = useOrdersControllerAddHistorico({
      mutation: {
          onSuccess: () => {
              Alert.alert('Sucesso', 'Status da ordem atualizado e histórico registrado.', [
                  { text: 'OK', onPress: () => router.back() }
              ]);
          },
          onError: (error) => {
              console.error('Erro ao adicionar histórico após interrupção:', error);
              // Informar sucesso parcial (status atualizado, mas histórico falhou)
              Alert.alert('Sucesso Parcial', 'Status da ordem atualizado, mas houve um erro ao registrar o histórico.', [
                  { text: 'OK', onPress: () => router.back() }
              ]);
          }
      }
  });

  const getTitle = () => {
    switch (action) {
      case 'add_etapa': return 'Adicionar Nova Etapa';
      case 'interrupt': return 'Interromper Ordem';
      default: return 'Preencher Informações';
    }
  };

  const handleSubmit = () => {
    if (!orderId || !funcionarioId) {
        Alert.alert('Erro', 'Dados da ordem ou usuário não encontrados.');
        return;
    }

    switch (action) {
      case 'add_etapa':
        if (!nomeEtapa) {
          Alert.alert('Erro', 'Preencha o nome da nova etapa.');
          return;
        }
        criarEtapa({ 
          id: Number(orderId), 
          data: { 
            nome: nomeEtapa,
            funcionarioId: funcionarioId, // Associar funcionário que criou
            // Outros campos da etapa, se necessário
          } 
        });
        break;
      case 'interrupt':
        if (!motivoInterrupcao) {
          Alert.alert('Erro', 'Selecione o motivo da interrupção.'); // Ajustar se for input de texto
          return;
        }
        atualizarStatus({
          id: Number(orderId),
          data: {
            status: 'interrompido',
            // Não enviar motivo aqui, será registrado no histórico
          }
        });
        break;
      default:
        console.log('Ação desconhecida:', action);
        Alert.alert('Erro', 'Ação não reconhecida.');
        break;
    }
  };

  const isLoading = isCreatingEtapa || isUpdatingStatus || isAddingHistorico;

  if (isLoadingUserCheck) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
            <Text style={styles.ordemInfo}>Ordem: OP-{orderId}</Text>

            {action === 'add_etapa' && (
                <>
                <Text style={styles.label}>Nome da Nova Etapa:</Text>
                <TextInput
                    style={styles.input}
                    value={nomeEtapa}
                    onChangeText={setNomeEtapa}
                    placeholder="Ex: Montagem Final"
                />
                </>
            )}

            {action === 'interrupt' && (
                <>
                {/* TODO: Substituir por Picker se os motivos vierem da API */}
                <Text style={styles.label}>Motivo da Interrupção (ID):</Text>
                <TextInput
                    style={styles.input}
                    value={motivoInterrupcao}
                    onChangeText={setMotivoInterrupcao}
                    keyboardType="numeric"
                    placeholder="Informe o ID do motivo"
                />
                <Text style={styles.label}>Observações (Opcional):</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={observacoes}
                    onChangeText={setObservacoes}
                    multiline
                    placeholder="Descreva o motivo ou observação..."
                />
                </>
            )}

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
                ) : (
                <Text style={styles.buttonText}>Confirmar</Text>
                )}
            </TouchableOpacity>
             <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isLoading}
            >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
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
  formCard: {
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
  ordemInfo: {
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray || '#ccc',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
   cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrdemFillScreen;
