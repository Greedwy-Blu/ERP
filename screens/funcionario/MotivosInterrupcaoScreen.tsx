import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Divider, List, FAB, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useGetMotivosInterrupcao, useCreateMotivoInterrupcao } from '@/hooks/api-hooks';
import Header from '@/components/header/index';
import {COLORS} from '@/constants/cor';

export default function MotivosInterrupcaoScreen() {
  const router = useRouter(); 
  const { data, isLoading: isLoadingAuth } = useAuth();
  
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Utilizando os hooks personalizados
  const { getMotivosInterrupcao } = useGetMotivosInterrupcao();
  const { createMotivoInterrupcao, isLoading: isCreating } = useCreateMotivoInterrupcao();

  useEffect(() => {
    fetchMotivos();
  }, []);

  const fetchMotivos = async () => {
    try {
      setLoading(true);
      const data = await getMotivosInterrupcao();
      setMotivos(data);
    } catch (error) {
      console.error('Erro ao buscar motivos de interrupção:', error);
      Alert.alert('Erro', 'Não foi possível carregar os motivos de interrupção.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'A descrição é obrigatória.');
      return;
    }

    setSubmitting(true);
    try {
      await createMotivoInterrupcao({ descricao });
      Alert.alert('Sucesso', 'Motivo de interrupção criado com sucesso!');
      setDescricao('');
      setShowForm(false);
      fetchMotivos();
    } catch (error) {
      console.error('Erro ao criar motivo de interrupção:', error);
      Alert.alert('Erro', 'Não foi possível criar o motivo de interrupção. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const isGestor = user?.role === 'funcionario';

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Motivos de Interrupção</Text>
            <Divider style={styles.divider} />
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando motivos de interrupção...</Text>
              </View>
            ) : motivos.length > 0 ? (
              <List.Section>
                {motivos.map((motivo) => (
                  <List.Item
                    key={motivo.id}
                    title={motivo.descricao}
                    left={() => <List.Icon icon="alert-circle" color={COLORS.primary} />}
                    style={styles.listItem}
                  />
                ))}
              </List.Section>
            ) : (
              <Text style={styles.emptyText}>Nenhum motivo de interrupção cadastrado.</Text>
            )}
          </Card.Content>
        </Card>
        
       
      </ScrollView>
      
      {isGestor && !showForm && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setShowForm(true)}
          color="#fff"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  formCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 16,
    color: '#64748b',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});
