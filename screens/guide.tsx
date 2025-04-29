import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Switch } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Canvas } from '@react-three/fiber/native';
import { Suspense } from 'react';
import Experience from '@/components/experiencia';

const { width, height } = Dimensions.get('window');

export default function GuideScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'left' | 'right'>('right');
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bookRotation, setBookRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [enableDogEar, setEnableDogEar] = useState(false);
  const [enablePageSound, setEnablePageSound] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'double'>('single');
  
  // Referência para o último tempo de toque para detectar duplo toque
  const lastTapRef = useRef(0);

  useEffect(() => {
    setTimeout(() => {
      setIsBookOpen(true);
    }, 1000);
  }, []);

  const PAGES = [
    {
      id: '1',
      content: 'Bem-vindo ao Capítulo 1',
      frontColor: '#FF9AA2',
      backColor: '#FFB7B2',
      contentImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e'
    },
    {
      id: '2',
      content: 'Capítulo 2: A Jornada',
      frontColor: '#FFDAC1',
      backColor: '#E2F0CB',
    },
    {
      id: '3',
      content: 'Capítulo Final',
      frontColor: '#B5EAD7',
      backColor: '#C7CEEA',
      contentImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765'
    },
  ];

  const handlePageClick = (index: number) => {
    if (index === currentPage || isTurning || !isBookOpen) return;

    setIsTurning(true);
    setTurnDirection(index > currentPage ? 'right' : 'left');

    setTimeout(() => {
      setCurrentPage(index);
      setIsTurning(false);
    }, 800);
  };

  // Manipulador de gestos para virar páginas
  const onPageGestureEvent = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (isTurning || !isBookOpen) return;

    const { translationX } = nativeEvent;

    if (Math.abs(translationX) > 50) {
      if (translationX < 0 && currentPage < PAGES.length - 1) {
        setIsTurning(true);
        setTurnDirection('right');
        setTimeout(() => {
          setCurrentPage(currentPage + 1);
          setIsTurning(false);
        }, 800);
      } else if (translationX > 0 && currentPage > 0) {
        setIsTurning(true);
        setTurnDirection('left');
        setTimeout(() => {
          setCurrentPage(currentPage - 1);
          setIsTurning(false);
        }, 800);
      }
    }
  };

  // Manipulador de gestos para rotacionar o livro
  const onRotateGestureEvent = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY } = nativeEvent;
    // Mapear movimentos do toque para rotação (inverter Y para rotação natural)
    const rotationY = bookRotation.y - translationX * 0.01; // Rotação horizontal
    const rotationX = bookRotation.x + translationY * 0.01; // Rotação vertical
    setBookRotation({ x: rotationX, y: rotationY });
  };
  
  // Manipulador de gestos para zoom
  const onPinchGestureEvent = ({ nativeEvent }: PinchGestureHandlerGestureEvent) => {
    const { scale: pinchScale } = nativeEvent;
    setScale(Math.min(Math.max(0.5, pinchScale), 2.0)); // Limitar zoom entre 0.5x e 2.0x
  };
  
  // Manipulador para duplo toque (mostrar/esconder controles)
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setShowControls(!showControls);
    }
    
    lastTapRef.current = now;
  };
  
  // Função para folhear rápido várias páginas
  const handleQuickFlip = (direction: 'forward' | 'backward', pages: number = 3) => {
    if (isTurning || !isBookOpen) return;
    
    const flipInterval = 200; // ms entre cada virada
    let flippedPages = 0;
    
    const flipNext = () => {
      if (direction === 'forward' && currentPage + flippedPages < PAGES.length - 1) {
        setIsTurning(true);
        setTurnDirection('right');
        
        setTimeout(() => {
          setCurrentPage(prev => prev + 1);
          setIsTurning(false);
          flippedPages++;
          
          if (flippedPages < pages) {
            setTimeout(flipNext, flipInterval);
          }
        }, 300);
      } else if (direction === 'backward' && currentPage - flippedPages > 0) {
        setIsTurning(true);
        setTurnDirection('left');
        
        setTimeout(() => {
          setCurrentPage(prev => prev - 1);
          setIsTurning(false);
          flippedPages++;
          
          if (flippedPages < pages) {
            setTimeout(flipNext, flipInterval);
          }
        }, 300);
      }
    };
    
    flipNext();
  };
  
  // Alternar entre modo de página única e dupla
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'single' ? 'double' : 'single');
  };

  return (
    <View style={styles.container}>
      {/* Gestos de página, rotação e zoom aninhados */}
      <PanGestureHandler onGestureEvent={onPageGestureEvent}>
        <View style={styles.bookContainer}>
          <PanGestureHandler onGestureEvent={onRotateGestureEvent}>
            <View style={StyleSheet.absoluteFill}>
              <PinchGestureHandler onGestureEvent={onPinchGestureEvent}>
                <View style={StyleSheet.absoluteFill} onTouchEnd={handleDoubleTap}>
                  <Canvas
                    gl={{ antialias: true }}
                    camera={{ position: [0, 0, 4 / scale], fov: 45 }}
                    shadows
                  >
                    <Suspense fallback={null}>
                      <Experience
                        currentPage={currentPage}
                        isTurning={isTurning}
                        turnDirection={turnDirection}
                        isBookOpen={isBookOpen}
                        onPageClick={handlePageClick}
                        pages={PAGES}
                        pageWidth={viewMode === 'double' ? 1.8 : 1.28}
                        pageHeight={1.71}
                        pageDepth={0.01}
                        bookRotation={bookRotation}
                        coverFrontImage="https://images.unsplash.com/photo-1544947950-fa07a98d237f"
                        coverBackImage="https://images.unsplash.com/photo-1512820790803-83ca734da794"
                        spineTitle="Meu Livro 3D"
                        spineColor="#8B4513"
                        spineTextColor="#FFD700"
                        spineEffects={{ emboss: true, metallic: true }}
                      />
                    </Suspense>
                  </Canvas>
                </View>
              </PinchGestureHandler>
            </View>
          </PanGestureHandler>
        </View>
      </PanGestureHandler>

      {showControls && (
        <>
          <View style={styles.contentContainer}>
            <Text style={styles.pageText}>
              {PAGES[currentPage]?.content || 'Conteúdo não disponível'}
            </Text>
          </View>

          <View style={styles.navControls}>
            <TouchableOpacity
              style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
              onPress={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 0 || !isBookOpen}
            >
              <Text style={styles.buttonText}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              {currentPage + 1}/{PAGES.length}
            </Text>

            <TouchableOpacity
              style={[styles.navButton, currentPage === PAGES.length - 1 && styles.disabledButton]}
              onPress={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === PAGES.length - 1 || !isBookOpen}
            >
              <Text style={styles.buttonText}>Próxima</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.advancedControls}>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Dobra de página</Text>
              <Switch
                value={enableDogEar}
                onValueChange={setEnableDogEar}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={enableDogEar ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Som de página</Text>
              <Switch
                value={enablePageSound}
                onValueChange={setEnablePageSound}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={enablePageSound ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Modo de visualização</Text>
              <TouchableOpacity onPress={toggleViewMode} style={styles.modeButton}>
                <Text style={styles.modeButtonText}>
                  {viewMode === 'single' ? 'Página única' : 'Página dupla'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickFlipButtons}>
              <TouchableOpacity 
                style={[styles.quickFlipButton, currentPage <= 1 && styles.disabledButton]}
                onPress={() => handleQuickFlip('backward')}
                disabled={currentPage <= 1}
              >
                <Text style={styles.buttonText}>◄◄ Voltar rápido</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickFlipButton, currentPage >= PAGES.length - 2 && styles.disabledButton]}
                onPress={() => handleQuickFlip('forward')}
                disabled={currentPage >= PAGES.length - 2}
              >
                <Text style={styles.buttonText}>Avançar rápido ►►</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.helpText}>
              Dica: Toque duas vezes para esconder/mostrar controles
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  bookContainer: {
    height: height * 0.6,
    width: '100%',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  navControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#6200ee',
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pageIndicator: {
    fontSize: 16,
    color: '#666',
  },
  advancedControls: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
  },
  modeButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  modeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickFlipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  quickFlipButton: {
    backgroundColor: '#03a9f4',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  }
});