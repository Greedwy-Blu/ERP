import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

const TestScreen = ({ navigation }) => {
  // Testes para verificar a funcionalidade da aplicação
  const tests = [
    {
      id: 'auth',
      title: 'Autenticação',
      description: 'Testar login como gestor e funcionário',
      onPress: () => console.log('Teste de autenticação')
    },
    {
      id: 'gestor_nav',
      title: 'Navegação de Gestor',
      description: 'Testar navegação entre telas de gestor',
      onPress: () => console.log('Teste de navegação de gestor')
    },
    {
      id: 'funcionario_nav',
      title: 'Navegação de Funcionário',
      description: 'Testar navegação entre telas de funcionário',
      onPress: () => console.log('Teste de navegação de funcionário')
    },
    {
      id: 'dependency',
      title: 'Dependências',
      description: 'Testar bloqueio/desbloqueio de funcionalidades',
      onPress: () => console.log('Teste de dependências')
    },
    {
      id: 'ordem_flow',
      title: 'Fluxo de Ordem',
      description: 'Testar criação e atualização de ordens',
      onPress: () => console.log('Teste de fluxo de ordem')
    },
    {
      id: 'responsiveness',
      title: 'Responsividade',
      description: 'Testar layout em diferentes tamanhos de tela',
      onPress: () => console.log('Teste de responsividade')
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Testes da Aplicação</Text>
      <Text style={styles.subtitle}>Selecione um teste para executar</Text>

      {tests.map(test => (
        <TouchableOpacity
          key={test.id}
          style={styles.testItem}
          onPress={test.onPress}
        >
          <Text style={styles.testTitle}>{test.title}</Text>
          <Text style={styles.testDescription}>{test.description}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.resultSection}>
        <Text style={styles.sectionTitle}>Resultados dos Testes</Text>
        <Text style={styles.resultText}>Nenhum teste executado ainda.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  testItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  testDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  resultSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  }
});

export default TestScreen;
