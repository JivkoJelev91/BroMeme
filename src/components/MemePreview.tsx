import React, { RefObject, useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useAppSelector, useAppDispatch, addStroke } from 'store';
import { RootState } from '../redux/store';

// Component
interface MemePreviewProps {
  memeRef: RefObject<HTMLDivElement> | null;
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
      <MemeCard ref={memeRef}>
        {memeImage ? (
          <>
            <MemeImage 
              ref={imgRef}
              src={memeImage} 
              alt="Meme" 
              blur={blur} 
              grayscale={grayscale}
              rotation={imageRotationAngle}
              onLoad={handleImageLoad}
            />
            <DrawingCanvas 
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={finishDrawing}
              onMouseLeave={finishDrawing}
              rotation={imageRotationAngle}
              isDrawing={isDrawing}
              isDrawPanelActive={activeTab === 'draw'}
            />
            {topText && (
              <MemeText
                position="top"
                bold={bold}
                shadow={shadow}
                rotation={rotationAngle}
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
    </PreviewContainer>
  );
};

// Styled components
const PreviewContainer = styled.div`
  flex: 0 0 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: white;
`;

const MemeCard = styled.div`
  width: 450px;
  height: 450px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MemeImage = styled.img<{ blur: boolean; grayscale: boolean; rotation: number }>`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform: rotate(${props => props.rotation}deg);
  transition: transform 0.3s ease;
  ${({ blur }) => blur && css`filter: blur(3px);`}
  ${({ grayscale, blur }) => grayscale && css`
    filter: ${blur ? 'grayscale(1) blur(3px)' : 'grayscale(1)'};
  `}
`;

const MemeText = styled.div<{ 
  bold: boolean; 
  shadow: boolean; 
  position: 'top' | 'bottom'; 
  rotation: number;
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
  transform: rotate(${props => props.rotation}deg);
  transition: transform 0.3s ease, top 0.3s ease, bottom 0.3s ease;
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
  rotation: number;
  isDrawing: boolean;
  isDrawPanelActive: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: ${props => `rotate(${props.rotation}deg)`};
  pointer-events: ${props => props.isDrawPanelActive ? 'auto' : 'none'};
`;

export default MemePreview;