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
  setBottomTextAlign,
  updateTextPosition
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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
    dispatch(
      updateTextPosition({
        position: "top",
        x: 0,
        y: -145,
      })
    );
    dispatch(
      updateTextPosition({
        position: "bottom",
        x: 0,
        y: 145,
      })
    );
  };

  // Create a wrapper for the handleImageUpload function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Store the file name for display
      setUploadedFileName(e.target.files[0].name);
      
      // Show success indicator
      setUploadSuccess(true);
      
      // Clear success indicator after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      
      // Call the original handler
      handleImageUpload(e);
    }
  };

  return (
    <>
      <InputGroup>
        <FileInputWrapper>
          <StyledFileInput 
            type="file" 
            id="memeImageUpload" 
            accept="image/*" 
            onChange={handleFileUpload} 
          />
          <FileInputLabel $success={uploadSuccess}>
            {uploadSuccess ? (
              <>
                <SuccessIcon>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SuccessIcon>
                <span>Uploaded: {uploadedFileName && uploadedFileName.length > 20 
                  ? uploadedFileName.substring(0, 20) + '...' 
                  : uploadedFileName}</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"/>
                </svg>
                Upload Custom Meme Template
              </>
            )}
          </FileInputLabel>
        </FileInputWrapper>

        <InputWrapper>
          <Input
            type="text"
            placeholder="Text #1"
            value={topText}
            onChange={e => dispatch(setTopText(e.target.value))}
            maxLength={60}
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
            maxLength={60}
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

const FileInputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
  height: 2.5rem; // Match your input height
`;

const StyledFileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
`;

const FileInputLabel = styled.div<{ $success?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
  box-sizing: border-box;
  border: 1px solid ${({ theme, $success }) => 
    $success ?  '#4caf50' : theme.colors.border.medium};
  background: ${({ theme, $success }) => 
    $success ? 'rgba(76, 175, 80, 0.08)' : theme.colors.input.background};
  color: ${({ theme, $success }) => 
    $success ? '#4caf50' : theme.colors.text.secondary};
  transition: all 0.3s ease;
  pointer-events: none;
  
  svg {
    margin-right: 8px;
  }
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: 4caf50
  color: white;
  margin-right: 8px;
`;

// Same style as in Draw
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