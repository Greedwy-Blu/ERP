import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Picker } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useOrdersControllerListMotivosInterrupcao, useOrdersControllerAtualizarStatus } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OrdemUpdateStatusScreen = () => {
  const router = useRouter();
  const { orderId, action } = useLocalSearchParams(); // action can be 'interrupt'
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [selectedMotivoId, setSelectedMotivoId] = useState<number | null>(null);

  // Fetch user ID from storage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('accessToken');
        
        if (!token) {
          router.replace('/(login)/login');
          return;
        }
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          console.error('User ID not found in storage.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          router.replace('/(login)/login');
        }
      } catch (error) {
        console.error('Failed to fetch user ID from storage:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário. Por favor, faça login novamente.');
        router.replace('/(login)/login');
      } finally {
        setIsLoadingUserId(false);
      }
    };

    fetchUserId();
  }, [router]);

  // Fetch interruption reasons
  const { data: motivosResponse, isLoading: isLoadingMotivos, error: motivosError } = useOrdersControllerListMotivosInterrupcao({
    query: {
      enabled: !isLoadingUserId && action === 'interrupt', // Only fetch if interrupting
    }
  });
  const motivos = motivosResponse?.data || [];

  // Hook to update order status
  const { mutate: atualizarStatus, isLoading: isUpdatingStatus } = useOrdersControllerAtualizarStatus({
    mutation: {
      onSuccess: () => {
        Alert.alert('Sucesso', 'Status da ordem atualizado com sucesso.');
        router.back(); // Go back to the previous screen (Order Detail)
      },
      onError: (error) => {
        console.error('Error updating order status:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o status da ordem.');
      }
    }
  });

  // Handle status update submission
  const handleUpdateStatus = () => {
    if (!orderId) return;

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
        }
      });
    } 
    // Add other actions if needed
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
        <Text style={styles.headerTitle}>Atualizar Status da Ordem OP-{orderId}</Text>
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
              >
                <Picker.Item label="-- Selecione um motivo --" value={null} />
                {motivos.map((motivo) => (
                  <Picker.Item key={motivo.id} label={motivo.descricao} value={motivo.id} />
                ))}
              </Picker>
            </View>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
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
          onPress={() => router.back()}
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text?.primary || '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
    width: '100%',
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
