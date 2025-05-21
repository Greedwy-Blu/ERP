import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useOrdersControllerListMotivosInterrupcao, useOrdersControllerAtualizarStatus } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OrdemUpdateStatusScreen = () => {
  const router = useRouter();
  const { orderId, action } = useLocalSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [selectedMotivoId, setSelectedMotivoId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch user ID from storage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');
        
        if (!token || userRole !== 'funcionario') {
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
          return;
        }
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          console.error('User ID not found in storage.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user ID from storage:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário. Por favor, faça login novamente.');
        if (isMounted) {
          setTimeout(() => {
            router.replace('/(login)/login');
          }, 0);
        }
      } finally {
        setIsLoadingUserId(false);
      }
    };

    fetchUserId();
  }, [router, isMounted]);

  // Fetch interruption reasons
  const { 
    data: motivosResponse, 
    isLoading: isLoadingMotivos, 
    error: motivosError,
    refetch 
  } = useOrdersControllerListMotivosInterrupcao({
    query: {
      queryKey: ['motivosInterrupcao', orderId],
      enabled: !isLoadingUserId && action === 'interrupt' && isMounted,
    }
  });
  const motivos = motivosResponse?.data || [];

  // Hook to update order status
  const { mutate: atualizarStatus, isLoading: isUpdatingStatus } = useOrdersControllerAtualizarStatus({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Status da ordem atualizado com sucesso.');
        if (isMounted) {
          router.back();
        }
      },
      onError: (error) => {
        console.error('Error updating order status:', error);
        const errorMessage = error.response?.data?.message || 'Não foi possível atualizar o status da ordem.';
        Alert.alert('Erro', errorMessage);
      }
    }
  });

  const handleUpdateStatus = () => {
    if (!isMounted || !orderId) return;

    if (action === 'interrupt') {
      if (!selectedMotivoId) {
        Alert.alert('Seleção Necessária', 'Por favor, selecione um motivo para a interrupção.');
        return;
      }
      atualizarStatus({
        id: Number(orderId),
        data: {
          status: 'interrompido',
          motivoId: selectedMotivoId,
          funcionarioId: userId // Include the employee who performed the action
        }
      });
    }
  };

  const handleCancel = () => {
    if (isMounted) {
      router.back();
    }
  };

  // Handle API errors
  useEffect(() => {
    if (motivosError) {
      console.error('Error fetching interruption reasons:', motivosError);
      Alert.alert('Erro', 'Não foi possível carregar os motivos de interrupção.');
    }
  }, [motivosError]);

  if (isLoadingUserId || (isLoadingMotivos && action === 'interrupt')) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {action === 'interrupt' ? 'Interromper Ordem' : 'Atualizar Status'} OP-{orderId}
        </Text>
      </View>

      <View style={styles.content}>
        {action === 'interrupt' ? (
          <>
            <Text style={styles.label}>Selecione o Motivo da Interrupção:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMotivoId}
                onValueChange={(itemValue) => setSelectedMotivoId(itemValue)}
                style={styles.picker}
                dropdownIconColor={COLORS.primary}
              >
                <Picker.Item label="-- Selecione um motivo --" value={null} />
                {motivos.map((motivo) => (
                  <Picker.Item 
                    key={motivo.id} 
                    label={motivo.descricao} 
                    value={motivo.id} 
                  />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                (!selectedMotivoId || isUpdatingStatus) && styles.buttonDisabled
              ]} 
              onPress={handleUpdateStatus}
              disabled={isUpdatingStatus || !selectedMotivoId}
            >
              {isUpdatingStatus ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Confirmar Interrupção</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.infoText}>Ação não suportada.</Text>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
          disabled={isUpdatingStatus}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text?.primary || '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: COLORS.text?.primary || '#333',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: COLORS.warning || '#FF9800',
  },
  cancelButton: {
    backgroundColor: COLORS.gray || '#9E9E9E',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default OrdemUpdateStatusScreen;