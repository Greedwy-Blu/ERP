import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useFuncionarioControllerFindOne, useFuncionarioControllerUpdate, useFuncionarioControllerRemove } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

const FuncionarioDetailScreen = () => {
  const router = useRouter();
  const { funcionarioId } = useLocalSearchParams();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State for editable fields
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [salario, setSalario] = useState('');

  // Check if user is a logged-in gestor
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');

        if (!token || userRole !== 'gestor') {
          setInitialCheckDone(true);
          setTimeout(() => router.replace('/(login)/login'), 0);
          return;
        }
      } catch (error) {
        console.error('Failed to check user role from storage:', error);
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

  // Fetch employee details
  const { 
    data: funcionarioResponse, 
    isLoading: isLoadingFuncionario, 
    error: funcionarioError, 
    refetch 
  } = useFuncionarioControllerFindOne(
    Number(funcionarioId),
    {
      query: {
        queryKey: ['funcionario', funcionarioId],
        enabled: initialCheckDone && !!funcionarioId,
      }
    }
  );

  const funcionario = funcionarioResponse?.data;

  // Pre-fill state when data is loaded
  useEffect(() => {
    if (funcionario) {
      setNome(funcionario.nome || '');
      setCargo(funcionario.cargo || '');
      setSalario(funcionario.salario?.toString() || '');
    }
  }, [funcionario]);

  // Hook for updating employee
  const { mutate: updateFuncionario, isLoading: isUpdating } = useFuncionarioControllerUpdate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Funcionário atualizado com sucesso.');
        setIsEditing(false);
        refetch();
      },
      onError: (error) => {
        console.error('Error updating employee:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o funcionário.');
      }
    }
  });

  // Hook for removing employee
  const { mutate: removeFuncionario, isLoading: isRemoving } = useFuncionarioControllerRemove({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Funcionário removido com sucesso.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (error) => {
        console.error('Error removing employee:', error);
        Alert.alert('Erro', 'Não foi possível remover o funcionário.');
      }
    }
  });

  // Handle save changes
  const handleSaveChanges = () => {
    if (!funcionarioId) return;

    const salarioNum = parseFloat(salario);
    if (isNaN(salarioNum) || salarioNum < 0) {
      Alert.alert('Erro', 'Salário inválido.');
      return;
    }

    updateFuncionario({
      id: Number(funcionarioId),
      data: {
        nome,
        cargo,
        salario: salarioNum
      }
    });
  };

  // Handle delete confirmation
  const handleDelete = () => {
    if (!funcionarioId) return;

    Alert.alert(
      'Confirmar Remoção',
      `Tem certeza que deseja remover o funcionário ${funcionario?.nome}? Esta ação não pode ser desfeita.`, 
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFuncionario({ id: Number(funcionarioId) })
        }
      ]
    );
  };

  // Refetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (initialCheckDone && funcionarioId) {
        refetch();
      }
    }, [initialCheckDone, funcionarioId, refetch])
  );

  if (!initialCheckDone || isLoadingUserCheck || isLoadingFuncionario) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando detalhes do funcionário...</Text>
      </View>
    );
  }

  if (!funcionario) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Funcionário não encontrado.</Text>
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
        <Text style={styles.headerTitle}>Detalhes do Funcionário</Text>
        {!isEditing && (
          <TouchableOpacity 
            onPress={() => setIsEditing(true)} 
            style={styles.editButton}
            disabled={isRemoving}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Código:</Text>
            <Text style={styles.value}>{funcionario.code}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Nome:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome do funcionário"
                maxLength={100}
              />
            ) : (
              <Text style={styles.value}>{funcionario.nome}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Cargo:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={cargo}
                onChangeText={setCargo}
                placeholder="Cargo do funcionário"
                maxLength={50}
              />
            ) : (
              <Text style={styles.value}>{funcionario.cargo}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Salário:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={salario}
                onChangeText={(text) => {
                  const cleanedText = text.replace(/[^0-9.]/g, '');
                  const parts = cleanedText.split('.');
                  if (parts.length <= 2) {
                    setSalario(cleanedText);
                  }
                }}
                placeholder="Salário"
                keyboardType="decimal-pad"
              />
            ) : (
              <Text style={styles.value}>{funcionario.salario ? `R$ ${funcionario.salario.toFixed(2)}` : 'N/A'}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Criado em:</Text>
            <Text style={styles.value}>{new Date(funcionario.createdAt).toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Atualizado em:</Text>
            <Text style={styles.value}>{new Date(funcionario.updatedAt).toLocaleDateString('pt-BR')}</Text>
          </View>

          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]} 
                onPress={handleSaveChanges}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.actionButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={() => setIsEditing(false)}
                disabled={isUpdating}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isEditing && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={handleDelete}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.actionButtonText}>Remover Funcionário</Text>
              )}
            </TouchableOpacity>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editButton: {
    backgroundColor: COLORS.accent || '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text?.secondary || '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.text?.primary || '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: COLORS.success || '#4CAF50',
  },
  cancelButton: {
    backgroundColor: COLORS.gray || '#9E9E9E',
  },
  deleteButton: {
    backgroundColor: COLORS.error || '#F44336',
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FuncionarioDetailScreen;