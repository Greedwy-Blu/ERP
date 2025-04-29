import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Box, useTexture } from '@react-three/drei/native';
import * as THREE from 'three';
import { createSpineTexture, createImageTexture } from './createTexture';

export interface ClosedBook3DRef {
  startRotation: (direction?: 'clockwise' | 'counter-clockwise', speed?: number) => void;
  stopRotation: () => void;
  rotateBook: (axis: 'x' | 'y' | 'z', angle: number) => void;
  getRotation: () => { x: number; y: number; z: number };
}

interface ClosedBook3DProps {
  bookRotation?: { x: number; y: number };
  pageWidth?: number;
  pageHeight?: number;
  pageDepth?: number;
  pagesCount?: number;
  coverFrontImage?: string;
  coverBackImage?: string;
  coverFrontColor?: string;
  coverBackColor?: string;
  spineTitle?: string;
  spineColor?: string;
  spineTextColor?: string;
  spineTextVertical?: boolean;
  spineEffects?: { emboss: boolean; metallic: boolean };
  onRotate?: (data: any) => void;
}

export const ClosedBook3D = forwardRef<ClosedBook3DRef, ClosedBook3DProps>(({
  bookRotation = { x: 0, y: 0 },
  pageWidth = 1.28,
  pageHeight = 1.71,
  pageDepth = 0.01,
  pagesCount = 6,
  coverFrontImage,
  coverBackImage,
  coverFrontColor = '#FF5555',
  coverBackColor = '#222222',
  spineTitle = 'Meu Livro',
  spineColor = '#333333',
  spineTextColor = '#FFFFFF',
  spineTextVertical = true,
  spineEffects = { emboss: true, metallic: false },
  onRotate,
}, ref) => {
  const bookGroupRef = useRef<THREE.Group>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [rotationDirection, setRotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');

  const [frontCoverTexture, setFrontCoverTexture] = useState<HTMLCanvasElement | null>(null);
  const [backCoverTexture, setBackCoverTexture] = useState<HTMLCanvasElement | null>(null);
  const [spineTexture, setSpineTexture] = useState<HTMLCanvasElement | null>(null);

  // Single implementation of rotation functions
  const startRotation = (direction: 'clockwise' | 'counter-clockwise' = 'clockwise', speed = 0.01) => {
    setIsRotating(true);
    setRotationSpeed(speed);
    setRotationDirection(direction);
    if (onRotate) onRotate({ isRotating: true, direction });
  };

  const stopRotation = () => {
    setIsRotating(false);
    if (onRotate) onRotate({ isRotating: false });
  };

  const rotateBook = (axis: 'x' | 'y' | 'z', angle: number) => {
    if (bookGroupRef.current) {
      bookGroupRef.current.rotation[axis] += angle;
      if (onRotate) onRotate({
        rotation: {
          x: bookGroupRef.current.rotation.x,
          y: bookGroupRef.current.rotation.y,
          z: bookGroupRef.current.rotation.z
        }
      });
    }
  };

  // Animation frame for smooth rotation
  useFrame((_, delta) => {
    if (!bookGroupRef.current) return;
    
    // Smooth interactive rotation
    bookGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.x,
      bookRotation.x,
      0.1
    );
    bookGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.y,
      bookRotation.y,
      0.1
    );
    
    // Auto rotation
    if (isRotating) {
      const directionFactor = rotationDirection === 'clockwise' ? 1 : -1;
      bookGroupRef.current.rotation.y += rotationSpeed * directionFactor;
      
      // Notify parent about rotation changes
      if (onRotate) {
        onRotate({
          rotation: {
            x: bookGroupRef.current.rotation.x,
            y: bookGroupRef.current.rotation.y,
            z: bookGroupRef.current.rotation.z
          }
        });
      }
    }
    
    // Add subtle floating effect
    bookGroupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.03;
  });

  // Load textures
  useEffect(() => {
    const spineCanvas = createSpineTexture(spineTitle, 512, 512, {
      backgroundColor: spineColor,
      textColor: spineTextColor,
      vertical: spineTextVertical,
    });
    setSpineTexture(spineCanvas);

    const loadCoverTexture = (imageUrl: string | undefined, defaultColor: string, setTexture: (canvas: HTMLCanvasElement) => void) => {
      if (imageUrl) {
        createImageTexture(imageUrl, 2048, 2048)
          .then(setTexture)
          .catch(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 2048;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = defaultColor;
              ctx.fillRect(0, 0, 2048, 2048);
            }
            setTexture(canvas);
          });
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = defaultColor;
          ctx.fillRect(0, 0, 2048, 2048);
        }
        setTexture(canvas);
      }
    };

    loadCoverTexture(coverFrontImage, coverFrontColor, setFrontCoverTexture);
    loadCoverTexture(coverBackImage, coverBackColor, setBackCoverTexture);
  }, [coverFrontImage, coverBackImage, coverFrontColor, coverBackColor, spineTitle, spineColor, spineTextColor, spineTextVertical]);

  const frontTexture = useTexture(
    frontCoverTexture?.toDataURL() || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  );

  const backTexture = useTexture(
    backCoverTexture?.toDataURL() || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  );

  const spineTextureObj = useTexture(
    spineTexture?.toDataURL() || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  );

  // Calculate total book depth
  const totalBookDepth = pageDepth * (pagesCount + 2); // +2 for covers

  // Expose rotation functions to parent
  useImperativeHandle(ref, () => ({
    startRotation,
    stopRotation,
    rotateBook,
    getRotation: () => bookGroupRef.current?.rotation || { x: 0, y: 0, z: 0 }
  }), [isRotating, rotationSpeed]);

  return (
    <group ref={bookGroupRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* Front Cover */}
      <Box
        args={[pageWidth, pageHeight, pageDepth * 2]}
        position={[0, 0, totalBookDepth / 2 - pageDepth]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={frontTexture} side={THREE.DoubleSide} roughness={0.5} metalness={0.1} />
      </Box>

      {/* Pages */}
      <Box
        args={[pageWidth - 0.05, pageHeight - 0.05, totalBookDepth - pageDepth * 4]}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </Box>

      {/* Back Cover */}
      <Box
        args={[pageWidth, pageHeight, pageDepth * 2]}
        position={[0, 0, -totalBookDepth / 2 + pageDepth]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={backTexture} side={THREE.DoubleSide} roughness={0.6} metalness={0.1} />
      </Box>

      {/* Spine */}
      <Box
        args={[pageDepth * 2, pageHeight, totalBookDepth]}
        position={[-pageWidth / 2 - pageDepth, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={spineTextureObj}
          side={THREE.DoubleSide}
          roughness={spineEffects.emboss ? 0.3 : 0.7}
          metalness={spineEffects.metallic ? 0.5 : 0.1}
          bumpScale={spineEffects.emboss ? 0.05 : 0}
          emissive={spineEffects.metallic ? spineColor : '#000000'}
          emissiveIntensity={spineEffects.metallic ? 0.1 : 0}
        />
      </Box>

      {/* Spine decorations */}
      {spineEffects.emboss && (
        <>
          <Box
            args={[pageDepth * 2.2, pageDepth * 0.5, totalBookDepth * 1.02]}
            position={[-pageWidth / 2 - pageDepth, pageHeight * 0.4, 0]}
          >
            <meshStandardMaterial
              color={spineTextColor}
              metalness={spineEffects.metallic ? 0.7 : 0.2}
              roughness={0.3}
            />
          </Box>
          <Box
            args={[pageDepth * 2.2, pageDepth * 0.5, totalBookDepth * 1.02]}
            position={[-pageWidth / 2 - pageDepth, -pageHeight * 0.4, 0]}
          >
            <meshStandardMaterial
              color={spineTextColor}
              metalness={spineEffects.metallic ? 0.7 : 0.2}
              roughness={0.3}
            />
          </Box>
        </>
      )}
    </group>
  );
});