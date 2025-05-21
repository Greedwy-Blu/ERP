import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerCreate, useProductsControllerFindAll, useFuncionarioControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const OrdemCreateScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Form fields
  const [productCode, setProductCode] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [lotQuantity, setLotQuantity] = useState('');
  const [finalDestination, setFinalDestination] = useState('');
  
  // Data lists
  const [produtos, setProdutos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  // Check user authentication and role
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');

        if (!token || userRole !== 'gestao') {
          setInitialCheckDone(true);
          setTimeout(() => router.replace('/(login)/login'), 0);
          return;
        }
      } catch (error) {
        console.error('Failed to check user role:', error);
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

  // Fetch products
  const { 
    data: produtosResponse, 
    isLoading: isLoadingProdutos, 
    error: produtosError 
  } = useProductsControllerFindAll({
    query: {
      queryKey: ['produtos'],
      enabled: initialCheckDone,
    }
  });

  // Fetch employees
  const { 
    data: funcionariosResponse, 
    isLoading: isLoadingFuncionarios, 
    error: funcionariosError 
  } = useFuncionarioControllerFindAll({
    query: {
      queryKey: ['funcionarios'],
      enabled: initialCheckDone,
    }
  });

  // Update lists when data is loaded
  useEffect(() => {
    if (produtosResponse?.data) {
      setProdutos(produtosResponse.data);
    }
    if (funcionariosResponse?.data) {
      setFuncionarios(funcionariosResponse.data);
    }
  }, [produtosResponse, funcionariosResponse]);

  // Create order mutation
  const { mutate: criarOrdem, isLoading: isCreatingOrder } = useOrdersControllerCreate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Ordem de serviço criada com sucesso.', [
          { 
            text: 'OK', 
            onPress: () => router.push('/(home)/gestor/ordensgestorlistscreen') 
          }
        ]);
      },
      onError: (error) => {
        console.error('Erro ao criar ordem:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível criar a ordem. Verifique os dados.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!productCode || !employeeCode || !lotQuantity || !finalDestination) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validate quantity
    const quantity = parseInt(lotQuantity, 10);
    if (isNaN(quantity)) {
      Alert.alert('Erro', 'A quantidade deve ser um número válido.');
      return;
    }
    
    if (quantity <= 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior que zero.');
      return;
    }

    // Create order data
    const orderData = {
      productCode,
      employeeCode,
      lotQuantity: quantity,
      finalDestination
    };

    criarOrdem({ data: orderData });
  };

  // Handle API errors
  useEffect(() => {
    if (produtosError) {
      console.error('Erro ao buscar produtos:', produtosError);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    }
    if (funcionariosError) {
      console.error('Erro ao buscar funcionários:', funcionariosError);
      Alert.alert('Erro', 'Não foi possível carregar os funcionários.');
    }
  }, [produtosError, funcionariosError]);

  if (!initialCheckDone || isLoadingUserCheck || isLoadingProdutos || isLoadingFuncionarios) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando formulário...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Criar Nova Ordem de Serviço</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações da Ordem</Text>
          
          <Text style={styles.label}>Produto *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productCode}
              onValueChange={setProductCode}
              style={styles.picker}
              dropdownIconColor={COLORS.primary}
            >
              <Picker.Item label="Selecione um produto" value="" />
              {produtos.map((produto) => (
                <Picker.Item 
                  key={produto.id} 
                  label={`${produto.name} (${produto.code})`} 
                  value={produto.code} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Funcionário *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={employeeCode}
              onValueChange={setEmployeeCode}
              style={styles.picker}
              dropdownIconColor={COLORS.primary}
            >
              <Picker.Item label="Selecione um funcionário" value="" />
              {funcionarios.map((funcionario) => (
                <Picker.Item 
                  key={funcionario.id} 
                  label={`${funcionario.nome} (${funcionario.code})`} 
                  value={funcionario.code} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Quantidade do Lote *</Text>
          <TextInput
            style={styles.input}
            value={lotQuantity}
            onChangeText={(text) => {
              // Allow only numbers
              const cleanedText = text.replace(/[^0-9]/g, '');
              setLotQuantity(cleanedText);
            }}
            placeholder="Informe a quantidade"
            keyboardType="numeric"
            maxLength={6}
          />
          
          <Text style={styles.label}>Destino Final *</Text>
          <TextInput
            style={styles.input}
            value={finalDestination}
            onChangeText={setFinalDestination}
            placeholder="Informe o destino final"
            maxLength={100}
          />
          
          <TouchableOpacity 
            style={[styles.submitButton, isCreatingOrder && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Criar Ordem de Serviço</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.cancelButton, isCreatingOrder && styles.disabledButton]}
            onPress={() => router.back()}
            disabled={isCreatingOrder}
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
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

export default OrdemCreateScreen;