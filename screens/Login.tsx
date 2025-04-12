import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity // Add this import
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  withDelay
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // Valores animados
  const titlePosition = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const inputScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);

  // Estilos animados
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: titlePosition.value }],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitleOpacity.value,
    };
  });

  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }],
      borderBottomColor: isFocused 
        ? withTiming('#007AFF', { duration: 300 })
        : withTiming('#DDD', { duration: 300 }),
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [
        {
          translateY: interpolate(
            buttonOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  // Animação ao montar o componente
  React.useEffect(() => {
    titlePosition.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });
  
    subtitleOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.exp),
      })
    );
  
    inputScale.value = withDelay(
      300,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      })
    );
  
    buttonOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      })
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <Text style={styles.time}>9:41</Text>
        </View>

        <View style={styles.content}>
          <Animated.Text style={[styles.title, titleAnimatedStyle]}>
            Login
          </Animated.Text>
          
          <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
            Good to see you back!
          </Animated.Text>
          
          <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
            <Text style={styles.inputLabel}>Email</Text>
            <AnimatedTextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </Animated.View>

          <View style={styles.buttonContainer}>
            <AnimatedTouchableOpacity 
              style={[
                styles.button, 
                !email && styles.buttonDisabled,
                buttonAnimatedStyle
              ]}
              disabled={!email}
              onPress={() => router.push('/')}
            >
              <Text style={styles.buttonText}>Next</Text>
            </AnimatedTouchableOpacity>

            <AnimatedTouchableOpacity 
              style={[styles.cancelButton, buttonAnimatedStyle]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </AnimatedTouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    marginTop: -100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    color: '#000',
    height: 40,
    paddingVertical: 0,
  },
  buttonContainer: {
    marginTop: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#A7C7FF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;