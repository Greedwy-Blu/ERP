import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Dimensions
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  withSpring, 
  useAnimatedStyle, 
  runOnJS 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SolariumApp = () => {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState('overview');
  const { width: windowWidth } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  
  // Animação do botão
  
  // Valores animados
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const buttonScaleX = useSharedValue(1);
  const buttonScaleY = useSharedValue(1);

  // Estilos animados
  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: buttonScaleX.value },
      { scaleY: buttonScaleY.value }
    ]
  }));

  const handlePress = () => {
    // 1ª fase: animação do texto
    translateX.value = withSpring(-width, { 
      damping: 5, 
      stiffness: 100 
    });
    opacity.value = withSpring(0, { 
      damping: 5, 
      stiffness: 100 
    });

    // 2ª fase: animação do botão
    buttonScaleX.value = withSpring(
      width / 50, 
      { damping: 5, stiffness: 100 }, 
      (finished) => {
        if (finished) {
          // 3ª fase: animação final
          buttonScaleY.value = withSpring(
            height / 10, 
            { damping: 10, stiffness: 250 }, 
            (finished) => {
              if (finished) {
                runOnJS(router.push)('/carregamento');
              }
            }
          );
        }
      }
    );
  };

  // Ajustes responsivos
  const responsiveStyles = {
    paddingHorizontal: windowWidth > 768 ? 40 : 24,
    paddingVertical: windowWidth > 768 ? 32 : 24,
    fontSizeTitle: windowWidth > 768 ? 32 : 26,
    fontSizeSubtitle: windowWidth > 768 ? 20 : 18,
    fontSizeBase: windowWidth > 768 ? 18 : 16,
    spacingLarge: windowWidth > 768 ? 32 : 24,
    imageHeight: windowWidth > 768 ? 300 : 200,
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const changeSection = (section) => {
    setCurrentSection(section);
    scrollToTop();
  };

  const OverviewSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { fontSize: responsiveStyles.fontSizeTitle }]}>
        O Desafio da Solaris Manufacturing
      </Text>
      <Text style={[styles.sectionText, { fontSize: responsiveStyles.fontSizeBase }]}>
        No coração de uma grande indústria metalúrgica, a Solaris Manufacturing enfrentava um problema crítico: a falta de visibilidade em tempo real sobre a produção. Os gestores não sabiam exatamente quantas peças estavam sendo produzidas, onde os gargalos ocorriam ou quais funcionários estavam mais produtivos.
      </Text>
      
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988' }}
        style={[styles.contentImage, { height: responsiveStyles.imageHeight }]}
        resizeMode="cover"
      />
      
      <Text style={[styles.sectionText, { fontSize: responsiveStyles.fontSizeBase }]}>
        Os apontamentos eram feitos em planilhas manuais, sujeitos a erros e atrasos. Foi então que nasceu o SOLARIUM — um Sistema de Apontamento de Produção Inteligente, desenvolvido para trazer transparência, eficiência e controle total sobre o chão de fábrica.
      </Text>
    </View>
  );

  const SolutionSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { fontSize: responsiveStyles.fontSizeTitle }]}>
        O Nascimento do SOLARIUM
      </Text>
      <Text style={[styles.sectionText, { fontSize: responsiveStyles.fontSizeBase }]}>
        A Solaris Manufacturing contratou uma equipe de especialistas em automação industrial para criar uma solução que eliminasse os problemas de rastreamento. O desafio era grande:
      </Text>
      
      <View style={styles.bulletList}>
        <View style={styles.bulletItem}>
          <Ionicons name="md-arrow-forward" size={16} color="#10B981" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { fontSize: responsiveStyles.fontSizeBase }]}>
            Dados descentralizados: Cada setor usava um método diferente para registrar produção.
          </Text>
        </View>
        
        <View style={styles.bulletItem}>
          <Ionicons name="md-arrow-forward" size={16} color="#10B981" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { fontSize: responsiveStyles.fontSizeBase }]}>
            Atrasos na informação: Os relatórios demoravam dias para serem consolidados.
          </Text>
        </View>
        
        <View style={styles.bulletItem}>
          <Ionicons name="md-arrow-forward" size={16} color="#10B981" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { fontSize: responsiveStyles.fontSizeBase }]}>
            Falta de responsabilidade: Era difícil identificar quem havia realizado qual etapa.
          </Text>
        </View>
      </View>
      
      <Text style={[styles.sectionText, { fontSize: responsiveStyles.fontSizeBase }]}>
        A equipe decidiu construir o SOLARIUM com base em três pilares:
      </Text>
      
      <View style={styles.pillarsContainer}>
        <View style={styles.pillar}>
          <MaterialIcons name="access-time" size={32} color="#1E40AF" />
          <Text style={styles.pillarTitle}>Apontamento em Tempo Real</Text>
          <Text style={styles.pillarText}>Leitores de QR Code em máquinas e estações de trabalho</Text>
        </View>
        
        <View style={styles.pillar}>
          <MaterialIcons name="timeline" size={32} color="#1E40AF" />
          <Text style={styles.pillarTitle}>Rastreamento de Etapas</Text>
          <Text style={styles.pillarText}>Cada OP com etapas pré-definidas e registro detalhado</Text>
        </View>
        
        <View style={styles.pillar}>
          <MaterialIcons name="assessment" size={32} color="#1E40AF" />
          <Text style={styles.pillarTitle}>Gestão de Indicadores</Text>
          <Text style={styles.pillarText}>Dashboard em tempo real com alertas automáticos</Text>
        </View>
      </View>
    </View>
  );

  const HowItWorksSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { fontSize: responsiveStyles.fontSizeTitle }]}>
        Como o SOLARIUM Funciona?
      </Text>
      
      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>O Operador Chega ao Posto de Trabalho</Text>
            <Text style={styles.stepText}>
              Escaneia seu crachá (RFID ou QR Code) no terminal SOLARIUM. O sistema identifica quem está operando e quais ordens de produção estão atribuídas a ele.
            </Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Início da Etapa</Text>
            <Text style={styles.stepText}>
              O funcionário seleciona a OP (Ordem de Produção) e a etapa (ex.: "Corte"). O sistema registra o horário de início e vincula ao operador.
            </Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Registro de Produção</Text>
            <Text style={styles.stepText}>
              Ao finalizar uma etapa, o operador informa: quantidade produzida, peças com defeito (e motivo) e tempo gasto.
            </Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Acompanhamento em Tempo Real</Text>
            <Text style={styles.stepText}>
              O supervisor vê no painel: progresso das OPs, eficiência por funcionário/setor e principais causas de perda.
            </Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>5</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Relatórios Automatizados</Text>
            <Text style={styles.stepText}>
              Ao final do turno, o SOLARIUM gera relatórios de produtividade, análise de gargalos e sugestões de melhorias.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const ImpactSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { fontSize: responsiveStyles.fontSizeTitle }]}>
        Impacto do SOLARIUM na Solaris Manufacturing
      </Text>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultItem}>
          <MaterialIcons name="speed" size={32} color="#10B981" />
          <Text style={styles.resultText}>Redução de 30% no tempo de produção</Text>
        </View>
        
        <View style={styles.resultItem}>
          <MaterialIcons name="warning" size={32} color="#10B981" />
          <Text style={styles.resultText}>Controle preciso de desperdícios</Text>
        </View>
        
        <View style={styles.resultItem}>
          <MaterialIcons name="account-circle" size={32} color="#10B981" />
          <Text style={styles.resultText}>Maior responsabilidade dos operadores</Text>
        </View>
        
        <View style={styles.resultItem}>
          <MaterialIcons name="insights" size={32} color="#10B981" />
          <Text style={styles.resultText}>Tomada de decisão ágil</Text>
        </View>
      </View>
      
      <View style={styles.testimonial}>
        <Text style={styles.testimonialText}>
          "Antes, a produção era uma caixa-preta. Agora, com o SOLARIUM, temos controle total."
        </Text>
        <Text style={styles.testimonialAuthor}>
          — Carlos Mendes, Supervisor de Produção da Solaris
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContainer,
          { 
            paddingHorizontal: responsiveStyles.paddingHorizontal,
            paddingVertical: responsiveStyles.paddingVertical
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
            <Image 
            source={require('@/assets/images/logo-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />  </View>
            <Text style={styles.logoText}>SOLARIUM</Text>
          </View>
        </View>

        {/* Seção de Boas-Vindas */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>BEM VINDO AO SOLARIUM</Text>
          <Image 
            source={require('@/assets/images/logo-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.welcomeSubtitle}>O SEU SISTEMA DE APONTAMENTO</Text>
          <Text style={styles.welcomeText}>
            Potencialize sua gestão: nosso app simplifica processos e eleva a produtividade da sua equipe
          </Text>
        </View>

        {/* Botão Animado */}
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <Animated.View style={[styles.button, animatedButtonStyle]}>
            <Animated.Text style={[styles.buttonText, animatedTextStyle]}>
              INICIAR
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Navegação */}
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={[styles.navButton, currentSection === 'overview' && styles.activeNavButton]}
            onPress={() => changeSection('overview')}
          >
            <Text style={[styles.navButtonText, currentSection === 'overview' && styles.activeNavButtonText]}>Visão Geral</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, currentSection === 'solution' && styles.activeNavButton]}
            onPress={() => changeSection('solution')}
          >
            <Text style={[styles.navButtonText, currentSection === 'solution' && styles.activeNavButtonText]}>A Solução</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, currentSection === 'how-it-works' && styles.activeNavButton]}
            onPress={() => changeSection('how-it-works')}
          >
            <Text style={[styles.navButtonText, currentSection === 'how-it-works' && styles.activeNavButtonText]}>Como Funciona</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, currentSection === 'impact' && styles.activeNavButton]}
            onPress={() => changeSection('impact')}
          >
            <Text style={[styles.navButtonText, currentSection === 'impact' && styles.activeNavButtonText]}>Resultados</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo Principal */}
        {currentSection === 'overview' && <OverviewSection />}
        {currentSection === 'solution' && <SolutionSection />}
        {currentSection === 'how-it-works' && <HowItWorksSection />}
        {currentSection === 'impact' && <ImpactSection />}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SOLARIUM - Sistema de Gestão Industrial</Text>
          <Text style={styles.footerSubtext}>© 2023 Solaris Manufacturing</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
   
    borderRadius: 20,
    padding: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 24,
    letterSpacing: 1,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  welcomeTitle: {
    color: '#115E59',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  welcomeSubtitle: {
    color: '#134E4A',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#4B5563',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  animatedButton: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E40AF',
  },
  navButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  activeNavButtonText: {
    color: '#1E40AF',
  },
  sectionContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 32,
  },
  sectionText: {
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
  },
  bulletList: {
    marginBottom: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  bulletText: {
    color: '#4B5563',
    flex: 1,
    lineHeight: 24,
  },
  pillarsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  pillar: {
    width: '30%',
    minWidth: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  pillarTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 12,
    textAlign: 'center',
  },
  pillarText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    backgroundColor: '#1E40AF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepText: {
    color: '#4B5563',
    lineHeight: 24,
  },
  resultsContainer: {
    marginBottom: 32,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultText: {
    color: '#1F2937',
    marginLeft: 16,
    fontWeight: '600',
    fontSize: 16,
  },
  testimonial: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 24,
    marginTop: 32,
  },
  testimonialText: {
    fontStyle: 'italic',
    color: '#1F2937',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontWeight: '600',
    color: '#6B7280',
  },
  contentImage: {
    width: '100%',
    borderRadius: 12,
    marginVertical: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 8,
  },
  footerSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

export default SolariumApp;