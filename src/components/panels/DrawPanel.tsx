import React from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch, setDrawingColor, setBrushSize, clearDrawing } from 'store';
import { RootState } from '../../redux/store';

// Component
const DrawPanel: React.FC = () => {
  const { drawingColor, brushSize, strokes } = useAppSelector((state: RootState) => state.meme);
  const dispatch = useAppDispatch();

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDrawingColor(e.target.value));
  };

  const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setBrushSize(parseInt(e.target.value)));
  };

  const handleClear = () => {
    dispatch(clearDrawing());
  };

  return (
    <DrawPanelContainer>
      <ControlGroup>
        <ColorPickerContainer>
          <ControlLabel>Color:</ControlLabel>
          <ColorInput 
            type="color" 
            value={drawingColor} 
            onChange={handleColorChange} 
          />
        </ColorPickerContainer>
      </ControlGroup>
      
      <ControlGroup>
        <ControlLabel>Brush Size: {brushSize}px</ControlLabel>
        <SizeSliderContainer>
          <SizeSlider 
            type="range" 
            min="1" 
            max="20" 
            value={brushSize} 
            onChange={handleBrushSizeChange}
          />
          <BrushPreview size={brushSize} color={drawingColor} />
        </SizeSliderContainer>
      </ControlGroup>
      
      <ClearButton onClick={handleClear} disabled={strokes.length === 0}>
        Clear Drawing
      </ClearButton>
      
      <DrawingInstructions>
        Click and drag on the image to draw
      </DrawingInstructions>
    </DrawPanelContainer>
  );
};

// Styled components
const DrawPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 0;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ControlLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorInput = styled.input`
  width: 50px;
  height: 30px;
  border: none;
  cursor: pointer;
  background: transparent;
  padding: 0;
  
  /* Hide default color picker UI in some browsers */
  ::-webkit-color-swatch-wrapper {
    padding: 0; 
  }
  ::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

const SizeSliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SizeSlider = styled.input`
  flex: 1;
  cursor: pointer;
`;

const BrushPreview = styled.div<{ size: number; color: string }>`
  width: ${props => Math.max(props.size, 8)}px;
  height: ${props => Math.max(props.size, 8)}px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`;

const ClearButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.disabled ? '#f0f0f0' : '#f0f2f5'};
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  color: #666;
  
  &:hover {
    background-color: ${props => props.disabled ? '#f0f0f0' : '#e4e6e9'};
  }
`;

const DrawingInstructions = styled.div`
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
  margin-top: 8px;
`;

export default DrawPanel;