import React from 'react';
import { Book3D } from './book';

type ExperienceProps = {
  currentPage: number;
  isTurning: boolean;
  turnDirection: 'left' | 'right';
  isBookOpen: boolean;
  onPageClick: (index: number) => void;
  pages: Array<{
    id: string;
    content: string;
    frontColor?: string;
    backColor?: string;
    contentImage?: string;
  }>;
  pageWidth: number;
  pageHeight: number;
  pageDepth: number;
  bookRotation: { x: number; y: number };
  // Novas props para personalização
  coverFrontImage?: string;
  coverBackImage?: string;
  coverFrontColor?: string;
  coverBackColor?: string;
  spineTitle?: string;
  spineColor?: string;
  spineTextColor?: string;
  spineTextVertical?: boolean;
  spineEffects?: {
    emboss?: boolean;
    metallic?: boolean;
  };
};

const Experience = ({
  currentPage,
  isTurning,
  turnDirection,
  isBookOpen,
  onPageClick,
  pages,
  pageWidth,
  pageHeight,
  pageDepth,
  bookRotation,
  // Passar novas props para o Book3D
  coverFrontImage,
  coverBackImage,
  coverFrontColor,
  coverBackColor,
  spineTitle,
  spineColor,
  spineTextColor,
  spineTextVertical,
  spineEffects,
}: ExperienceProps) => {
  return (
    <>
      <Book3D
        currentPage={currentPage}
        isTurning={isTurning}
        turnDirection={turnDirection}
        isBookOpen={isBookOpen}
        onPageClick={onPageClick}
        pages={pages}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        pageDepth={pageDepth}
        bookRotation={bookRotation}
        coverFrontImage={coverFrontImage}
        coverBackImage={coverBackImage}
        coverFrontColor={coverFrontColor}
        coverBackColor={coverBackColor}
        spineTitle={spineTitle}
        spineColor={spineColor}
        spineTextColor={spineTextColor}
        spineTextVertical={spineTextVertical}
        spineEffects={spineEffects}
      />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </>
  );
};

export default Experience;
