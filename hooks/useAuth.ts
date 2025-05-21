import { useQuery } from '@tanstack/react-query';
import { AXIOS_INSTANCE } from '@/api/mutator/custom-instance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const validateToken = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return null;

    try {
      const response = await AXIOS_INSTANCE.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Token validation failed:', error);
      await AsyncStorage.removeItem('access_token');
      return null;
    }
  };

  return useQuery({
    queryKey: ['authValidation'],
    queryFn: validateToken,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
};