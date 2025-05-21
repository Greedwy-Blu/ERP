import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Dimensions,
  ImageBackground
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  withSpring, 
  useAnimatedStyle, 
  runOnJS, 
  withTiming
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const CurvedSection = ({ children, backgroundColor = '#FFFFFF', curveColor = '#0A4F3C' }) => {
  return (
    <View style={[styles.sectionContainer, { backgroundColor }]}>
      {children}
      
      <Svg
        width={width}
        height={60}
        viewBox={`0 0 ${width} 60`}
        style={styles.sectionCurve}
      >
        <Path
          d={`M0,0 Q${width / 2},60 ${width},0 L${width},60 L0,60 Z`}
          fill={curveColor}
        />
      </Svg>
    </View>
  );
};

const SolariumApp = () => {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState('overview');
  const { width: windowWidth } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  
  // Animação do botão
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const buttonColor = useSharedValue('#4FD1C5');

  useFocusEffect(
    useCallback(() => {
      const resetAnimations = () => {
        translateX.value = 0;
        opacity.value = 1;
        buttonScale.value = 1;
        buttonColor.value = '#4FD1C5';
      };
      resetAnimations();
      return () => {};
    }, [])
  );

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    backgroundColor: buttonColor.value,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120
  }));

  const handlePress = () => {
    translateX.value = 0;
    opacity.value = 1;
    buttonScale.value = 1;
    buttonColor.value = '#4FD1C5';
    
    translateX.value = withSpring(-width, { damping: 5, stiffness: 100 });
    opacity.value = withSpring(0, { damping: 5, stiffness: 100 });

    buttonScale.value = withSpring(
      width / 50, 
      { damping: 5, stiffness: 100 },
      (finished) => {
        if (finished) {
          buttonColor.value = withTiming('#10B981');
          buttonScale.value = withSpring(
            height / 10, 
            { damping: 10, stiffness: 250 },
            (finished) => {
              if (finished) {
                runOnJS(router.replace)('/carregamento');
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
    <CurvedSection>
      <Text style={[styles.sectionTitle, { fontSize: responsiveStyles.fontSizeTitle }]}>
        O Desafio do Solarium
      </Text>
      <Text style={[styles.sectionText, { fontSize: responsiveStyles.fontSizeBase }]}>
      No ecossistema das indústrias metalúrgicas emergentes, a lacuna entre capacidade produtiva potencial e desempenho real persiste como desafio crítico. O Solarium surge como solução epistêmica, redefinindo os paradigmas do apontamento industrial através de uma abordagem sistêmica que integra:
         </Text>
      
      <Image
        source={require('@/assets/images/industria.jpg')}
        style={[styles.contentImage, { height: responsiveStyles.imageHeight }]}
        resizeMode="cover"
      />
      
      <Text style={[styles.sectionText, { fontSize: responsiveStyles.fontSizeBase }]}>
        Os apontamentos eram feitos em planilhas manuais, sujeitos a erros e atrasos. Foi então que nasceu o SOLARIUM — um Sistema de Apontamento de Produção Inteligente, desenvolvido para trazer transparência, eficiência e controle total sobre o chão de fábrica.
      </Text>
    </CurvedSection>
  );

  const SolutionSection = () => (
    <CurvedSection curveColor="#1E40AF">
      <Text style={[styles.sectionTitle, { fontSize: responsiveStyles.fontSizeTitle }]}>
        O Nascimento do SOLARIUM
      </Text>
      <Text style={[styles.sectionText, { fontSize: responsiveStyles.fontSizeBase }]}>
      O Solarium surgiu para resolver problemas comuns em indústrias metalúrgicas emergentes, como: </Text>
      
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
    </CurvedSection>
  );

  const HowItWorksSection = () => (
    <CurvedSection backgroundColor="#F8FAFC" curveColor="#10B981">
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
              Digite o codigo e sua no terminal ou aparelho que foi instaldo o SOLARIUM. O sistema identifica quem está operando e quais ordens de produção estão atribuídas a ele.
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
              Ao final do turno, o SOLARIUM gera relatórios de produtividade.
            </Text>
          </View>
        </View>
      </View>
    </CurvedSection>
  );

  const ImpactSection = () => (
    <CurvedSection curveColor="#115E59">
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
          "Trazer clareza, controle e confiança para as operações industriais por meio da tecnologia."
        </Text>
        <Text style={styles.testimonialAuthor}>
        Transformamos o apontamento de produção — muitas vezes ignorado ou tratado como burocracia — em uma fonte poderosa de verdade operacional.
        {'\n'}
        Porque no Solarium, apontar não é anotar — é enxergar.
        </Text>
      </View>
    </CurvedSection>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require('@/assets/images/background.png')}
          style={styles.fullBackground}
          resizeMode="cover"
        >
          <View style={styles.absoluteLogoContainer}>
            <View style={styles.iconCircle}>
              <Image 
                source={require('@/assets/images/logo-icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logoText}>SOLARIUM</Text>
          </View>

          

          <View style={styles.mainTextContainer}>
            <Text style={styles.mainTitle}>
              PRESERVANDO{'\n'}
              <Text style={{color: '#006A71'}}>HERANÇAS</Text>{'\n'}
              CONSTRUINDO{'\n'}
              FUTUROS.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.contentWrapper}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>BEM VINDO AO SOLARIUM</Text>
            <Image 
              source={require('@/assets/images/solorium-logo.png')}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeSubtitle}>GESTÃO DE APONTAMENTO{'\n'}ALIADA A VALORES INDUSTRIAIS</Text>
            <Text style={styles.welcomeText}>
              Potencialize sua gestão: nosso app simplifica processos e eleva a produtividade da sua equipe
            </Text>
          </View>

          <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            <Animated.View style={[styles.button, animatedButtonStyle]}>
              <Animated.Text style={[styles.buttonText, animatedTextStyle]}>
                INICIAR
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.navigation}>
            {['overview', 'solution', 'how-it-works', 'impact'].map((section) => (
              <TouchableOpacity 
                key={section}
                style={[styles.navButton, currentSection === section && styles.activeNavButton]}
                onPress={() => changeSection(section)}
              >
                <Text style={[styles.navButtonText, currentSection === section && styles.activeNavButtonText]}>
                  {section === 'overview' && 'Visão Geral'}
                  {section === 'solution' && 'A Solução'}
                  {section === 'how-it-works' && 'Como Funciona'}
                  {section === 'impact' && 'Resultados'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentSection === 'overview' && <OverviewSection />}
          {currentSection === 'solution' && <SolutionSection />}
          {currentSection === 'how-it-works' && <HowItWorksSection />}
          {currentSection === 'impact' && <ImpactSection />}

          <View style={styles.footer}>
            <Text style={styles.footerText}>SOLARIUM - Sistema de apontamento Industrial</Text>
            <Text style={styles.footerSubtext}>© 2025 Solaris Manufacturing</Text>
          </View>
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
  },
  fullBackground: {
    width: '100%',
    height: height * 0.9,
  },
  absoluteLogoContainer: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topTextContainer: {
    position: 'absolute',
    top: height * 0.05,
    right: width * 0.05,
    alignItems: 'flex-end',
    gap: 8,
  },
  mainTextContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionContainer: {
    position: 'relative',
    padding: 20,
    paddingBottom: 80,
    marginBottom: -40,
  },
  sectionCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  iconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 100,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  topText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  welcomeLogo: {
    width: 500,
    height: 200,
    marginVertical: 15,
  },
  welcomeTitle: {
    color: '#115E59',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    color: '#134E4A',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  welcomeText: {
    color: '#4B5563',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    marginVertical: 20,
    alignSelf: 'center',
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