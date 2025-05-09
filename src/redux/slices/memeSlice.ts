import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DrawingStroke {
  path: Array<{x: number, y: number}>;
  color: string;
  width: number;
}

interface MemeState {
  memeImage: string | null;
  memeImageName: string;
  useResponsiveFont: boolean;
  topText: string;
  bottomText: string;
  bold: boolean;
  shadow: boolean;
  blur: boolean;
  grayscale: boolean;
  activeTab: string;
  drawingColor: string;
  brushSize: number;
  strokes: DrawingStroke[];
  topSpacing: number;
  bottomSpacing: number;
  topFontSize: number;
  bottomFontSize: number;
  topFontFamily: string;
  bottomFontFamily: string;
  topTextAlign: string;
  bottomTextAlign: string;
  topTextPosition: { x: number, y: number };
  bottomTextPosition: { x: number, y: number };
}

// Default initial meme image
const defaultMemeImage = 'https://i.imgflip.com/24y43o.jpg';

const initialState: MemeState = {
  memeImage: defaultMemeImage,
  memeImageName: 'Change My Mind',
  useResponsiveFont: true,
  topText: '',
  bottomText: '',
  bold: false,
  shadow: true,
  blur: false,
  grayscale: false,
  activeTab: 'text',
  drawingColor: '#ff0000', // Default red
  brushSize: 5,
  strokes: [],
  topSpacing: 24,
  bottomSpacing: 24,
  topFontSize: 32,
  bottomFontSize: 32,
  topFontFamily: 'Impact',
  bottomFontFamily: 'Impact',
  topTextAlign: 'center',
  bottomTextAlign: 'center',
  topTextPosition: { x: 0, y: -145 },
  bottomTextPosition: { x: 0, y: 145 },
};

export const memeSlice = createSlice({
  name: 'meme',
  initialState,
  reducers: {
    setMemeImage: (state, action: PayloadAction<string | null>) => {
      state.memeImage = action.payload;
    },
    setMemeImageName: (state, action: PayloadAction<string>) => {
      state.memeImageName = action.payload;
    },
    toggleResponsiveFont: (state) => {
  state.useResponsiveFont = !state.useResponsiveFont;
},
    setTopText: (state, action: PayloadAction<string>) => {
      state.topText = action.payload;
    },
    setBottomText: (state, action: PayloadAction<string>) => {
      state.bottomText = action.payload;
    },
    setBold: (state, action: PayloadAction<boolean>) => {
      state.bold = action.payload;
    },
    setShadow: (state, action: PayloadAction<boolean>) => {
      state.shadow = action.payload;
    },
    setBlur: (state, action: PayloadAction<boolean>) => {
      state.blur = action.payload;
    },
    setGrayscale: (state, action: PayloadAction<boolean>) => {
      state.grayscale = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    toggleBold: (state) => {
      state.bold = !state.bold;
    },
    toggleShadow: (state) => {
      state.shadow = !state.shadow;
    },
    toggleBlur: (state) => {
      state.blur = !state.blur;
    },
    toggleGrayscale: (state) => {
      state.grayscale = !state.grayscale;
    },
    toggleSpacing: (state, action: PayloadAction<'top' | 'bottom'>) => {
      // Toggle between normal (24) and expanded (48) spacing
      if (action.payload === 'top') {
        state.topSpacing = state.topSpacing === 24 ? 48 : 24;
      } else {
        state.bottomSpacing = state.bottomSpacing === 24 ? 48 : 24;
      }
    },
    setDrawingColor: (state, action: PayloadAction<string>) => {
      state.drawingColor = action.payload;
    },
    setBrushSize: (state, action: PayloadAction<number>) => {
      state.brushSize = action.payload;
    },
    addStroke: (state, action: PayloadAction<DrawingStroke>) => {
      state.strokes.push(action.payload);
    },
    clearDrawing: (state) => {
      state.strokes = [];
    },
    setTopSpacing: (state, action: PayloadAction<number>) => {
      state.topSpacing = action.payload;
    },
    setBottomSpacing: (state, action: PayloadAction<number>) => {
      state.bottomSpacing = action.payload;
    },
    setTopFontSize: (state, action: PayloadAction<number>) => {
      state.topFontSize = action.payload;
    },
    setBottomFontSize: (state, action: PayloadAction<number>) => {
      state.bottomFontSize = action.payload;
    },
    setTopFontFamily: (state, action: PayloadAction<string>) => {
      state.topFontFamily = action.payload;
    },
    setBottomFontFamily: (state, action: PayloadAction<string>) => {
      state.bottomFontFamily = action.payload;
    },
    setTopTextAlign: (state, action: PayloadAction<string>) => {
      state.topTextAlign = action.payload;
    },
    setBottomTextAlign: (state, action: PayloadAction<string>) => {
      state.bottomTextAlign = action.payload;
    },
    updateTextPosition: (state, action: PayloadAction<{ position: 'top' | 'bottom', x: number, y: number }>) => {
      const { position, x, y } = action.payload;
      if (position === 'top') {
        state.topTextPosition = { x, y };
      } else {
        state.bottomTextPosition = { x, y };
      }
    },
  },
});

export const {
  setMemeImage,
  setMemeImageName,
  setTopText,
  setBottomText,
  setBold,
  setShadow,
  setBlur,
  setGrayscale,
  setActiveTab,
  toggleBold,
  toggleShadow,
  toggleBlur,
  toggleGrayscale,
  setDrawingColor,
  setBrushSize,
  addStroke,
  clearDrawing,
  setTopSpacing,
  setBottomSpacing,
  toggleSpacing,
  setTopFontSize,
  setBottomFontSize,
  setTopFontFamily,
  setBottomFontFamily,
  setTopTextAlign,
  setBottomTextAlign,
  updateTextPosition,
  toggleResponsiveFont
} = memeSlice.actions;

export default memeSlice.reducer;