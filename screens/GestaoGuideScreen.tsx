import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, PanResponder } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Suspense } from 'react';
import { Audio } from 'expo-av';
import { ClosedBook3D } from '@/components/book';
import { BookModal } from '@/components/BookModal';

const { width, height } = Dimensions.get('window');

// Conteúdo específico para o guia de gestores
const MANAGER_PAGES = [
  {
    id: '1',
    content: 'Bem-vindo ao Guia para Gestores',
    frontColor: '#EDE7F6',
    backColor: '#D1C4E9',
    contentImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978'
  },
  {
    id: '2',
    content: 'Capítulo 1: Liderança Estratégica',
    frontColor: '#FFEBEE',
    backColor: '#FFCDD2',
  },
  {
    id: '3',
    content: 'Capítulo 2: Gestão de Equipes',
    frontColor: '#E8F5E9',
    backColor: '#C8E6C9',
    contentImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
  },
  {
    id: '4',
    content: 'Capítulo 3: Planejamento Estratégico',
    frontColor: '#FFF8E1',
    backColor: '#FFECB3',
  },
  {
    id: '5',
    content: 'Capítulo 4: Gestão de Desempenho',
    frontColor: '#E0F2F1',
    backColor: '#B2DFDB',
    contentImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df'
  },
  {
    id: '6',
    content: 'Capítulo 5: Desenvolvimento de Lideranças',
    frontColor: '#F3E5F5',
    backColor: '#E1BEE7',
  },
  {
    id: '7',
    content: 'Obrigado por ler o Guia para Gestores',
    frontColor: '#E3F2FD',
    backColor: '#BBDEFB',
    contentImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
  },
];

export function GestaoGuideScreen({ onBack }) {
  const [bookRotation, setBookRotation] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [pageSound, setPageSound] = useState(null);
  const [enablePageSound, setEnablePageSound] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const rotationSpeedRef = useRef({ x: 0, y: 0 });
  const lastTranslationRef = useRef({ x: 0, y: 0 });
  const bookRef = useRef<ClosedBook3DRef>(null);

  // Carregar som de virar página
  useEffect(() => {
    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/page-flip.mp3')
        );
        setPageSound(sound);
      } catch (error) {
        console.log('Erro ao carregar som:', error);
      }
    }
    
    loadSound();
    
    return () => {
      if (pageSound) {
        pageSound.unloadAsync();
      }
    };
  }, []);

   const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          rotationSpeedRef.current = { x: 0, y: 0 };
        },
        onPanResponderMove: (_, gestureState) => {
          const { dx, dy, vx, vy } = gestureState;
          
          // Calcular rotação com base no movimento
          const rotationY = bookRotation.y - dx * 0.01;
          const rotationX = bookRotation.x + dy * 0.01;
          
          // Armazenar velocidade para inércia
          rotationSpeedRef.current = {
            x: vy * 0.0001,
            y: -vx * 0.0001
          };
          
          setBookRotation({ 
            x: Math.max(Math.min(rotationX, 0.5), -0.5),
            y: rotationY // Sem limites para rotação Y
          });
        },
        onPanResponderRelease: (_, gestureState) => {
          // Aplicar inércia com base na velocidade final
          rotationSpeedRef.current = {
            x: gestureState.vy * 0.0002,
            y: -gestureState.vx * 0.0002
          };
        }
      })
    ).current;

  // Função para abrir o modal do livro
  const handleOpenBook = () => {
    setShowModal(true);
    
    if (pageSound && enablePageSound) {
      try {
        pageSound.setPositionAsync(0);
        pageSound.playAsync();
      } catch (error) {
        console.log('Erro ao tocar som:', error);
      }
    }
  };
  
  // Função para fechar o modal do livro
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Função para lidar com a conclusão do livro
  const handleBookCompletion = () => {
    setShowModal(false);
    Alert.alert(
      "Guia Concluído",
      "Você concluiu o Guia para Gestores. Agora você está pronto para prosseguir!",
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );
  };
  
  // Aplicar inércia à rotação do livro
  useEffect(() => {
    let animationFrame;
    
    const applyInertia = () => {
      if (!isAutoRotating && !isDragging && 
          (Math.abs(rotationSpeedRef.current.x) > 0.0001 || 
           Math.abs(rotationSpeedRef.current.y) > 0.0001)) {
        
        setBookRotation(prev => ({
          x: Math.max(Math.min(prev.x + rotationSpeedRef.current.x, 0.5), -0.5),
          y: Math.max(Math.min(prev.y + rotationSpeedRef.current.y, 0.8), -0.8)
        }));
        
        // Aplicar fator de desaceleração
        rotationSpeedRef.current = {
          x: rotationSpeedRef.current.x * 0.95,
          y: rotationSpeedRef.current.y * 0.95
        };
        
        // Usar a referência do livro para rotação direta durante a inércia
        if (bookRef.current) {
          bookRef.current.rotateBook('x', rotationSpeedRef.current.x * 10);
          bookRef.current.rotateBook('y', rotationSpeedRef.current.y * 10);
        }
        
        animationFrame = requestAnimationFrame(applyInertia);
      }
    };
    
    animationFrame = requestAnimationFrame(applyInertia);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isAutoRotating, isDragging]);

  // Função para iniciar rotação automática do livro
  const startAutoRotation = () => {
    if (bookRef.current) {
      bookRef.current.startRotation('clockwise', 0.01);
      setIsAutoRotating(true);
    }
  };
  
  // Função para parar rotação automática do livro
  const stopAutoRotation = () => {
    if (bookRef.current) {
      bookRef.current.stopRotation();
      setIsAutoRotating(false);
    }
  };
  
  // Função para lidar com eventos de rotação do livro
  const handleBookRotation = (data) => {
    if (data.isRotating !== undefined) {
      setIsAutoRotating(data.isRotating);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Voltar para Seleção</Text>
      </TouchableOpacity>

      <View style={styles.contentWrapper}>
        {/* Título do livro */}
        <Text style={styles.title}>Guia para Gestores</Text>
        
        {/* Container do livro 3D fechado */}
        <View 
          style={styles.bookContainer}
          {...panResponder.panHandlers}
        >
          <Canvas
            gl={{ antialias: true }}
            camera={{ position: [0, 0, 4], fov: 45 }}
            shadows
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={0.8}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <ClosedBook3D
                ref={bookRef}
                bookRotation={bookRotation}
                coverFrontImage="https://images.unsplash.com/photo-1552664730-d307ca884978"
                coverBackImage="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
                coverFrontColor="#4527A0"
                coverBackColor="#222222"
                spineTitle="Guia para Gestores"
                spineColor="#1565C0"
                spineTextColor="#FFFFFF"
                spineEffects={{ emboss: true, metallic: true }}
                pagesCount={MANAGER_PAGES.length}
                pageWidth={1.28}
                pageHeight={1.71}
                pageDepth={0.01}
                onRotate={handleBookRotation}
              />
            </Suspense>
          </Canvas>
        </View>
        
        {/* Botões de controle de rotação */}
        <View style={styles.rotationControls}>
          <TouchableOpacity 
            style={[styles.rotationButton, isAutoRotating && styles.activeButton]}
            onPress={isAutoRotating ? stopAutoRotation : startAutoRotation}
          >
            <Text style={styles.rotationButtonText}>
              {isAutoRotating ? "Parar Rotação" : "Girar Livro"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Botão "Abrir Livro" abaixo do livro 3D */}
        <TouchableOpacity 
          style={styles.openButton}
          onPress={handleOpenBook}
        >
          <Text style={styles.openButtonText}>Abrir Livro</Text>
        </TouchableOpacity>
        
        {/* Instrução para interagir com o livro */}
        <Text style={styles.instructionText}>
          Toque e arraste para girar o livro
        </Text>
      </View>
      
      {/* Modal do livro com páginas */}
      <BookModal
        visible={showModal}
        onClose={handleCloseModal}
        pages={MANAGER_PAGES}
        bookTitle="Guia para Gestores"
        onComplete={handleBookCompletion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  bookContainer: {
    width: '100%',
    height: 400,
    marginBottom: 20,
  },
  rotationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rotationButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activeButton: {
    backgroundColor: '#F44336',
  },
  rotationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  openButton: {
    backgroundColor: '#4527A0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  openButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
