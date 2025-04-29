import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuthControllerLogin } from '@/api/generated';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Usar o hook de login gerado pelo Orval
  const { mutate: login, isLoading: isLoginLoading } = useAuthControllerLogin({
    mutation: {
      onSuccess: async (response) => {
        const { data } = response;
        
        // Salvar token e informações do usuário
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('userRole', data.role);
        
        // Salvar ID do usuário baseado no papel
        if (data.role === 'funcionario' && data.funcionario) {
          await AsyncStorage.setItem('userId', data.funcionario.id.toString());
        } else if (data.role === 'gestor' && data.gestao) {
          await AsyncStorage.setItem('userId', data.gestao.id.toString());
        }
        
        // Redirecionar baseado no papel do usuário
        if (data.role === 'funcionario') {
          router.push('/(app_main)/funcionario/FuncionarioDashboard');
        } else if (data.role === 'gestor') {
          router.push('/(app_main)/gestor/GestorDashboard');
        } else {
          router.push('/(home)/guide/livroSelecao');
        }
        
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('Erro ao fazer login:', error);
        Alert.alert(
          'Erro de Autenticação',
          'Código ou senha incorretos. Por favor, tente novamente.'
        );
        setIsLoading(false);
      }
    }
  });

  const handleLogin = () => {
    if (!code || !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    
    // Chamar a mutação de login com os dados do formulário
    login({
      data: {
        code,
        password
      }
    });
  };

  useEffect(() => {
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    
    // Verificar se já existe um token válido
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userRole = await AsyncStorage.getItem('userRole');
        
        if (token) {
          // Configurar o token no axios para futuras requisições
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Redirecionar baseado no papel do usuário
          if (data.role === 'funcionario') {
            router.push('/(app_main)/funcionario/FuncionarioDashboard');
          } else if (data.role === 'gestor') {
            router.push('/(app_main)/gestor/GestorDashboard');
         } else {
            router.push('/(home)/guide/livroSelecao');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      }
    };
    
    checkToken();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Círculos decorativos ao fundo */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.circle, styles.circleTopLeft, animatedStyle]} />
        <Animated.View style={[styles.circle, styles.circleRightMid, animatedStyle]} />
        <Animated.View style={[styles.circle, styles.circleBottomLeft, animatedStyle]} />
        <Animated.View style={[styles.circle, styles.circleBottomRight, animatedStyle]} />
      </View>

      {/* Conteúdo principal e rodapé */}
      <View style={styles.main}>
        <View style={styles.content}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Sempre bom de ter de volta!</Text>

          <TextInput
            placeholder="Código"
            placeholderTextColor="#9ACBD0"
            style={styles.input}
            keyboardType="default"
            value={code}
            onChangeText={setCode}
          />

          <TextInput
            placeholder="Senha"
            placeholderTextColor="#9ACBD0"
            style={styles.input}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading || isLoginLoading}
          >
            {isLoading || isLoginLoading ? (
              <ActivityIndicator color="#F2EFE7" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.cancelText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EFE7',
  },
  main: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 48,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006A71',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#006A71',
  },
  button: {
    backgroundColor: '#006A71',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#F2EFE7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#48A6A7',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#F2EFE7',
    zIndex: 1,
  },
  footerText: {
    fontSize: 14,
    color: '#006A71',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#48A6A7',
  },

  // Círculos animados
  circle: {
    position: 'absolute',
  },
  circleTopLeft: {
    top: -height * 0.12,
    left: -width * 0.3,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#48A6A7',
    opacity: 0.8,
  },
  circleRightMid: {
    top: height * 0.3,
    right: -width * 0.2,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#006A71',
    opacity: 0.9,
  },
  circleBottomLeft: {
    bottom: -height * 0.08,
    left: -width * 0.25,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#9ACBD0',
    opacity: 0.7,
  },
  circleBottomRight: {
    bottom: -height * 0.1,
    right: -width * 0.15,
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: '#006A71',
    opacity: 0.6,
  },
});
