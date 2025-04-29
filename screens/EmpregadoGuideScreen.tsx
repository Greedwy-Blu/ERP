import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, PanResponder } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Suspense } from 'react';
import { Audio } from 'expo-av';
import { ClosedBook3D } from '@/components/book';
import { BookModal } from '@/components/BookModal';
import { Asset } from 'expo-asset';

const { width, height } = Dimensions.get('window');
// Conteúdo específico para o guia de funcionários
const EMPLOYEE_PAGES = [
  {
    id: '1',
    content: 'Bem-vindo ao Guia para Funcionários',
    frontColor: '#E3F2FD',
    backColor: '#BBDEFB',
    contentImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'
  },
  {
    id: '2',
    content: 'Capítulo 1: Introdução à Empresa',
    frontColor: '#E8F5E9',
    backColor: '#C8E6C9',
  },
  {
    id: '3',
    content: 'Capítulo 2: Políticas e Procedimentos',
    frontColor: '#FFF3E0',
    backColor: '#FFECB3',
    contentImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173'
  },
  {
    id: '4',
    content: 'Capítulo 3: Benefícios e Direitos',
    frontColor: '#F3E5F5',
    backColor: '#E1BEE7',
  },
  {
    id: '5',
    content: 'Capítulo 4: Desenvolvimento Profissional',
    frontColor: '#E0F7FA',
    backColor: '#B2EBF2',
    contentImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'
  },
  {
    id: '6',
    content: 'Obrigado por ler o Guia para Funcionários',
    frontColor: '#E8EAF6',
    backColor: '#C5CAE9',
  },
];


export function EmpregadoGuideScreen({ onBack }: { onBack: () => void }) {
  const [bookRotation, setBookRotation] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [pageSound, setPageSound] = useState<Audio.Sound | null>(null);
  const [enablePageSound] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  

  const rotationSpeedRef = useRef({ x: 0, y: 0 });
  const lastTranslationRef = useRef({ x: 0, y: 0 });
  const bookRef = useRef<ClosedBook3DRef>(null);

  

  // Configurar PanResponder
  // Configurar PanResponder para rotação
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

  // Efeito de inércia
  useEffect(() => {
    let animationFrame;
    
    const applyInertia = () => {
      if (Math.abs(rotationSpeedRef.current.x) > 0.0001 || 
          Math.abs(rotationSpeedRef.current.y) > 0.0001) {
        
        setBookRotation(prev => ({
          x: Math.max(Math.min(prev.x + rotationSpeedRef.current.x, 0.5), -0.5),
          y: prev.y + rotationSpeedRef.current.y
        }));
        
        // Reduzir velocidade gradualmente
        rotationSpeedRef.current = {
          x: rotationSpeedRef.current.x * 0.95,
          y: rotationSpeedRef.current.y * 0.95
        };
        
        animationFrame = requestAnimationFrame(applyInertia);
      }
    };
    
    animationFrame = requestAnimationFrame(applyInertia);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Funções para rotação automática
 

  // Função para resetar a rotação e zoom
  const resetView = () => {
    setBookRotation({ x: 0, y: 0 });
    setScale(1);
    rotationSpeedRef.current = { x: 0, y: 0 };
  };
  const handleOpenBook = () => {
    setShowModal(true);
    if (pageSound && enablePageSound) {
      pageSound.replayAsync().catch(error => console.log('Erro ao tocar som:', error));
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleBookCompletion = () => {
    setShowModal(false);
    Alert.alert(
      "Guia Concluído",
      "Você concluiu o Guia para Funcionários. Agora você está pronto para prosseguir!",
      [{ text: "OK" }]
    );
  };

  // Efeito de inércia
  useEffect(() => {
    let animationFrame: number;
    
    const applyInertia = () => {
      if (!isAutoRotating && !isDragging && 
          (Math.abs(rotationSpeedRef.current.x) > 0.0001 || 
           Math.abs(rotationSpeedRef.current.y) > 0.0001)) {
        
        setBookRotation(prev => ({
          x: Math.max(Math.min(prev.x + rotationSpeedRef.current.x, 0.5), -0.5),
          y: prev.y + rotationSpeedRef.current.y
        }));
        
        rotationSpeedRef.current = {
          x: rotationSpeedRef.current.x * 0.95,
          y: rotationSpeedRef.current.y * 0.95
        };
        
        if (bookRef.current) {
          bookRef.current.rotateBook('x', rotationSpeedRef.current.x * 10);
          bookRef.current.rotateBook('y', rotationSpeedRef.current.y * 10);
        }
        
        animationFrame = requestAnimationFrame(applyInertia);
      }
    };
    
    animationFrame = requestAnimationFrame(applyInertia);
    return () => cancelAnimationFrame(animationFrame);
  }, [isAutoRotating, isDragging]);

  const startAutoRotation = () => {
    if (bookRef.current) {
      bookRef.current.startRotation('clockwise', 0.005);
      setIsAutoRotating(true);
    }
  };
  
  const stopAutoRotation = () => {
    if (bookRef.current) {
      bookRef.current.stopRotation();
      setIsAutoRotating(false);
      rotationSpeedRef.current = { x: 0, y: 0 };
    }
  };
  
  const handleBookRotation = (data: { isRotating?: boolean }) => {
    if (data.isRotating !== undefined) {
      setIsAutoRotating(data.isRotating);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Voltar para Seleção</Text>
      </TouchableOpacity>

      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Guia para Funcionários</Text>
        
        <View style={styles.bookContainer} {...panResponder.panHandlers}>
          <Canvas gl={{ antialias: true }} camera={{ position: [0, 0, 4], fov: 45 }} shadows>
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
                coverFrontImage="https://i.imgur.com/MDJ7K0r.jpg"
                coverBackImage="https://i.imgur.com/ldypEkP.jpg"
                coverFrontColor="#1565C0"
                coverBackColor="#222222"
                spineTitle="Guia para Funcionários"
                spineColor="#1565C0"
                spineTextColor="#FFFFFF"
                spineEffects={{ emboss: true, metallic: true }}
                pagesCount={EMPLOYEE_PAGES.length}
                pageWidth={1.28}
                pageHeight={1.71}
                pageDepth={0.01}
                onRotate={handleBookRotation}
              />
            </Suspense>
          </Canvas>
        </View>
        
        <View style={styles.rotationControls}>
          <TouchableOpacity 
            style={[styles.rotationButton, isAutoRotating && styles.activeButton]}
            onPress={isAutoRotating ? stopAutoRotation : startAutoRotation}
            activeOpacity={0.7}
          >
            <Text style={styles.rotationButtonText}>
              {isAutoRotating ? "⏹ Parar Rotação" : "🔄 Girar Livro"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.openButton} onPress={handleOpenBook}>
          <Text style={styles.openButtonText}>Abrir Livro</Text>
        </TouchableOpacity>
        
        <Text style={styles.instructionText}>Toque e arraste para girar o livro</Text>
        
      </View>
      
      <BookModal
        visible={showModal}
        onClose={handleCloseModal}
        pages={EMPLOYEE_PAGES}
        bookTitle="Guia para Funcionários"
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
    backgroundColor: '#1565C0',
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