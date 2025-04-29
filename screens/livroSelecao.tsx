import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmpregadoGuideScreen } from '@/screens/EmpregadoGuideScreen';
import { GestaoGuideScreen} from '@/screens/GestaoGuideScreen';

const { width, height } = Dimensions.get('window');

// Componente de seleção de livro aprimorado
const BookSelectionScreen = ({ onSelectBook }) => {
  const [hoveredBook, setHoveredBook] = useState(null);

  return (
    <SafeAreaView style={styles.selectionContainer}>
      <Text style={styles.selectionTitle}>Selecione o Guia</Text>
      
      <View style={styles.booksContainer}>
        <TouchableOpacity 
          style={[styles.bookOption, hoveredBook === 'employee' && styles.bookOptionHovered]}
          onPress={() => onSelectBook('employee')}
          onPressIn={() => setHoveredBook('employee')}
          onPressOut={() => setHoveredBook(null)}
        >
          <View style={styles.bookCoverContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40' }} 
              style={styles.bookCover}
            />
            <View style={styles.bookSpine}>
              <Text style={styles.bookSpineText}>Guia para Funcionários</Text>
            </View>
          </View>
          <Text style={styles.bookTitle}>Guia para Funcionários</Text>
          <Text style={styles.bookDescription}>
            Manual completo com orientações e procedimentos para funcionários
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bookOption, hoveredBook === 'manager' && styles.bookOptionHovered]}
          onPress={() => onSelectBook('manager')}
          onPressIn={() => setHoveredBook('manager')}
          onPressOut={() => setHoveredBook(null)}
        >
          <View style={styles.bookCoverContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1552664730-d307ca884978' }} 
              style={styles.bookCover}
            />
            <View style={[styles.bookSpine, styles.managerSpine]}>
              <Text style={styles.bookSpineText}>Guia para Gestores</Text>
            </View>
          </View>
          <Text style={styles.bookTitle}>Guia para Gestores</Text>
          <Text style={styles.bookDescription}>
            Manual estratégico com diretrizes e práticas para gestores
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.selectionFooter}>
        Escolha o guia adequado ao seu perfil
      </Text>
    </SafeAreaView>
  );
};

// Componente principal que gerencia a seleção e visualização dos livros
export default function LivroSelecaoScreen() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [showSelection, setShowSelection] = useState(true);
  
  // Função para selecionar um livro
  const handleSelectBook = (bookType) => {
    setSelectedBook(bookType);
    setShowSelection(false);
  };
  
  // Função para voltar à tela de seleção
  const handleBackToSelection = () => {
    setSelectedBook(null);
    setShowSelection(true);
  };
  
  return (
    <View style={styles.container}>
      {showSelection ? (
        <BookSelectionScreen onSelectBook={handleSelectBook} />
      ) : (
        <>
          {selectedBook === 'employee' && (
            <EmpregadoGuideScreen onBack={handleBackToSelection} />
          )}
          
          {selectedBook === 'manager' && (
            <GestaoGuideScreen onBack={handleBackToSelection} />
          )}
        </>
      )}
    </View>
  );
}

// Estilos para a tela de seleção aprimorada
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  selectionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  booksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
  },
  bookOption: {
    width: width > 600 ? 280 : width * 0.42,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  bookOptionHovered: {
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  bookCoverContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookCover: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerSpine: {
    backgroundColor: '#4527A0',
  },
  bookSpineText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
    width: 180,
    textAlign: 'center',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  bookDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectionFooter: {
    marginTop: 30,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
