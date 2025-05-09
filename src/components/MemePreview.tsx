 
import React, { RefObject, useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { addStroke } from '../redux/slices/memeSlice';
import { RootState, useAppSelector, useAppDispatch, } from '../redux/store';

// Component
interface MemePreviewProps {
  memeRef: RefObject<HTMLDivElement>;
}

const MemePreview: React.FC<MemePreviewProps> = ({ memeRef }) => {
  const { 
    memeImage, 
    topText, 
    bottomText, 
    bold, 
    shadow, 
    blur, 
    grayscale, 
    imageRotationAngle,
    drawingColor,
    brushSize,
    strokes,
    activeTab,
    topFontSize,
    bottomFontSize,
    topFontFamily,
    bottomFontFamily,
    topTextAlign,
    bottomTextAlign,
    rotationAngle 
  } = useAppSelector((state: RootState) => state.meme);
  
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Check if draw panel is active
  const isDrawPanelActive = activeTab === 'draw';
  
  // Initialize canvas size when the component mounts or when the image changes
  useEffect(() => {
    updateCanvasSize();
  }, [memeImage]);

  // Redraw all strokes whenever strokes array changes
  useEffect(() => {
    drawAllStrokes();
  }, [strokes]);

  // This effect ensures the canvas is properly sized after rotation
  useEffect(() => {
    updateCanvasSize();
  }, [rotationAngle]);
  
  // Function to draw all strokes
  const drawAllStrokes = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all saved strokes
    strokes.forEach((stroke: { path: Array<{x: number, y: number}>; color: string; width: number }) => {
      if (stroke.path.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke.path[0].x, stroke.path[0].y);
      
      for (let i = 1; i < stroke.path.length; i++) {
        ctx.lineTo(stroke.path[i].x, stroke.path[i].y);
      }
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  };
  
  // Update canvas size based on the displayed image
  const updateCanvasSize = () => {
    if (canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      
      // Get the actual image dimensions instead of the element dimensions
      const rect = img.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Clear canvas and redraw strokes with the new size
      drawAllStrokes();
    }
  };
  
  // Handle image load to update canvas size
  const handleImageLoad = () => {
    updateCanvasSize();
  };
  
  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only allow drawing if the Draw Panel is active
    if (!isDrawPanelActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate the exact position within the canvas
    // Using scale factors to account for any CSS scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only allow drawing if the Draw Panel is active
    if (!isDrawPanelActive || !isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Apply the same scaling factors for consistent drawing
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentPath(prev => [...prev, { x, y }]);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };
  
  const finishDrawing = () => {
    // Only save drawing if the Draw Panel is active
    if (isDrawPanelActive && isDrawing && currentPath.length > 0) {
      // Add the stroke to redux store
      dispatch(addStroke({
        path: currentPath,
        color: drawingColor,
        width: brushSize
      }));
      
      setIsDrawing(false);
      setCurrentPath([]);
    }
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewTitle>Meme Preview</PreviewTitle>
      </PreviewHeader>
      <MemeContainer>
        <MemeCard ref={memeRef}>
          {memeImage ? (
            <>
              <MemeImage 
                ref={imgRef}
                src={memeImage} 
                alt="Meme" 
                $blur={blur} 
                $grayscale={grayscale}
                onLoad={handleImageLoad}
              />
              <DrawingCanvas 
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={finishDrawing}
                onMouseLeave={finishDrawing}
                $isDrawPanelActive={activeTab === 'draw'}
              />
              {topText && (
                <MemeText
                  position="top"
                  bold={bold}
                  shadow={shadow}
                  fontSize={topFontSize}
                  fontFamily={topFontFamily}
                  textAlign={topTextAlign}
                >
                  {topText}
                </MemeText>
              )}
              {bottomText && (
                <MemeText
                  position="bottom"
                  bold={bold}
                  shadow={shadow}
                  rotation={rotationAngle}
                  fontSize={bottomFontSize}
                  fontFamily={bottomFontFamily}
                  textAlign={bottomTextAlign}
                >
                  {bottomText}
                </MemeText>
              )}
            </>
          ) : (
            <div style={{ color: '#888', fontSize: '1.1rem', textAlign: 'center', width: '100%', padding: '0 2rem' }}>
              Upload an image to create your meme
            </div>
          )}
        </MemeCard>
      </MemeContainer>
    </PreviewContainer>
  );
};

// Styled components
const PreviewContainer = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  flex: 1;
  
  @media (min-width: 768px) {
    max-width: 60%;
  }
`;

const PreviewHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MemeContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 1.5rem;
  
  @media (min-width: 768px) {
    min-height: 400px;
  }
`;

const MemeCard = styled.div`
  width: 100%;
  max-width: 450px;
  height: auto;
  max-height: calc(100vh - 250px);
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  aspect-ratio: auto;
  
  border: none;
`;

const MemeImage = styled.img<{ $blur: boolean; $grayscale: boolean; }>`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  
  ${({ $blur }) => $blur && css`filter: blur(3px);`}
  ${({ $grayscale, $blur }) => $grayscale && css`
    filter: ${$blur ? 'grayscale(1) blur(3px)' : 'grayscale(1)'};
  `}
`;

const MemeText = styled.div<{ 
  bold: boolean; 
  shadow: boolean; 
  position: 'top' | 'bottom'; 
  fontSize: number;
  fontFamily: string;
  textAlign: string;
}>`
  position: absolute;
  left: 0;
  width: 100%;
  text-align: ${props => props.textAlign || 'center'};
  font-size: ${props => props.fontSize / 16}rem;
  font-family: ${props => props.fontFamily || 'Impact'};
  padding: 0 10px;
  color: #fff;
  pointer-events: none;
  ${({ bold }) => bold && css`font-weight: bold;`}
  ${({ shadow }) => shadow ? css`
    text-shadow: 
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      2px 2px 0 #000,
      0 0 8px rgba(0,0,0,0.7);
  ` : css`text-shadow: none;`}
  ${({ position }) => 
    position === 'top' 
      ? css`top: 10px;` 
      : css`bottom: 10px;`
  }
  text-transform: uppercase;
  z-index: 20; /* Ensure text appears above the drawing canvas */
`;

const DrawingCanvas = styled.canvas<{
  $isDrawPanelActive: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${props => props.$isDrawPanelActive ? 'auto' : 'none'};
  z-index: 10;
`;

export default MemePreview;