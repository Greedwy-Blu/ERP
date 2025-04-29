import React, { createContext, useState, useContext, useEffect } from 'react';

// Contexto para gerenciar dependências entre funcionalidades
const DependencyContext = createContext();

export const DependencyProvider = ({ children }) => {
  // Estado para rastrear entidades disponíveis no sistema
  const [dependencies, setDependencies] = useState({
    setores: [],
    funcionarios: [],
    produtos: [],
    gestores: [],
  });

  // Estado para rastrear quais funcionalidades estão desbloqueadas
  const [unlockedFeatures, setUnlockedFeatures] = useState({
    criarOrdem: false,
    atualizarStatus: false,
    criarFuncionario: false,
    criarSetor: false,
    criarProduto: false,
    rastrearOrdem: false,
  });

  // Simula a busca de dados iniciais
  useEffect(() => {
    // Em uma implementação real, isso seria uma chamada de API
    const fetchInitialData = async () => {
      // Simula dados iniciais
      const mockData = {
        setores: [
          { id: 1, name: 'Corte' },
          { id: 2, name: 'Costura' },
          { id: 3, name: 'Acabamento' },
        ],
        funcionarios: [
          { id: 1, nome: 'Funcionário A', code: 'FUNC001' },
          { id: 2, nome: 'Funcionário B', code: 'FUNC002' },
        ],
        produtos: [
          { id: 1, name: 'Produto A', code: 'PROD001' },
          { id: 2, name: 'Produto B', code: 'PROD002' },
        ],
        gestores: [
          { id: 1, nome: 'Gestor A', code: 'GEST001' },
        ],
      };

      setDependencies(mockData);
      
      // Atualiza as funcionalidades desbloqueadas com base nos dados
      updateUnlockedFeatures(mockData);
    };

    fetchInitialData();
  }, []);

  // Atualiza quais funcionalidades estão desbloqueadas com base nas dependências
  const updateUnlockedFeatures = (data) => {
    const features = {
      // Só pode criar ordem se existirem setores, funcionários e produtos
      criarOrdem: data.setores.length > 0 && data.funcionarios.length > 0 && data.produtos.length > 0,
      
      // Só pode atualizar status se existirem ordens (simulado como true por enquanto)
      atualizarStatus: true,
      
      // Pode criar funcionário se existirem setores
      criarFuncionario: data.setores.length > 0,
      
      // Criar setor sempre está disponível para gestores
      criarSetor: true,
      
      // Criar produto sempre está disponível para gestores
      criarProduto: true,
      
      // Rastrear ordem só é possível se existirem ordens e funcionários
      rastrearOrdem: data.funcionarios.length > 0,
    };

    setUnlockedFeatures(features);
  };

  // Verifica se uma funcionalidade específica está desbloqueada
  const checkFeatureUnlocked = (featureName) => {
    return unlockedFeatures[featureName] || false;
  };

  // Adiciona uma nova entidade e atualiza as dependências
  const addEntity = (entityType, entity) => {
    setDependencies(prev => {
      const updatedDependencies = {
        ...prev,
        [entityType]: [...prev[entityType], entity]
      };
      
      // Atualiza as funcionalidades desbloqueadas
      updateUnlockedFeatures(updatedDependencies);
      
      return updatedDependencies;
    });
  };

  return (
    <DependencyContext.Provider 
      value={{ 
        dependencies, 
        unlockedFeatures, 
        checkFeatureUnlocked,
        addEntity
      }}
    >
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependency = () => {
  return useContext(DependencyContext);
};
