import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

// Componente de página aprimorado com animações mais suaves
export function Page3D({
  index,
  targetAngle,
  isTurning,
  turnDirection,
  isVisible,
  pageOpacity,
  onClick,
  frontColor,
  backColor,
  contentCanvas,
  position,
  width = 1,
  height = 1.33,
  pageCurlIntensity = 1.0,
  pageBendResistance = 0.5,
  enableShadow = true,
  enableDogEar = true,
}) {
  const meshRef = useRef();
  const materialFrontRef = useRef();
  const materialBackRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);

  // Converter canvas para textura
  useEffect(() => {
    if (contentCanvas) {
      const texture = new THREE.CanvasTexture(contentCanvas);
      texture.needsUpdate = true;
      setFrontTexture(texture);

      // Textura para o verso da página (mais simples)
      const backCanvas = document.createElement('canvas');
      backCanvas.width = 1024;
      backCanvas.height = 1024;
      const ctx = backCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = backColor;
        ctx.fillRect(0, 0, 1024, 1024);
      }
      const backTexture = new THREE.CanvasTexture(backCanvas);
      backTexture.needsUpdate = true;
      setBackTexture(backTexture);
    }
  }, [contentCanvas, backColor]);

  // Função de suavização para animações
  const smoothStep = (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  };

  // Função para interpolação suave
  const lerpSmooth = (start, end, alpha, smoothing = 0.8) => {
    const smoothAlpha = smoothStep(0, 1, alpha * smoothing);
    return start + (end - start) * smoothAlpha;
  };

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Aplicar opacidade
    if (materialFrontRef.current) {
      materialFrontRef.current.opacity = pageOpacity;
    }
    if (materialBackRef.current) {
      materialBackRef.current.opacity = pageOpacity;
    }

    // Animação de virada de página
    if (isTurning) {
      const targetRotation = turnDirection === 'right' ? -Math.PI / 2 : 0;
      const rotationSpeed = 2.5; // Velocidade de rotação
      
      // Aplicar rotação com suavização
      meshRef.current.rotation.y = lerpSmooth(
        meshRef.current.rotation.y,
        targetRotation,
        delta * rotationSpeed,
        0.9
      );
      
      // Efeito de curvatura durante a virada
      const turnProgress = Math.abs((meshRef.current.rotation.y % (Math.PI / 2)) / (Math.PI / 2));
      
      // Efeito de ondulação da página
      const waveIntensity = pageCurlIntensity * 0.05;
      const bendResistance = pageBendResistance * 0.5;
      
      // Aplicar deformação à geometria para efeito de página curvada
      if (meshRef.current.geometry && meshRef.current.geometry.attributes.position) {
        const positions = meshRef.current.geometry.attributes.position.array;
        const count = positions.length / 3;
        
        for (let i = 0; i < count; i++) {
          const x = positions[i * 3];
          const y = positions[i * 3 + 1];
          
          // Calcular curvatura baseada na posição x e no progresso da virada
          const curlFactor = (x + 0.5) * turnProgress * waveIntensity;
          const bendFactor = Math.sin(turnProgress * Math.PI) * bendResistance;
          
          // Aplicar ondulação no eixo z
          positions[i * 3 + 2] = Math.sin(y * 5) * curlFactor + Math.sin(x * 3) * bendFactor;
        }
        
        meshRef.current.geometry.attributes.position.needsUpdate = true;
      }
    } else {
      // Suavemente retornar à posição alvo quando não está virando
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetAngle,
        delta * 3
      );
      
      // Resetar deformações quando não está virando
      if (meshRef.current.geometry && meshRef.current.geometry.attributes.position) {
        const positions = meshRef.current.geometry.attributes.position.array;
        const count = positions.length / 3;
        
        for (let i = 0; i < count; i++) {
          positions[i * 3 + 2] = 0;
        }
        
        meshRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
    
    // Efeito de "dog ear" (dobra no canto da página)
    if (enableDogEar && hovered && !isTurning) {
      if (meshRef.current.geometry && meshRef.current.geometry.attributes.position) {
        const positions = meshRef.current.geometry.attributes.position.array;
        const count = positions.length / 3;
        
        for (let i = 0; i < count; i++) {
          const x = positions[i * 3];
          const y = positions[i * 3 + 1];
          
          // Aplicar dobra apenas no canto superior direito
          if (x > 0.3 && y > 0.3) {
            const distance = Math.sqrt((x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5));
            const dogEarFactor = Math.max(0, 1 - distance * 2) * 0.1;
            positions[i * 3 + 2] = dogEarFactor;
          }
        }
        
        meshRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, targetAngle, 0]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      visible={true}
      castShadow={enableShadow}
      receiveShadow={enableShadow}
    >
      <planeGeometry args={[width, height, 20, 20]} />
      <meshStandardMaterial
        ref={materialFrontRef}
        color={frontColor}
        map={frontTexture}
        transparent
        opacity={1}
        side={THREE.FrontSide}
        roughness={0.6}
      />
      <meshStandardMaterial
        ref={materialBackRef}
        color={backColor}
        map={backTexture}
        transparent
        opacity={1}
        side={THREE.BackSide}
        roughness={0.7}
      />
    </mesh>
  );
}
