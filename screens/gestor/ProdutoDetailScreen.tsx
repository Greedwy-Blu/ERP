import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useProductsControllerFindOne as useProdutoControllerFindOne, useProductsControllerUpdate as useProdutoControllerUpdate, useProductsControllerRemove } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

const ProdutoDetailScreen = () => {
  const router = useRouter();
  const { produtoId } = useLocalSearchParams();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Estados para campos editáveis
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Verificar se o usuário é um gestor logado
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');

        if (!token || userRole !== 'gestao') {
          if (isMounted) {
            router.replace('/(login)/login');
          }
        }
      } catch (error) {
        console.error('Falha ao verificar papel do usuário no armazenamento:', error);
        Alert.alert('Erro', 'Falha ao verificar permissões. Por favor, faça login novamente.');
        if (isMounted) {
          router.replace('/(login)/login');
        }
      } finally {
        setIsLoadingUserCheck(false);
      }
    };

    checkUserRole();
  }, [router, isMounted]);

  // Buscar detalhes do produto usando o hook gerado pelo Orval
  const { 
    data: produtoResponse, 
    isLoading: isLoadingProduto, 
    error: produtoError, 
    refetch 
  } = useProdutoControllerFindOne(
    Number(produtoId),
    {
      query: {
        queryKey: ['produto', produtoId],
        enabled: !isLoadingUserCheck && !!produtoId,
      }
    }
  );

  const produto = produtoResponse?.data;

  // Atualizar estados quando os dados do produto forem carregados
  useEffect(() => {
    if (produto) {
      setName(produto.name || '');
      setDescription(produto.description || '');
      setUnitPrice(produto.unitPrice?.toString() || '');
    }
  }, [produto]);

  // Hook para atualizar produto
  const { mutate: updateProduto, isLoading: isUpdating } = useProdutoControllerUpdate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Produto atualizado com sucesso.');
        refetch(); // Recarregar dados para mostrar informações atualizadas
      },
      onError: (error) => {
        console.error('Erro ao atualizar produto:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o produto.');
      }
    }
  });

  // Hook para remover produto
  const { mutate: removeProduto, isLoading: isRemoving } = useProductsControllerRemove({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Produto removido com sucesso.', [
          { text: 'OK', onPress: () => router.back() } // Voltar após a remoção
        ]);
      },
      onError: (error) => {
        console.error('Erro ao remover produto:', error);
        Alert.alert('Erro', 'Não foi possível remover o produto.');
      }
    }
  });

  // Função para salvar alterações
  const handleSaveChanges = () => {
    if (!produtoId) return;

    // Validar preço unitário (deve ser um número positivo)
    let unitPriceNum = null;
    if (unitPrice) {
      unitPriceNum = parseFloat(unitPrice);
      if (isNaN(unitPriceNum) || unitPriceNum < 0) {
        Alert.alert('Preço Inválido', 'O preço unitário deve ser um número positivo.');
        return;
      }
    }

    updateProduto({
      id: Number(produtoId),
      data: {
        name,
        description
      }
    });
  };

  // Função para confirmar remoção
  const handleDelete = () => {
    if (!produtoId) return;

    Alert.alert(
      'Confirmar Remoção',
      `Tem certeza que deseja remover o produto ${produto?.name}? Esta ação não pode ser desfeita.`, 
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeProduto({ id: Number(produtoId) })
        }
      ]
    );
  };

  // Lidar com erros da API
  useEffect(() => {
    if (produtoError) {
      console.error('Erro ao buscar detalhes do produto:', produtoError);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do produto.');
    }
  }, [produtoError]);

  // Recarregar dados quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      if (!isLoadingUserCheck && produtoId) {
        refetch();
      }
    }, [isLoadingUserCheck, produtoId, refetch])
  );

  if (isLoadingUserCheck || isLoadingProduto) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando detalhes do produto...</Text>
      </View>
    );
  }

  if (!produto) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Produto não encontrado.</Text>
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
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Código:</Text>
            <Text style={styles.value}>{produto.code}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Nome:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text style={styles.value}>{produto.name}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Descrição:</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.value}>{produto.description || 'Não especificada'}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Preço Unitário:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{produto.unitPrice ? `R$ ${produto.unitPrice.toFixed(2)}` : 'Não especificado'}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Criado em:</Text>
            <Text style={styles.value}>{new Date(produto.createdAt).toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Atualizado em:</Text>
            <Text style={styles.value}>{new Date(produto.updatedAt).toLocaleDateString('pt-BR')}</Text>
          </View>

          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]} 
                onPress={handleSaveChanges}
                disabled={isUpdating}
              >
                {isUpdating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.actionButtonText}>Salvar</Text>}
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
              {isRemoving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.actionButtonText}>Remover Produto</Text>}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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

export default ProdutoDetailScreen;