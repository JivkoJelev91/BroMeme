import { createGlobalStyle } from 'styled-components';
import { ThemeType } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: ThemeType }>`
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    transition: background-color 0.3s ease, color 0.3s ease;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }
  
  * {
    box-sizing: border-box;
    transition: background-color 0.3s ease, 
               color 0.3s ease, 
               border-color 0.3s ease,
               box-shadow 0.3s ease;
  }
  
  button, input, select, textarea {
    font-family: inherit;
  }
`;