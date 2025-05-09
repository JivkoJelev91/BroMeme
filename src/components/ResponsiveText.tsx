// Create a new file: src/components/ResponsiveText.tsx
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

interface ResponsiveTextProps {
  text: string;
  fontSize: number;
  containerWidth: number; 
  bold: boolean;
  shadow: boolean;
  fontFamily: string;
  textAlign: string;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({ 
  text, 
  fontSize,
  containerWidth,
  bold,
  shadow,
  fontFamily,
  textAlign
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!textRef.current || !text) return;
    
    // Start with user-defined font size
    let currentSize = fontSize;
    textRef.current.style.fontSize = `${currentSize / 16}rem`;
    
    // If text overflows, reduce font size until it fits
    if (textRef.current.scrollWidth > containerWidth - 20) {
      // Calculate scale factor (how much to shrink)
      const scaleFactor = (containerWidth - 20) / textRef.current.scrollWidth;
      currentSize = Math.floor(fontSize * scaleFactor);
      
      // Apply the new size with a minimum cap
      const finalSize = Math.max(currentSize, 14);
      textRef.current.style.fontSize = `${finalSize / 16}rem`;
    }
  }, [text, fontSize, containerWidth]);
  
  return (
    <StyledText 
      ref={textRef}
      $fontSize={fontSize}
      $bold={bold}
      $shadow={shadow}
      $fontFamily={fontFamily}
      $textAlign={textAlign}
    >
      {text}
    </StyledText>
  );
};

const StyledText = styled.div<{
  $fontSize: number;
  $bold: boolean;
  $shadow: boolean;
  $fontFamily: string;
  $textAlign: string;
}>`
  color: white;
  font-family: ${props => props.$fontFamily || 'Impact'};
  font-weight: ${props => props.$bold ? 'bold' : 'normal'};
  text-align: ${props => props.$textAlign || 'center'};
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  
  ${props => props.$shadow && `
    text-shadow: 
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      2px 2px 0 #000;
  `}
`;

export default ResponsiveText;