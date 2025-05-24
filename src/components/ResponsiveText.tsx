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
  const textRef = useRef<HTMLDivElement>(null);  useEffect(() => {
    if (!textRef.current || !text) return;
    
    // Function to adjust font size with an iterative approach for better accuracy
    const adjustFontSize = () => {
      // Start with user-defined font size
      let currentSize = fontSize;
      textRef.current!.style.fontSize = `${currentSize / 16}rem`;
      
      // Get the available width (98% of container to maximize space usage)
      const availableWidth = containerWidth * 0.98;
        // First check if we can actually increase the font size
      // This allows text to be larger when there's enough space
      if (textRef.current!.scrollWidth < availableWidth * 0.85 && currentSize < 48) {
        // There's room to grow - try increasing font size
        while (currentSize < 48 && textRef.current!.scrollWidth < availableWidth * 0.95) {
          currentSize = currentSize + 1;
          textRef.current!.style.fontSize = `${currentSize / 16}rem`;
        }
        
        // If we went too far, step back one
        if (textRef.current!.scrollWidth > availableWidth) {
          currentSize = currentSize - 1;
          textRef.current!.style.fontSize = `${currentSize / 16}rem`;
        }
      }
      // If text is too wide, gradually reduce size until it fits
      else if (textRef.current!.scrollWidth > availableWidth) {
        // Try to find the right size with a more precise approach
        while (currentSize > 10 && textRef.current!.scrollWidth > availableWidth) {
          currentSize = currentSize - 1;
          textRef.current!.style.fontSize = `${currentSize / 16}rem`;
        }
      }
    };
    
    // Run the adjustment immediately
    adjustFontSize();
    
    // Also run it after a small delay to ensure all rendering is complete
    const timeout = setTimeout(adjustFontSize, 50);
    return () => clearTimeout(timeout);
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
  white-space: normal; /* Allow wrapping to multiple lines */
  word-break: break-word; /* Break long words if needed */
  overflow: hidden;
  line-height: 1.2;
  padding: 0;
  margin: 0;
  font-size: ${props => props.$fontSize / 16}rem !important;
  max-width: 100%; /* Prevent text from exceeding container width */
  ${props => props.$shadow && `
    text-shadow: 
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      2px 2px 0 #000;
  `}
`;

export default ResponsiveText;