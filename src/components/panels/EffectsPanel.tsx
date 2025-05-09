import React from 'react';
import styled from 'styled-components';
import { 
  useAppSelector, 
  useAppDispatch, 
  toggleBlur, 
  toggleGrayscale,
} from '../../redux';
import { RootState } from '../../redux/store';

// Component
const EffectsPanel: React.FC = () => {
  const { 
    blur, 
    grayscale, 
  } = useAppSelector((state: RootState) => state.meme);
  const dispatch = useAppDispatch();

  return (
    <EffectsContainer>
      <CheckboxItem onClick={() => dispatch(toggleBlur())}>
        <StyledCheckbox checked={blur}>
          {blur && '✓'}
        </StyledCheckbox>
        <EffectLabel>Blur</EffectLabel>
      </CheckboxItem>
      
      <CheckboxItem onClick={() => dispatch(toggleGrayscale())}>
        <StyledCheckbox checked={grayscale}>
          {grayscale && '✓'}
        </StyledCheckbox>
        <EffectLabel>Grayscale</EffectLabel>
      </CheckboxItem>
    </EffectsContainer>
  );
};

// Styled components
const EffectsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.checked ? '#3b82f6' : '#fff'};
  border: 1px solid ${props => props.checked ? '#3b82f6' : '#d1d5db'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 14px;
`;

const EffectLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
`;

export default EffectsPanel;