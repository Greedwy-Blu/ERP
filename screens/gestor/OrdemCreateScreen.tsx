import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '@/constants/colors';
import { useOrdersControllerCreate, useProdutoControllerFindAll, useFuncionarioControllerFindAll } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const OrdemCreateScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  
  // Estados para os campos do formulário
  const [productCode, setProductCode] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [lotQuantity, setLotQuantity] = useState('');
  const [finalDestination, setFinalDestination] = useState('');
  
  // Estados para listas de seleção
  const [produtos, setProdutos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  // Verificar se o usuário é um gestor logado
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userRole = await AsyncStorage.getItem('userRole');

        if (!token || userRole !== 'gestor') {
          // Se não houver token ou o papel não for gestor, redirecionar para login
          router.replace('/(login)/login');
        }
      } catch (error) {
        console.error('Falha ao verificar papel do usuário no armazenamento:', error);
        Alert.alert('Erro', 'Falha ao verificar permissões. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserCheck(false);
      }
    };

    checkUserRole();
  }, [router]);

  // Buscar produtos
  const { data: produtosResponse, isLoading: isLoadingProdutos, error: produtosError } = useProdutoControllerFindAll({
    query: {
      enabled: !isLoadingUserCheck, // Só executar a consulta após a verificação do usuário
    }
  });

  // Buscar funcionários
  const { data: funcionariosResponse, isLoading: isLoadingFuncionarios, error: funcionariosError } = useFuncionarioControllerFindAll({
    query: {
      enabled: !isLoadingUserCheck, // Só executar a consulta após a verificação do usuário
    }
  });

  // Atualizar listas quando os dados forem carregados
  useEffect(() => {
    if (produtosResponse?.data) {
      setProdutos(produtosResponse.data);
    }
    if (funcionariosResponse?.data) {
      setFuncionarios(funcionariosResponse.data);
    }
  }, [produtosResponse, funcionariosResponse]);

  // Hook para criar uma nova ordem
  const { mutate: criarOrdem, isLoading: isCreatingOrder } = useOrdersControllerCreate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Ordem de serviço criada com sucesso.', [
          { 
            text: 'OK', 
            onPress: () => router.push('/(home)/OrdensGestorListScreen') 
          }
        ]);
      },
      onError: (error) => {
        console.error('Erro ao criar ordem de serviço:', error);
        Alert.alert('Erro', 'Não foi possível criar a ordem de serviço. Verifique os dados e tente novamente.');
      }
    }
  });

  // Função para validar e enviar o formulário
  const handleSubmit = () => {
    // Validar campos obrigatórios
    if (!productCode || !employeeCode || !lotQuantity || !finalDestination) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validar quantidade (deve ser um número positivo)
    const quantity = parseInt(lotQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Quantidade Inválida', 'A quantidade deve ser um número positivo.');
      return;
    }

    // Criar objeto com dados da ordem
    const orderData = {
      productCode,
      employeeCode,
      lotQuantity: quantity,
      finalDestination
    };

    // Enviar para a API
    criarOrdem({ data: orderData });
  };

  // Lidar com erros da API
  useEffect(() => {
    if (produtosError) {
      console.error('Erro ao buscar produtos:', produtosError);
      Alert.alert('Erro', 'Não foi possível carregar a lista de produtos.');
    }
    if (funcionariosError) {
      console.error('Erro ao buscar funcionários:', funcionariosError);
      Alert.alert('Erro', 'Não foi possível carregar a lista de funcionários.');
    }
  }, [produtosError, funcionariosError]);

  if (isLoadingUserCheck || isLoadingProdutos || isLoadingFuncionarios) {
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

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações da Ordem</Text>
          
          <Text style={styles.label}>Produto</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productCode}
              onValueChange={(itemValue) => setProductCode(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um produto" value="" />
              {produtos.map((produto) => (
                <Picker.Item 
                  key={produto.id} 
                  label={produto.name} 
                  value={produto.code} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Funcionário</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={employeeCode}
              onValueChange={(itemValue) => setEmployeeCode(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um funcionário" value="" />
              {funcionarios.map((funcionario) => (
                <Picker.Item 
                  key={funcionario.id} 
                  label={funcionario.nome} 
                  value={funcionario.code} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Quantidade do Lote</Text>
          <TextInput
            style={styles.input}
            value={lotQuantity}
            onChangeText={setLotQuantity}
            placeholder="Informe a quantidade"
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Destino Final</Text>
          <TextInput
            style={styles.input}
            value={finalDestination}
            onChangeText={setFinalDestination}
            placeholder="Informe o destino final"
          />
          
          <TouchableOpacity 
            style={styles.submitButton}
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
            style={styles.cancelButton}
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
  },
  picker: {
    height: 50,
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

export default OrdemCreateScreen;
