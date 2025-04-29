import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert
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
import { useAuthControllerLogin } from '../../api/generated'; // Importar hook de autenticação
import { LoginDto } from '../../api/model'; // Importar tipo LoginDto

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  // Estados para os campos do formulário
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  
  // Hook de mutação para login
  const { mutate: login, isLoading } = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        // Verificar o tipo de usuário e redirecionar para a tela apropriada
        const userData = response.data;
        
        if (userData.tipo === 'gestor') {
          router.push('/(app)/gestor/GestorDashboard');
        } else if (userData.tipo === 'funcionario') {
          router.push('/(app)/funcionario/FuncionarioDashboard');
        } else {
          // Fallback para a tela de seleção de livro (antiga rota)
          router.push('/(home)/guide/livroSelecao');
        }
      },
      onError: (error) => {
        Alert.alert(
          'Erro de Login',
          error.message || 'Não foi possível fazer login. Verifique suas credenciais e tente novamente.'
        );
      }
    }
  });

  // Função para lidar com o login
  const handleLogin = () => {
    if (!codigo || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    // Criar objeto de login
    const loginData: LoginDto = {
      codigo,
      senha
    };

    // Chamar a API de login
    login({ data: loginData });
  };

  // Efeito de animação ao carregar
  React.useEffect(() => {
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
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Senha"
            placeholderTextColor="#9ACBD0"
            style={styles.input}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
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
  buttonDisabled: {
    backgroundColor: '#9ACBD0',
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
