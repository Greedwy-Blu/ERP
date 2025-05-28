import { useQuery } from '@tanstack/react-query';
import { AXIOS_INSTANCE } from '@/api/mutator/custom-instance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useOrder = (orderNumber: string) => {
  const fetchOrder = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) throw new Error('Token de acesso não encontrado');

    try {
      const response = await AXIOS_INSTANCE.get(`/orders/${orderNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Falha ao buscar dados da ordem:', error);
      throw error; // Rejeita a promise para que o React Query possa lidar com o erro
    }
  };

  return useQuery({
    queryKey: ['order', orderNumber], // Chave única baseada no número da ordem
    queryFn: fetchOrder,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    enabled: !!orderNumber, // Só executa se orderNumber estiver definido
  });
};