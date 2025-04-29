import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '@/constants/colors'; // Ajuste o caminho conforme necessário
import { useProdutoControllerCreate } from '@/api/generated'; // Ajuste o caminho conforme necessário
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const ProdutoCreateScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);

  // Estados para os campos do formulário
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  // Verificar se o usuário é um gestor logado
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userRole = await AsyncStorage.getItem('userRole');

        if (!token || userRole !== 'gestor') {
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

  // Hook para criar um novo produto
  const { mutate: createProduto, isLoading: isCreating } = useProdutoControllerCreate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Produto criado com sucesso.', [
          { text: 'OK', onPress: () => router.back() } // Voltar após a criação
        ]);
      },
      onError: (error) => {
        console.error('Erro ao criar produto:', error);
        // Verificar mensagens de erro específicas da API, se disponíveis
        const errorMessage = error.response?.data?.message || 'Não foi possível criar o produto. Verifique os dados e tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  // Função para validar e enviar o formulário
  const handleSubmit = () => {
    // Validar campos obrigatórios
    if (!code || !name) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha pelo menos o código e o nome do produto.');
      return;
    }

    // Validar preço unitário (deve ser um número positivo)
    let unitPriceNum = null;
    if (unitPrice) {
      unitPriceNum = parseFloat(unitPrice);
      if (isNaN(unitPriceNum) || unitPriceNum < 0) {
        Alert.alert('Preço Inválido', 'O preço unitário deve ser um número positivo.');
        return;
      }
    }

    // Preparar dados para a API
    const produtoData = {
      code,
      name,
      description: description || undefined,
      unitPrice: unitPriceNum || undefined
    };

    // Chamar a mutação
    createProduto({ data: produtoData });
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
        <Text style={styles.headerTitle}>Criar Novo Produto</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Dados do Produto</Text>
          
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Ex: PROD001"
            autoCapitalize="characters"
          />
          
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome do produto"
          />
          
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição detalhada do produto"
            multiline
            numberOfLines={4}
          />
          
          <Text style={styles.label}>Preço Unitário (R$)</Text>
          <TextInput
            style={styles.input}
            value={unitPrice}
            onChangeText={setUnitPrice}
            placeholder="Ex: 99.90"
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
              <Text style={styles.submitButtonText}>Criar Produto</Text>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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

export default ProdutoCreateScreen;
