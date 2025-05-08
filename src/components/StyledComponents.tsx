import { useEffect, useRef } from "react";
import { styled } from "styled-components";

// Update SettingsIcon for theme support
export const SettingsIcon = styled.button`
  background: none;
  border: none;
  padding: 0 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.secondary};
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Update SettingsMenuContainer for theme support
export const SettingsMenuContainer = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  min-width: 210px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 8px;
  box-shadow: 0 4px 16px ${({ theme }) => theme.colors.shadow};
  padding: 1rem;
  z-index: 11;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// Add new styled components for inputs and labels
const SettingsLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
`;

const SettingsInput = styled.input`
  width: 60px;
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.input.background};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SettingsSelect = styled.select`
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.input.background};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  option {
    background: ${({ theme }) => theme.colors.cardBackground};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Update SettingsMenu component to use the new styled components
export const SettingsMenu: React.FC<{
  fontSize: number;
  setFontSize: (v: number) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  textAlign: string;
  setTextAlign: (v: string) => void;
  onClose: () => void;
}> = ({ fontSize, setFontSize, fontFamily, setFontFamily, textAlign, setTextAlign, onClose }) => {
  // Close menu on outside click
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <SettingsMenuContainer ref={ref}>
      <SettingsLabel>
        Font size
        <SettingsInput 
          type="number" 
          min={10} 
          max={80} 
          value={fontSize} 
          onChange={e => setFontSize(Number(e.target.value))} 
        />
      </SettingsLabel>
      
      <SettingsLabel>
        Font family
        <SettingsSelect 
          value={fontFamily} 
          onChange={e => setFontFamily(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Impact">Impact</option>
          <option value="Comic Sans MS">Comic Sans</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </SettingsSelect>
      </SettingsLabel>
      
      <SettingsLabel>
        Text align
        <SettingsSelect 
          value={textAlign} 
          onChange={e => setTextAlign(e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </SettingsSelect>
      </SettingsLabel>
    </SettingsMenuContainer>
  );
};