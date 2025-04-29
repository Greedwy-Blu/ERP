import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder, Modal } from 'react-native';
import { CompletionScreen } from './CompletionScreen';

const { width, height } = Dimensions.get('window');

// Componente do modal que simula um livro físico
export const BookModal = ({ visible, onClose, pages, bookTitle = 'Meu Livro', onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const pageFlip = new Animated.Value(0);
  
  // Resetar para a primeira página quando o modal é aberto
  useEffect(() => {
    if (visible) {
      setCurrentPage(0);
      setShowCompletionScreen(false);
    }
  }, [visible]);

  // Verificar se chegou à última página
  useEffect(() => {
    if (currentPage === pages.length - 1 && visible) {
      // Aguardar um momento para mostrar a tela de conclusão
      const timer = setTimeout(() => {
        setShowCompletionScreen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, pages.length, visible]);

  // Configurar o PanResponder para detectar gestos de arrastar para virar páginas
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (isFlipping) return;
      
      // Calcular o progresso da virada de página com base no arrasto horizontal
      const dragDistance = Math.min(Math.max(gestureState.dx, 0), width / 2);
      const flipProgress = dragDistance / (width / 2);
      pageFlip.setValue(flipProgress);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (isFlipping) return;
      
      // Se o arrasto for suficiente, virar a página
      if (gestureState.dx > 50 && currentPage > 0) {
        flipPageBackward();
      } else if (gestureState.dx < -50 && currentPage < pages.length - 1) {
        flipPageForward();
      } else {
        // Caso contrário, resetar a animação
        Animated.spring(pageFlip, {
          toValue: 0,
          friction: 10,
          tension: 40,
          useNativeDriver: false
        }).start();
      }
    }
  });

  // Função para virar para a próxima página
  const flipPageForward = () => {
    if (currentPage >= pages.length - 1 || isFlipping) return;
    
    setIsFlipping(true);
    
    Animated.timing(pageFlip, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false
    }).start(() => {
      setCurrentPage(currentPage + 1);
      pageFlip.setValue(0);
      setIsFlipping(false);
    });
  };

  // Função para voltar para a página anterior
  const flipPageBackward = () => {
    if (currentPage <= 0 || isFlipping) return;
    
    setIsFlipping(true);
    
    Animated.timing(pageFlip, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false
    }).start(() => {
      setCurrentPage(currentPage - 1);
      pageFlip.setValue(0);
      setIsFlipping(false);
    });
  };

  // Função para lidar com a conclusão do livro
  const handleCompletion = () => {
    setShowCompletionScreen(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Calcular a rotação da página com base no valor de animação
  const pageRotation = pageFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Calcular a opacidade da página atual e da próxima página
  const currentPageOpacity = pageFlip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 0]
  });

  const nextPageOpacity = pageFlip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });

  // Calcular a escala da página durante a animação para efeito 3D
  const pageScale = pageFlip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.95, 1]
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Tela de conclusão */}
        <CompletionScreen 
          visible={showCompletionScreen}
          onClose={onClose}
          onContinue={handleCompletion}
          bookTitle={bookTitle}
        />
        
        {/* Conteúdo do livro */}
        {!showCompletionScreen && (
          <View style={styles.bookContainer}>
            {/* Cabeçalho do livro */}
            <View style={styles.bookHeader}>
              <Text style={styles.bookTitle}>{bookTitle}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            {/* Conteúdo do livro */}
            <View style={styles.bookContent} {...panResponder.panHandlers}>
              {/* Página esquerda (fixa) */}
              <View style={styles.leftPage}>
                {currentPage > 0 ? (
                  <View style={styles.pageContent}>
                    <Text style={styles.pageNumber}>{currentPage}</Text>
                    <Text style={styles.pageText}>{pages[currentPage - 1].content}</Text>
                  </View>
                ) : (
                  <View style={styles.coverContent}>
                    <Text style={styles.coverText}>Abra o livro</Text>
                  </View>
                )}
              </View>
              
              {/* Página direita (que vira) */}
              <View style={styles.rightPageContainer}>
                <Animated.View
                  style={[
                    styles.rightPage,
                    {
                      opacity: currentPageOpacity,
                      transform: [
                        { perspective: 1200 },
                        { rotateY: pageRotation },
                        { scale: pageScale }
                      ]
                    }
                  ]}
                >
                  {currentPage < pages.length && (
                    <View style={styles.pageContent}>
                      <Text style={styles.pageNumber}>{currentPage + 1}</Text>
                      <Text style={styles.pageText}>{pages[currentPage].content}</Text>
                    </View>
                  )}
                </Animated.View>
                
                {/* Próxima página (verso da página atual) */}
                <Animated.View
                  style={[
                    styles.nextPage,
                    {
                      opacity: nextPageOpacity,
                      transform: [
                        { perspective: 1200 },
                        { rotateY: '180deg' },
                        { scale: pageScale }
                      ]
                    }
                  ]}
                >
                  {currentPage < pages.length - 1 && (
                    <View style={styles.pageContent}>
                      <Text style={styles.pageNumber}>{currentPage + 2}</Text>
                      <Text style={styles.pageText}>{pages[currentPage + 1].content}</Text>
                    </View>
                  )}
                </Animated.View>
              </View>
            </View>
            
            {/* Controles de navegação */}
            <View style={styles.navigationControls}>
              <TouchableOpacity
                style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
                onPress={flipPageBackward}
                disabled={currentPage === 0 || isFlipping}
              >
                <Text style={styles.navButtonText}>Anterior</Text>
              </TouchableOpacity>
              
              <Text style={styles.pageIndicator}>
                {currentPage + 1} / {pages.length}
              </Text>
              
              <TouchableOpacity
                style={[styles.navButton, currentPage === pages.length - 1 && styles.disabledButton]}
                onPress={flipPageForward}
                disabled={currentPage === pages.length - 1 || isFlipping}
              >
                <Text style={styles.navButtonText}>Próxima</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bookContainer: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: '#8B4513', // Cor marrom para simular capa de livro
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#6B3E26', // Cor mais escura para o cabeçalho
    borderBottomWidth: 2,
    borderBottomColor: '#5D341F',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5F5DC', // Cor bege para o texto
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5D341F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#F5F5DC',
    fontWeight: 'bold',
  },
  bookContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5DC', // Cor bege para o fundo das páginas
  },
  leftPage: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#DDD',
    backgroundColor: '#FFF',
    padding: 20,
  },
  rightPageContainer: {
    flex: 1,
    position: 'relative',
  },
  rightPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    backfaceVisibility: 'hidden',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#DDD',
  },
  nextPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    backfaceVisibility: 'hidden',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#DDD',
  },
  pageContent: {
    flex: 1,
    position: 'relative',
  },
  coverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 14,
    color: '#888',
  },
  pageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#6B3E26',
    borderTopWidth: 2,
    borderTopColor: '#5D341F',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#5D341F',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#8B7D6B',
    opacity: 0.5,
  },
  navButtonText: {
    color: '#F5F5DC',
    fontWeight: 'bold',
  },
  pageIndicator: {
    fontSize: 16,
    color: '#F5F5DC',
  },
});
