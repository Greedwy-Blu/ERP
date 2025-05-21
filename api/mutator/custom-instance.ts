import Axios, { 
  AxiosError, 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

const router = useRouter();
// Configura a URL base de acordo com o ambiente
const baseURL = Platform.select({
  android: 'http://10.0.2.2:3000', // Para Android emulador
  ios: 'http://localhost:3000',     // Para iOS emulador
  default: 'http://localhost:3000'  // Para dispositivos físicos
});

export const AXIOS_INSTANCE = Axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para adicionar o token JWT automaticamente
AXIOS_INSTANCE.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        // Adiciona o token no header com o prefixo Bearer
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('Request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
      return config;
    } catch (error) {
      console.error('Error getting token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento global de erros
AXIOS_INSTANCE.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Tratamento para token expirado/inválido
    if (error.response?.status === 401) {
      // Remove o token inválido do storage
      await AsyncStorage.removeItem('access_token');
      router.replace('/(login)/login')
    }
    
    return Promise.reject(error);
  }
);

// Função customizada para react-query
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();
  
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// Tipos para uso externo
export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;