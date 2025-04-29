import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const CompletionScreen = ({ visible, onClose, onContinue, bookTitle = 'Guia' }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4527A0', '#1565C0', '#0288D1']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Parabéns!</Text>
            <Text style={styles.subtitle}>Você concluiu a leitura do {bookTitle}</Text>
          </View>

          <View style={styles.imageContainer}>
            <MaterialIcons 
              name="emoji-events" 
              size={120} 
              color="#FFD700" 
            />
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Obrigado por dedicar seu tempo para ler este material. 
              Esperamos que as informações tenham sido úteis para o seu desenvolvimento.
            </Text>
            <Text style={styles.additionalInfo}>
              Você agora está pronto para aplicar esses conhecimentos no seu dia a dia.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.continueButton]} 
              onPress={onContinue}
            >
              <Text style={styles.buttonText}>Prosseguir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.closeButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: width * 0.9,
    maxWidth: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4527A0',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  imageContainer: {
    width: 150,
    height: 150,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: 30,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  additionalInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4527A0',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButton: {
    backgroundColor: '#4527A0',
  },
  closeButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});