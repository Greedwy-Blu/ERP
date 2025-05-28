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
  const [productId, setProductId] = useState('');
  const [funcionarioId, setFuncionarioId] = useState('');
  const [maquinaId, setMaquinaId] = useState('');
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
    error: produtosError,
    refetch: refetchProdutos 
  } = useProductsControllerFindAll({
    query: {
      enabled: initialCheckDone,
      onSuccess: (data) => {
        console.log('Dados completos de produtos:', JSON.stringify(data, null, 2));
      }
    }
  });

  // Fetch employees
  const { 
    data: funcionariosResponse, 
    isLoading: isLoadingFuncionarios, 
    error: funcionariosError,
    refetch: refetchFuncionarios 
  } = useFuncionarioControllerFindAll({
    query: {
      enabled: initialCheckDone,
      onSuccess: (data) => {
        console.log('Dados completos de funcionários:', JSON.stringify(data, null, 2));
      }
    }
  });

  // Update lists when data is loaded
  useEffect(() => {

    // Verifica se a resposta existe e tem dados
    if (produtosResponse) {
      // Algumas APIs retornam os dados diretamente, outras em uma propriedade 'data'
      const produtosData = produtosResponse.data || produtosResponse;
      
      if (Array.isArray(produtosData)) {
        console.log('Produtos encontrados:', produtosData);
        setProdutos(produtosData);
      } else {
        console.warn('Produtos não é um array:', produtosData);
      }
    }

    if (funcionariosResponse) {
      const funcionariosData = funcionariosResponse.data || funcionariosResponse;
      
      if (Array.isArray(funcionariosData)) {
        console.log('Funcionários encontrados:', funcionariosData);
        setFuncionarios(funcionariosData);
      } else {
        console.warn('Funcionários não é um array:', funcionariosData);
      }
    }
  }, [produtosResponse, funcionariosResponse]);

  // Create order mutation
  const { mutate: criarOrdem, isLoading: isCreatingOrder } = useOrdersControllerCreate({
    mutation: {
      onSuccess: (data) => {
        console.log('Ordem criada com sucesso:', data);
        Alert.alert('Sucesso', 'Ordem de serviço criada com sucesso!', [
          { 
            text: 'OK', 
            onPress: () => router.push('/(home)/gestor/ordensgestorlistscreen') 
          }
        ]);
      },
      onError: (error) => {
        console.error('Erro ao criar ordem:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        const errorMessage = error.response?.data?.message || 'Não foi possível criar a ordem. Verifique os dados.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  const handleSubmit = async () => {
    // Validate required fields
    if (!productId || !funcionarioId || !lotQuantity || !finalDestination) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
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

    try {
      // Get token for authorization
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
        router.replace('/(login)/login');
        return;
      }

     const produtoSelecionado = produtos.find(p => p.id.toString() === productId);
      const funcionarioSelecionado = funcionarios.find(f => f.id.toString() === funcionarioId);

      if (!produtoSelecionado || !funcionarioSelecionado) {
        Alert.alert('Erro', 'Dados selecionados inválidos');
        return;
      }

      const orderData = {
        productCode: produtoSelecionado.code || produtoSelecionado.codigo || '',
        employeeCode: funcionarioSelecionado.code || funcionarioSelecionado.codigo || '',
        lotQuantity: quantity,
        finalDestination: finalDestination
      };

      console.log('Dados da ordem sendo enviados:', orderData);

  criarOrdem({ 
    data: orderData,
  });

    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  if (!initialCheckDone || isLoadingUserCheck) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  if (isLoadingProdutos || isLoadingFuncionarios) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if ((!isLoadingProdutos && produtos.length === 0) || (!isLoadingFuncionarios && funcionarios.length === 0)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Criar Nova Ordem de Serviço</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {produtos.length === 0 ? 'Nenhum produto disponível' : 'Nenhum funcionário disponível'}
          </Text>
          <TouchableOpacity 
            style={styles.reloadButton}
            onPress={() => {
              refetchProdutos();
              refetchFuncionarios();
            }}
          >
            <Text style={styles.reloadButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
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
              selectedValue={productId}
              onValueChange={setProductId}
              style={styles.picker}
              dropdownIconColor={COLORS.primary}
            >
              <Picker.Item label="Selecione um produto" value="" />
              {produtos.map((produto) => (
                <Picker.Item 
                  key={produto.id} 
                  label={`${produto.name || produto.nome} (${produto.code || produto.codigo})`} 
                  value={produto.id.toString()} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Funcionário Responsável *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={funcionarioId}
              onValueChange={setFuncionarioId}
              style={styles.picker}
              dropdownIconColor={COLORS.primary}
            >
              <Picker.Item label="Selecione um funcionário" value="" />
              {funcionarios.map((funcionario) => (
                <Picker.Item 
                  key={funcionario.id} 
                  label={`${funcionario.nome || funcionario.name} (${funcionario.code || funcionario.codigo})`} 
                  value={funcionario.id.toString()} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Quantidade do Lote *</Text>
          <TextInput
            style={styles.input}
            value={lotQuantity}
            onChangeText={(text) => {
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
            placeholder="Informe o destino final do produto"
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
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.black,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.black,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 4,
    minWidth: 150,
  },
  reloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrdemCreateScreen;