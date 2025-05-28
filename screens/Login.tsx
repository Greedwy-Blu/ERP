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
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuthControllerRegister, useAuthControllerLogin } from '@/api/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

type AppRoute =
  | '/(home)/funcionario/funcionariodashboard'
  | '/(home)/gestor/gestordashboard';

export default function LoginScreen() {
  const router = useRouter();
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Configuração dos hooks de API
  const { mutate: register } = useAuthControllerRegister({
    mutation: {
      onError: (error) => {
        setIsLoading(false);
        Alert.alert(
          'Erro no Registro',
          error.response?.data?.message || 'Erro ao criar conta. Verifique seu código.'
        );
      },
    },
  });

  const { mutate: login } = useAuthControllerLogin({
    mutation: {
      onSuccess: async (response) => {
        try {
          await AsyncStorage.multiSet([
            ['access_token', response.access_token],
            ['user_role', response.role || ''],
            ['user_id', response.sub],
            ['user_code', response.code],
          ]);

          // Redireciona conforme o tipo de usuário
          const routeMap: Record<string, AppRoute> = {
            funcionario: '/(home)/funcionario/funcionariodashboard',
            gestao: '/(home)/gestor/gestordashboard',
          };

          if (response.role && routeMap[response.role]) {
            router.replace(routeMap[response.role]);
          }
        } catch (error) {
          console.error('Erro ao salvar dados:', error);
          Alert.alert('Erro', 'Não foi possível completar o login.');
        } finally {
          setIsLoading(false);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        Alert.alert(
          'Erro no Login',
          error.response?.data?.message || 'Credenciais inválidas. Tente novamente.'
        );
      },
    },
  });

  const handleRegisterAndLogin = async () => {
    if (!code.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      // Primeiro faz o registro
      await register({
        data: {
          code: code.trim(),
          password: password.trim(),
        },
      });

      // Depois faz o login automaticamente
      await login({
        data: {
          code: code.trim(),
          password: password.trim(),
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Erro no processo:', error);
    }
  };

  const handleSimpleLogin = async () => {
    if (!code.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

     try {
      // Primeiro faz o registro
      await register({
        data: {
          code: code.trim(),
          password: password.trim(),
        },
      });

      // Depois faz o login automaticamente
      await login({
        data: {
          code: code.trim(),
          password: password.trim(),
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Erro no processo:', error);
    }
  };

  // Animações
  useEffect(() => {
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.circle, styles.circleTopLeft, animatedStyle]} />
        <Animated.View style={[styles.circle, styles.circleRightMid, animatedStyle]} />
        <Animated.View style={[styles.circle, styles.circleBottomLeft, animatedStyle]} />
        <Animated.View style={[styles.circle, styles.circleBottomRight, animatedStyle]} />
      </View>

      <View style={styles.main}>
        <View style={styles.content}>
          <Text style={styles.title}>{isRegistering ? 'Registro' : 'Login'}</Text>
          
          <TextInput
            placeholder="Código"
            placeholderTextColor="#9ACBD0"
            style={styles.input}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Senha"
            placeholderTextColor="#9ACBD0"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={isRegistering ? handleRegisterAndLogin : handleSimpleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#F2EFE7" />
            ) : (
              <Text style={styles.buttonText}>
               Entrar
              </Text>
            )}
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