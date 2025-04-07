import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function FastDeliveryScreen() {
  const handleOrderPress = () => {
    Alert.alert("Pedido realizado!", "Seu pedido está a caminho.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOLARIUM: Transformando dados {'\n'}em produtividade</Text>
      <Text style={styles.subtitle}>
      Com o SOLARIUM,,{'\n'} cada movimento na fábrica vira informação valiosa.
      </Text>

      <View style={styles.deliverySection}>
        <View style={styles.circleBackground}>
        <MaterialIcons 
              name="precision-manufacturing" 
              size={80} 
              color="#2d3748" 
            />
        </View>

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Azul claro muito suave (quase branco)
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2d3748', // Azul escuro/cinza para texto
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4a5568', // Cinza azulado
    marginBottom: 40,
    lineHeight: 20,
  },
  deliverySection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    backgroundColor: '#e2e8f0', // Cinza azulado claro
    width: 180,
    height: 250,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e0', // Borda sutil
  },
  deliveryMan: {
    width: 140,
    height: 180,
    marginBottom: -30,
  },
  orderButton: {
    marginTop: 30,
    backgroundColor: '#38a169', // Verde positivo
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#38a169',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});