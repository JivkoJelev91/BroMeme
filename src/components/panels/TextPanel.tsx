import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  useAppSelector, 
  useAppDispatch, 
  setTopText, 
  setBottomText,
  setTopFontSize,
  setBottomFontSize,
  setTopFontFamily,
  setBottomFontFamily,
  setTopTextAlign,
  setBottomTextAlign
} from '../../redux';
import { RootState } from '../../redux/store';
import { SettingsIcon, SettingsMenu } from '../StyledComponents';

// Component
interface TextPanelProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextPanel: React.FC<TextPanelProps> = ({ handleImageUpload }) => {
  const { 
    topText, 
    bottomText,
    topFontSize,
    bottomFontSize,
    topFontFamily,
    bottomFontFamily,
    topTextAlign,
    bottomTextAlign
  } = useAppSelector((state: RootState) => state.meme);
  const dispatch = useAppDispatch();

  // State for settings menu per input
  const [openMenu, setOpenMenu] = useState<'top' | 'bottom' | null>(null);
  
  const handleResetText = () => {
    // Reset all text settings to default values
    dispatch(setTopText(''));
    dispatch(setBottomText(''));
    dispatch(setTopFontSize(32));
    dispatch(setBottomFontSize(32));
    dispatch(setTopFontFamily('Impact'));
    dispatch(setBottomFontFamily('Impact'));
    dispatch(setTopTextAlign('center'));
    dispatch(setBottomTextAlign('center'));
  };

  return (
    <>
      <InputGroup>
        <Input type="file" accept="image/*" onChange={handleImageUpload} />

        <InputWrapper>
          <Input
            type="text"
            placeholder="Text #1"
            value={topText}
            onChange={e => dispatch(setTopText(e.target.value))}
          />
          <SettingsIcon onClick={() => setOpenMenu(openMenu === 'top' ? null : 'top')} aria-label="Text 1 settings">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 13.5A3.5 3.5 0 1 0 10 6.5a3.5 3.5 0 0 0 0 7zm7-3.5c0-.47-.04-.93-.1-1.38l1.6-1.25a.5.5 0 0 0 .12-.64l-1.52-2.63a.5.5 0 0 0-.6-.23l-1.88.76a7.03 7.03 0 0 0-1.2-.7l-.28-2A.5.5 0 0 0 12.5 2h-3a.5.5 0 0 0-.5.42l-.28 2c-.42.18-.82.4-1.2.7l-1.88-.76a.5.5 0 0 0-.6.23L2.52 7.22a.5.5 0 0 0 .12.64l1.6 1.25c-.06.45-.1.91-.1 1.38s.04.93.1 1.38l-1.6 1.25a.5.5 0 0 0-.12.64l1.52 2.63a.5.5 0 0 0 .6.23l1.88-.76c.38.3.78.52 1.2.7l.28 2a.5.5 0 0 0 .5.42h3a.5.5 0 0 0 .5-.42l.28-2c.42-.18.82-.4 1.2-.7l1.88.76a.5.5 0 0 0 .6-.23l1.52-2.63a.5.5 0 0 0-.12-.64l-1.6-1.25c.06-.45.1-.91.1-1.38z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
          </SettingsIcon>
          {openMenu === 'top' && (
            <SettingsMenu
              fontSize={topFontSize}
              setFontSize={v => dispatch(setTopFontSize(v))}
              fontFamily={topFontFamily}
              setFontFamily={v => dispatch(setTopFontFamily(v))}
              textAlign={topTextAlign}
              setTextAlign={v => dispatch(setTopTextAlign(v))}
              onClose={() => setOpenMenu(null)}
            />
          )}
        </InputWrapper>

        <InputWrapper>
          <Input
            type="text"
            placeholder="Text #2"
            value={bottomText}
            onChange={e => dispatch(setBottomText(e.target.value))}
          />
          <SettingsIcon onClick={() => setOpenMenu(openMenu === 'bottom' ? null : 'bottom')} aria-label="Text 2 settings">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 13.5A3.5 3.5 0 1 0 10 6.5a3.5 3.5 0 0 0 0 7zm7-3.5c0-.47-.04-.93-.1-1.38l1.6-1.25a.5.5 0 0 0 .12-.64l-1.52-2.63a.5.5 0 0 0-.6-.23l-1.88.76a7.03 7.03 0 0 0-1.2-.7l-.28-2A.5.5 0 0 0 12.5 2h-3a.5.5 0 0 0-.5.42l-.28 2c-.42.18-.82.4-1.2.7l-1.88-.76a.5.5 0 0 0-.6.23L2.52 7.22a.5.5 0 0 0 .12.64l1.6 1.25c-.06.45-.1.91-.1 1.38s.04.93.1 1.38l-1.6 1.25a.5.5 0 0 0-.12.64l1.52 2.63a.5.5 0 0 0 .6.23l1.88-.76c.38.3.78.52 1.2.7l.28 2a.5.5 0 0 0 .5.42h3a.5.5 0 0 0 .5-.42l.28-2c.42-.18.82-.4 1.2-.7l1.88.76a.5.5 0 0 0 .6-.23l1.52-2.63a.5.5 0 0 0-.12-.64l-1.6-1.25c.06-.45.1-.91.1-1.38z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
          </SettingsIcon>
          {openMenu === 'bottom' && (
            <SettingsMenu
              fontSize={bottomFontSize}
              setFontSize={v => dispatch(setBottomFontSize(v))}
              fontFamily={bottomFontFamily}
              setFontFamily={v => dispatch(setBottomFontFamily(v))}
              textAlign={bottomTextAlign}
              setTextAlign={v => dispatch(setBottomTextAlign(v))}
              onClose={() => setOpenMenu(null)}
            />
          )}
        </InputWrapper>
      </InputGroup>
      
      <ResetButton onClick={handleResetText}>
        Reset Text
      </ResetButton>
    </>
  );
};

// Styled components
const InputGroup = styled.div`
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
  box-sizing: border-box;
  margin-bottom: 1rem;

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  background: ${({ theme }) => theme.colors.input.background};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

// Same style as in Draw and Rotate panels
const ResetButton = styled.button`
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

export default TextPanel;