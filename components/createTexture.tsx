import * as THREE from 'three';

type TextOptions = {
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  lineHeight?: number;
  fontSize?: number;
  fontFamily?: string;
};

type SpineOptions = {
  backgroundColor?: string;
  textColor?: string;
  vertical?: boolean;
  fontSize?: number;
  fontFamily?: string;
};

// Função aprimorada para criar textura de texto
export const createTextTexture = (
  text: string,
  width: number = 1024,
  height: number = 1024,
  options: TextOptions = {}
): HTMLCanvasElement => {
  const {
    backgroundColor = '#ffffff',
    textColor = '#000000',
    padding = 40,
    lineHeight = 1.4,
    fontSize = 32,
    fontFamily = 'Arial, sans-serif'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  // Fundo
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Configuração do texto
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Quebra de texto para caber na largura
  const words = text.split(' ');
  const maxWidth = width - padding * 2;
  let line = '';
  let y = padding;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, padding, y);
      line = words[i] + ' ';
      y += fontSize * lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, padding, y);

  return canvas;
};

// Função simplificada para criar textura a partir de imagem
export const createImageTexture = async (
  imageUrl: string,
  width: number = 1024,
  height: number = 1024
): Promise<HTMLCanvasElement> => {
  // Criar um canvas de fallback com cor sólida
  const createFallbackCanvas = (color = '#ffffff') => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
      
      // Adicionar texto indicando erro
      ctx.fillStyle = '#999999';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Imagem não disponível', width/2, height/2);
    }
    return canvas;
  };

  // Se a URL estiver vazia, retornar canvas de fallback
  if (!imageUrl || imageUrl.trim() === '') {
    return createFallbackCanvas();
  }

  try {
    // Usar uma abordagem mais simples para carregar imagens
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(createFallbackCanvas());
          return;
        }
        
        // Preencher com fundo branco primeiro
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Calcular dimensões para manter proporção
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          drawHeight = height;
          drawWidth = height * imgRatio;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgRatio;
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        }
        
        // Desenhar a imagem centralizada
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        resolve(canvas);
      };
      
      img.onerror = () => {
        resolve(createFallbackCanvas());
      };
      
      // Definir um timeout para evitar espera infinita
      setTimeout(() => {
        if (!img.complete) {
          img.src = ''; // Cancelar o carregamento
          resolve(createFallbackCanvas());
        }
      }, 5000);
      
      img.src = imageUrl;
    });
  } catch (error) {
    return createFallbackCanvas();
  }
};

// Função para criar textura para a lombada do livro
export const createSpineTexture = (
  title: string,
  width: number = 512,
  height: number = 512,
  options: SpineOptions = {}
): HTMLCanvasElement => {
  const {
    backgroundColor = '#333333',
    textColor = '#ffffff',
    vertical = true,
    fontSize = vertical ? 36 : 28,
    fontFamily = 'Arial, sans-serif'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  // Fundo
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Configuração do texto
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  
  if (vertical) {
    // Texto vertical
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 0, 0);
    ctx.restore();
    
    // Adicionar detalhes decorativos
    ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.02);
    ctx.fillRect(width * 0.1, height * 0.9, width * 0.8, height * 0.02);
  } else {
    // Texto horizontal
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, width / 2, height / 2);
    
    // Adicionar detalhes decorativos
    ctx.fillRect(width * 0.1, height * 0.2, width * 0.8, height * 0.02);
    ctx.fillRect(width * 0.1, height * 0.8, width * 0.8, height * 0.02);
  }

  return canvas;
};
