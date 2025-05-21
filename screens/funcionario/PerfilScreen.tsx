import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/cor';
import { useFuncionarioControllerFindOne } from '@/api/generated';
import { Funcionario } from '@/api/model';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const PerfilScreen = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Buscar ID do usuário do armazenamento
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        const token = await AsyncStorage.getItem('access_token');
        const userRole = await AsyncStorage.getItem('user_role');
        
        if (!token || userRole !== 'funcionario') {
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
          return;
        }
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          console.error('ID do usuário não encontrado no armazenamento.');
          Alert.alert('Erro', 'ID do usuário não encontrado. Por favor, faça login novamente.');
          if (isMounted) {
            setTimeout(() => {
              router.replace('/(login)/login');
            }, 0);
          }
        }
      } catch (error) {
        console.error('Falha ao buscar ID do usuário do armazenamento:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do usuário. Por favor, faça login novamente.');
        if (isMounted) {
          setTimeout(() => {
            router.replace('/(login)/login');
          }, 0);
        }
      } finally {
        setIsLoadingUserId(false);
      }
    };

    fetchUserId();
  }, [router, isMounted]);

  // Buscar dados do perfil do usuário logado
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useFuncionarioControllerFindOne(
    userId!,
    {
      query: {
        queryKey: ['funcionario', userId],
        enabled: !!userId && isMounted,
      }
    }
  );

  const user: Funcionario | undefined = response?.data;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userRole');
      if (isMounted) {
        setTimeout(() => {
          router.replace('/(login)/login');
        }, 0);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer logout');
    }
  };

  if (isLoadingUserId || (isLoading && userId)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando seu perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Erro ao carregar perfil</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <FontAwesome5 name="user-slash" size={48} color={COLORS.gray} />
        <Text style={styles.emptyText}>Nenhuma informação de perfil encontrada.</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Fazer Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View 
        style={styles.header}
        entering={FadeInDown.duration(800).springify()}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=${COLORS.primary.replace('#', '')}&color=fff`
            }} 
            style={styles.avatar} 
            defaultSource={require('@/assets/images/logo-icon.png')}
          />
        </View>
        <Text style={styles.userName}>{user.nome}</Text>
        <Text style={styles.userCode}>{user.code}</Text>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={styles.infoCard}
        entering={FadeInRight.delay(300).duration(800).springify()}
      >
        <Text style={styles.sectionTitle}>
          <MaterialIcons name="person" size={20} color={COLORS.primary} /> Informações Pessoais
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{user.nome}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cargo:</Text>
          <Text style={styles.value}>{user.cargo || 'Não definido'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Código:</Text>
          <Text style={styles.value}>{user.code || 'Não definido'}</Text>
        </View>
        
        {user.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View 
        style={styles.infoCard}
        entering={FadeInRight.delay(600).duration(800).springify()}
      >
        <Text style={styles.sectionTitle}>
          <MaterialIcons name="work" size={20} color={COLORS.primary} /> Estatísticas
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.ordensCompletas || 0}</Text>
            <Text style={styles.statLabel}>Completas</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.ordensEmAndamento || 0}</Text>
            <Text style={styles.statLabel}>Andamento</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.produtividade ? `${user.produtividade}%` : '-'}
            </Text>
            <Text style={styles.statLabel}>Produtividade</Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
  },
  errorText: {
    marginTop: 12,
    color: COLORS.error || 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    position: 'relative',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  userCode: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  logoutText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
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
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text?.secondary || '#666',
  },
  value: {
    flex: 2,
    fontSize: 16,
    color: COLORS.text?.primary || '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.text?.secondary || '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default PerfilScreen;