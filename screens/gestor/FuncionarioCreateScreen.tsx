import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useFuncionarioControllerCreate } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const FuncionarioCreateScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // State for form fields
  const [code, setCode] = useState('');
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [salario, setSalario] = useState('');
  const [password, setPassword] = useState('');

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

  // Hook for creating employee
  const { mutate: createFuncionario, isLoading: isCreating } = useFuncionarioControllerCreate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Funcionário criado com sucesso.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (error) => {
        console.error('Error creating employee:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível criar o funcionário. Verifique os dados e tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!code || !nome || !cargo || !salario || !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos, incluindo a senha.');
      return;
    }
  
    // Validate salary (must be a positive number)
    const salarioNum = parseFloat(salario);
    if (isNaN(salarioNum)){
      Alert.alert('Salário Inválido', 'O salário deve ser um número válido.');
      return;
    }

    if (salarioNum < 0) {
      Alert.alert('Salário Inválido', 'O salário deve ser um número positivo.');
      return;
    }
  
    // Validate password complexity
    if (password.length < 6) {
      Alert.alert('Senha Inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
  
    // Prepare data for API
    const funcionarioData = {
      code,
      nome,
      cargo,
      salario: salarioNum,
      password
    };
  
    // Call the mutation
    createFuncionario({ data: funcionarioData });
  };

  if (!initialCheckDone || isLoadingUserCheck) {
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

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Dados do Funcionário</Text>
          
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Ex: FUNC001"
            autoCapitalize="characters"
            maxLength={20}
          />
          
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome do funcionário"
            maxLength={100}
          />
          
          <Text style={styles.label}>Cargo</Text>
          <TextInput
            style={styles.input}
            value={cargo}
            onChangeText={setCargo}
            placeholder="Cargo do funcionário"
            maxLength={50}
          />
          
          <Text style={styles.label}>Salário (R$)</Text>
          <TextInput
            style={styles.input}
            value={salario}
            onChangeText={(text) => {
              // Allow only numbers and decimal point
              const cleanedText = text.replace(/[^0-9.]/g, '');
              // Ensure only one decimal point
              const parts = cleanedText.split('.');
              if (parts.length <= 2) {
                setSalario(cleanedText);
              }
            }}
            placeholder="Ex: 2500.00"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha de acesso inicial"
            secureTextEntry
            maxLength={20}
          />
          
          <TouchableOpacity
            style={[styles.submitButton, isCreating && styles.disabledButton]}
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
            style={[styles.cancelButton, isCreating && styles.disabledButton]}
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
  disabledButton: {
    opacity: 0.6,
  },
});

export default FuncionarioCreateScreen;