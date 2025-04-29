import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '@/constants/colors'; // Adjust path if needed
import { useFuncionarioControllerCreate } from '@/api/generated'; // Adjust path if needed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const FuncionarioCreateScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);

  // State for form fields
  const [code, setCode] = useState('');
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [salario, setSalario] = useState('');

  // Check if user is a logged-in gestor
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userRole = await AsyncStorage.getItem('userRole');

        if (!token || userRole !== 'gestor') {
          router.replace('/(login)/login');
        }
      } catch (error) {
        console.error('Failed to check user role from storage:', error);
        Alert.alert('Erro', 'Falha ao verificar permissões. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserCheck(false);
      }
    };

    checkUserRole();
  }, [router]);

  // Hook for creating employee
  const { mutate: createFuncionario, isLoading: isCreating } = useFuncionarioControllerCreate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Funcionário criado com sucesso.', [
          { text: 'OK', onPress: () => router.back() } // Go back after creation
        ]);
      },
      onError: (error) => {
        console.error('Error creating employee:', error);
        // Check for specific error messages from API if available
        const errorMessage = error.response?.data?.message || 'Não foi possível criar o funcionário. Verifique os dados e tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  // Handle form submission
  const handleSubmit = () => {
    // Validate required fields
    if (!code || !nome || !cargo || !salario) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validate salary (must be a positive number)
    const salarioNum = parseFloat(salario);
    if (isNaN(salarioNum) || salarioNum < 0) {
      Alert.alert('Salário Inválido', 'O salário deve ser um número positivo.');
      return;
    }

    // Prepare data for API
    const funcionarioData = {
      code,
      nome,
      cargo,
      salario: salarioNum
    };

    // Call the mutation
    createFuncionario({ data: funcionarioData });
  };

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
        <Text style={styles.headerTitle}>Criar Novo Funcionário</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Dados do Funcionário</Text>
          
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Ex: FUNC001"
            autoCapitalize="characters"
          />
          
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome do funcionário"
          />
          
          <Text style={styles.label}>Cargo</Text>
          <TextInput
            style={styles.input}
            value={cargo}
            onChangeText={setCargo}
            placeholder="Cargo do funcionário"
          />
          
          <Text style={styles.label}>Salário (R$)</Text>
          <TextInput
            style={styles.input}
            value={salario}
            onChangeText={setSalario}
            placeholder="Ex: 2500.00"
            keyboardType="numeric"
          />
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Criar Funcionário</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isCreating}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
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

export default FuncionarioCreateScreen;

