import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useProductsControllerCreate } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const ProdutoCreateScreen = () => {
  const router = useRouter();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

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

  // Create product mutation
  const { mutate: createProduto, isLoading: isCreating } = useProductsControllerCreate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Produto criado com sucesso.', [
          { text: 'OK', onPress: () => router.push('/(home)/gestor/produtoslistscreen') }
        ]);
      },
      onError: (error) => {
        console.error('Error creating product:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível criar o produto. Verifique os dados e tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!code || !name || !price || !quantity) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos: código, nome, preço e quantidade.');
      return;
    }

    // Validate price format
    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Preço Inválido', 'O preço deve ser um número positivo.');
      return;
    }

    // Validate quantity format
    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      Alert.alert('Quantidade Inválida', 'A quantidade deve ser um número inteiro positivo.');
      return;
    }

    // Prepare data for API
    const produtoData = {
      code,
      name,
      description: description || undefined,
      price: priceNum,
      quantity: quantityNum
    };

    createProduto({ data: produtoData });
  };

  const handlePriceChange = (text) => {
    // Allow only numbers and one decimal point or comma
    const cleanedText = text.replace(/[^0-9,.]/g, '');
    // Ensure only one decimal separator
    const parts = cleanedText.split(/[,.]/);
    if (parts.length <= 2) {
      setPrice(cleanedText);
    }
  };

  const handleQuantityChange = (text) => {
    // Allow only numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    setQuantity(cleanedText);
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
        <Text style={styles.headerTitle}>Criar Novo Produto</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Dados do Produto</Text>

          <Text style={styles.label}>Código *</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Ex: PROD001"
            autoCapitalize="characters"
            maxLength={20}
          />

          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome do produto"
            maxLength={100}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição detalhada do produto"
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <Text style={styles.label}>Preço (R$) *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={handlePriceChange}
            placeholder="Ex: 99,90"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Quantidade *</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={handleQuantityChange}
            placeholder="Quantidade em estoque"
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.submitButton, isCreating && styles.disabledButton]}
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
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProdutoCreateScreen;