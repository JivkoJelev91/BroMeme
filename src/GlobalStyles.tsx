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

  /* Custom Scrollbar for all scrollable areas */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.border.medium} ${({ theme }) => theme.colors.divider};
  }
  
  *::-webkit-scrollbar {
    width: 7px;
    height: 7px;
    background: ${({ theme }) => theme.colors.divider};
    border-radius: 8px;
  }
  *::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: 8px;
    min-height: 24px;
    transition: background 0.2s;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
  *::-webkit-scrollbar-corner {
    background: ${({ theme }) => theme.colors.divider};
  }
`;