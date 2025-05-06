import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

// Settings icon SVG
export const SettingsIcon = styled.button`
  background: none;
  border: none;
  padding: 0 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 100%;
  color: #888;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  &:hover {
    color: #222;
  }
`;

export const SettingsMenuContainer = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  min-width: 210px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 1rem;
  z-index: 11;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

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
      <label>
        Font size
        <input type="number" min={10} max={80} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{width:'60px',marginLeft:'8px'}} />
      </label>
      <label>
        Font family
        <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} style={{marginLeft:'8px'}}>
          <option value="Arial">Arial</option>
          <option value="Impact">Impact</option>
          <option value="Comic Sans MS">Comic Sans</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </label>
      <label>
        Text align
        <select value={textAlign} onChange={e => setTextAlign(e.target.value)} style={{marginLeft:'8px'}}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
    </SettingsMenuContainer>
  );
};
