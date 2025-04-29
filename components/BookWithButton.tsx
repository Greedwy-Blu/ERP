import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Suspense } from 'react';
import { ClosedBook3D } from './book';
import { BookModal } from './BookModal';

const { width, height } = Dimensions.get('window');

// Componente que exibe o livro 3D fechado com botão "Abrir Livro" abaixo
export const BookWithButton = ({ 
  bookTitle = 'Meu Livro',
  coverFrontImage,
  coverBackImage,
  coverFrontColor = '#4527A0',
  coverBackColor = '#222222',
  spineColor = '#1565C0',
  spineTextColor = '#FFFFFF',
  pages = []
}) => {
  const [bookRotation, setBookRotation] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const rotationSpeedRef = useRef({ x: 0, y: 0 });
  
  // Função para abrir o modal do livro
  const handleOpenBook = () => {
    setShowModal(true);
  };
  
  // Função para fechar o modal do livro
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Efeito de rotação suave ao passar o mouse/tocar no livro
  const handleBookInteraction = (dx, dy) => {
    setBookRotation(prev => ({
      x: Math.max(Math.min(prev.x + dy * 0.01, 0.3), -0.3),
      y: Math.max(Math.min(prev.y + dx * 0.01, 0.5), -0.5)
    }));
  };
  
  return (
    <View style={styles.container}>
      {/* Título do livro */}
      <Text style={styles.title}>{bookTitle}</Text>
      
      {/* Container do livro 3D */}
      <View 
        style={styles.bookContainer}
        onTouchMove={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          const centerX = width / 2;
          const centerY = height / 2;
          handleBookInteraction(locationX - centerX, locationY - centerY);
        }}
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
              bookRotation={bookRotation}
              coverFrontImage={coverFrontImage}
              coverBackImage={coverBackImage}
              coverFrontColor={coverFrontColor}
              coverBackColor={coverBackColor}
              spineTitle={bookTitle}
              spineColor={spineColor}
              spineTextColor={spineTextColor}
              spineEffects={{ emboss: true, metallic: true }}
              pagesCount={pages.length}
            />
          </Suspense>
        </Canvas>
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
      
      {/* Modal do livro com páginas */}
      <BookModal
        visible={showModal}
        onClose={handleCloseModal}
        pages={pages}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  bookContainer: {
    width: '100%',
    height: 400,
    marginBottom: 30,
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
