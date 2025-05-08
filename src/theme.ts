export const lightTheme = {
  colors: {
    background: '#f9f9f9',
    cardBackground: '#ffffff',
    primary: '#4285f4',
    secondary: '#f0f5ff',
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#777777',
      inverse: '#ffffff',
    },
    border: {
      light: '#eaeaea',
      medium: '#dddddd',
      focus: '#4285f4',
    },
    input: {
      background: '#ffffff',
      placeholder: '#999999',
    },
    success: '#34a853',
    error: '#ea4335',
    warning: '#fbbc05',
    favorite: '#ff6b6b',
    shadow: 'rgba(0, 0, 0, 0.1)',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    divider: '#f5f5f5',
    categoryTag: '#f0f0f0',
    avatarBackground: '#4285f4',
  },
};

export const darkTheme = {
  colors: {
    background: '#121212',
    cardBackground: '#1f1f1f',
    primary: '#4f9bff',
    secondary: '#2a3142',
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
      tertiary: '#909090',
      inverse: '#121212',
    },
    border: {
      light: '#2a2a2a',
      medium: '#383838',
      focus: '#4f9bff',
    },
    input: {
      background: '#2a2a2a',
      placeholder: '#707070',
    },
    success: '#46c15a',
    error: '#f44336',
    warning: '#ffb938',
    favorite: '#ff6b6b',
    shadow: 'rgba(0, 0, 0, 0.25)',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    divider: '#2a2a2a',
    categoryTag: '#2a2a2a',
    avatarBackground: '#4f9bff',
  },
};

export type ThemeType = typeof lightTheme;