import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerCreateEtapa, useOrdersControllerAtualizarStatus, useOrdersControllerCreateHistoricoProducao } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OrdemFillScreen = () => {
  const router = useRouter();
  const { orderId, action, etapaId } = useLocalSearchParams();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Estados para formulário
  const [nomeEtapa, setNomeEtapa] = useState('');
  const [motivoInterrupcao, setMotivoInterrupcao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Verificar autenticação e buscar ID do funcionário
  useEffect(() => {
    const checkAuthAndFetchId = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');
        const storedFuncionarioId = await AsyncStorage.getItem('user_id');

        if (!token || userRole !== 'funcionario' || !storedFuncionarioId) {
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
          return;
        }
        setFuncionarioId(parseInt(storedFuncionarioId, 10));
      } catch (error) {
        console.error('Falha ao verificar autenticação ou buscar ID:', error);
        Alert.alert('Erro', 'Falha ao carregar dados. Por favor, faça login novamente.');
        if (isMounted) {
          setTimeout(() => {
            router.replace('/(login)/login');
          }, 0);
        }
      } finally {
        setIsLoadingUserCheck(false);
      }
    };
    checkAuthAndFetchId();
  }, [router, isMounted]);

  // Hook para criar etapa
  const { mutate: criarEtapa, isLoading: isCreatingEtapa } = useOrdersControllerCreateEtapa({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Nova etapa criada com sucesso.', [
          { text: 'OK', onPress: () => {
            if (isMounted) router.back();
          }}
        ]);
      },
      onError: (error) => {
        console.error('Erro ao criar etapa:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível criar a nova etapa.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  // Hook para atualizar status
  const { mutate: atualizarStatus, isLoading: isUpdatingStatus } = useOrdersControllerAtualizarStatus({
    mutation: {
      onSuccess: () => {
        if (funcionarioId && motivoInterrupcao && isMounted) {
          addHistorico({ 
            data: { 
              pedidoId: Number(orderId),
              funcionarioId: funcionarioId,
              acao: 'status_change',
              motivoInterrupcaoId: Number(motivoInterrupcao),
              observacoes: observacoes || undefined
            }
          });
        } else {
          Alert.alert('Sucesso', 'Status da ordem atualizado para interrompido.', [
            { text: 'OK', onPress: () => {
              if (isMounted) router.back();
            }}
          ]);
        }
      },
      onError: (error) => {
        console.error('Erro ao atualizar status:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível interromper a ordem.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });
  
  // Hook para adicionar histórico
  const { mutate: addHistorico, isLoading: isAddingHistorico } = useOrdersControllerCreateHistoricoProducao({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Status da ordem atualizado e histórico registrado.', [
          { text: 'OK', onPress: () => {
            if (isMounted) router.back();
          }}
        ]);
      },
      onError: (error) => {
        console.error('Erro ao adicionar histórico após interrupção:', error);
        Alert.alert('Sucesso Parcial', 'Status da ordem atualizado, mas houve um erro ao registrar o histórico.', [
          { text: 'OK', onPress: () => {
            if (isMounted) router.back();
          }}
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
    if (!isMounted || !orderId || !funcionarioId) {
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
            funcionarioCode: funcionarioId.toString(),
          } 
        });
        break;
      case 'interrupt':
        if (!motivoInterrupcao) {
          Alert.alert('Erro', 'Selecione o motivo da interrupção.');
          return;
        }
        atualizarStatus({
          id: Number(orderId),
          data: {
            status: 'interrompido',
          }
        });
        break;
      default:
        Alert.alert('Erro', 'Ação não reconhecida.');
        break;
    }
  };

  const handleCancel = () => {
    if (isMounted) {
      router.back();
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
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
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
                editable={!isLoading}
              />
            </>
          )}

          {action === 'interrupt' && (
            <>
              <Text style={styles.label}>Motivo da Interrupção (ID):</Text>
              <TextInput
                style={styles.input}
                value={motivoInterrupcao}
                onChangeText={setMotivoInterrupcao}
                keyboardType="numeric"
                placeholder="Informe o ID do motivo"
                editable={!isLoading}
              />
              <Text style={styles.label}>Observações (Opcional):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                placeholder="Descreva o motivo ou observação..."
                editable={!isLoading}
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
            style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            onPress={handleCancel}
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
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
    fontWeight: '600',
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
    backgroundColor: COLORS.white,
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
    opacity: 0.6,
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
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrdemFillScreen;