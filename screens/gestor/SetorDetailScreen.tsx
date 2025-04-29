import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { COLORS } from '@/constants/colors'; // Ajuste o caminho conforme necessário
import { 
  useSectorControllerFindOne, 
  useSectorControllerUpdate, 
  useSectorControllerRemove, 
  useSectorControllerAddConfig, 
  useSectorControllerRemoveConfig,
  useProdutoControllerFindAll 
} from '@/api/generated'; // Ajuste o caminho conforme necessário
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const SetorDetailScreen = () => {
  const router = useRouter();
  const { setorId } = useLocalSearchParams();
  const [isLoadingUserCheck, setIsLoadingUserCheck] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para campos editáveis
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Estado para configuração do setor (produtos)
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');

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

  // Buscar detalhes do setor
  const { data: setorResponse, isLoading: isLoadingSetor, error: setorError, refetch } = useSectorControllerFindOne(
    Number(setorId),
    {
      query: {
        enabled: !isLoadingUserCheck && !!setorId,
        onSuccess: (data) => {
          if (data?.data) {
            setName(data.data.name || '');
            setDescription(data.data.description || '');
          }
        }
      }
    }
  );
  const setor = setorResponse?.data;

  // Buscar todos os produtos para o Picker
  const { data: productsResponse, isLoading: isLoadingProducts } = useProdutoControllerFindAll({
    query: {
      enabled: !isLoadingUserCheck, // Só buscar produtos após checar usuário
    }
  });

  useEffect(() => {
    if (productsResponse?.data) {
      setAvailableProducts(productsResponse.data);
    }
  }, [productsResponse]);

  // Hook para atualizar setor
  const { mutate: updateSetor, isLoading: isUpdating } = useSectorControllerUpdate({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Setor atualizado com sucesso.');
        setIsEditing(false);
        refetch();
      },
      onError: (error) => {
        console.error('Erro ao atualizar setor:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o setor.');
      }
    }
  });

  // Hook para remover setor
  const { mutate: removeSetor, isLoading: isRemoving } = useSectorControllerRemove({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Setor removido com sucesso.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (error) => {
        console.error('Erro ao remover setor:', error);
        Alert.alert('Erro', 'Não foi possível remover o setor.');
      }
    }
  });

  // Hook para adicionar configuração (produto ao setor)
  const { mutate: addConfig, isLoading: isAddingConfig } = useSectorControllerAddConfig({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Produto adicionado à configuração do setor.');
        setSelectedProductToAdd(''); // Limpar seleção
        refetch(); // Recarregar dados do setor
      },
      onError: (error) => {
        console.error('Erro ao adicionar configuração:', error);
        Alert.alert('Erro', 'Não foi possível adicionar o produto à configuração.');
      }
    }
  });

  // Hook para remover configuração (produto do setor)
  const { mutate: removeConfig, isLoading: isRemovingConfig } = useSectorControllerRemoveConfig({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Produto removido da configuração do setor.');
        refetch(); // Recarregar dados do setor
      },
      onError: (error) => {
        console.error('Erro ao remover configuração:', error);
        Alert.alert('Erro', 'Não foi possível remover o produto da configuração.');
      }
    }
  });

  // Função para salvar alterações
  const handleSaveChanges = () => {
    if (!setorId) return;
    updateSetor({
      id: Number(setorId),
      data: {
        name,
        description,
      }
    });
  };

  // Função para confirmar remoção
  const handleDelete = () => {
    if (!setorId) return;
    Alert.alert(
      'Confirmar Remoção',
      `Tem certeza que deseja remover o setor ${setor?.name}? Esta ação não pode ser desfeita.`, 
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeSetor({ id: Number(setorId) })
        }
      ]
    );
  };

  // Função para adicionar produto à configuração
  const handleAddProductConfig = () => {
    if (!setorId || !selectedProductToAdd) {
      Alert.alert('Erro', 'Selecione um produto para adicionar.');
      return;
    }
    addConfig({
      id: Number(setorId),
      data: { productId: Number(selectedProductToAdd) }
    });
  };

  // Função para remover produto da configuração
  const handleRemoveProductConfig = (productId: number) => {
    if (!setorId) return;
    Alert.alert(
      'Confirmar Remoção',
      'Tem certeza que deseja remover este produto da configuração do setor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeConfig({ id: Number(setorId), productId: productId })
        }
      ]
    );
  };

  // Lidar com erros da API
  useEffect(() => {
    if (setorError) {
      console.error('Erro ao buscar detalhes do setor:', setorError);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do setor.');
    }
  }, [setorError]);

  // Recarregar dados quando a tela receber foco
  useEffect(() => {
    const unsubscribe = router.addListener('focus', () => {
      if (!isLoadingUserCheck && setorId) {
        refetch();
      }
    });
    return unsubscribe;
  }, [router, refetch, isLoadingUserCheck, setorId]);

  if (isLoadingUserCheck || isLoadingSetor || isLoadingProducts) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando detalhes do setor...</Text>
      </View>
    );
  }

  if (!setor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Setor não encontrado.</Text>
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
        <Text style={styles.headerTitle}>Detalhes do Setor</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Informações do Setor */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Código:</Text>
            <Text style={styles.value}>{setor.code}</Text>
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
              <Text style={styles.value}>{setor.name}</Text>
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
              <Text style={styles.value}>{setor.description || 'Não especificada'}</Text>
            )}
          </View>

          {/* Datas */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Criado em:</Text>
            <Text style={styles.value}>{new Date(setor.createdAt).toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Atualizado em:</Text>
            <Text style={styles.value}>{new Date(setor.updatedAt).toLocaleDateString('pt-BR')}</Text>
          </View>

          {/* Botões de Edição/Remoção */}
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
              {isRemoving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.actionButtonText}>Remover Setor</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* Configuração do Setor (Produtos) */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Configuração de Produtos</Text>

          {/* Adicionar Produto */}
          <View style={styles.addConfigContainer}>
            <Text style={styles.label}>Adicionar Produto ao Setor:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedProductToAdd}
                onValueChange={(itemValue) => setSelectedProductToAdd(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione um produto..." value="" />
                {availableProducts.map((product) => (
                  <Picker.Item key={product.id} label={`${product.name} (${product.code})`} value={product.id.toString()} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity 
              style={[styles.actionButton, styles.addButton]} 
              onPress={handleAddProductConfig}
              disabled={isAddingConfig || !selectedProductToAdd}
            >
              {isAddingConfig ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.actionButtonText}>Adicionar</Text>}
            </TouchableOpacity>
          </View>

          {/* Lista de Produtos Configurados */}
          <Text style={styles.subSectionTitle}>Produtos Configurados:</Text>
          {setor.config && setor.config.length > 0 ? (
            <FlatList
              data={setor.config}
              keyExtractor={(item) => item.product.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.configItem}>
                  <Text style={styles.configItemText}>{item.product.name} ({item.product.code})</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveProductConfig(item.product.id)}
                    disabled={isRemovingConfig}
                  >
                    <Text style={styles.removeConfigText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false} // Disable scrolling for inner FlatList
            />
          ) : (
            <Text style={styles.emptyConfigText}>Nenhum produto configurado para este setor.</Text>
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
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
    marginTop: 16,
    marginBottom: 12,
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
  addButton: {
    backgroundColor: COLORS.primary,
    marginTop: 10,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  addConfigContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
  },
  configItemText: {
    fontSize: 16,
    color: COLORS.text?.primary || '#333',
  },
  removeConfigText: {
    color: COLORS.error || 'red',
    fontWeight: 'bold',
  },
  emptyConfigText: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SetorDetailScreen;

