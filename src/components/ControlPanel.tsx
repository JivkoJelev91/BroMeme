import React from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch, setActiveTab, RootState } from 'store';
import { TextPanel, EffectsPanel, DrawPanel, RotatePanel } from 'components';
import UploadPanel from './panels/UploadPanel';

// Component
interface ControlPanelProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadMeme: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  handleImageUpload,
  downloadMeme
}) => {
  const dispatch = useAppDispatch();
  const { activeTab, memeImage, memeImageName } = useAppSelector((state: RootState) => state.meme);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Display truncated image name function
  const displayImageName = () => {
    if (!memeImageName) return '';
    return memeImageName.length > 20 
      ? memeImageName.substring(0, 17) + '...' 
      : memeImageName;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "text":
        return <TextPanel handleImageUpload={handleImageUpload} />;
      case "effects":
        return <EffectsPanel />;
      case "draw":
        return <DrawPanel />;
      case "rotate":
        return <RotatePanel />;
        case "upload":
        return <UploadPanel />;
      default:
        return null;
    }
  };

  return (
    <ControlsContainer>
      <ScrollableContent>
        <ControlTabs>
          <ControlTab 
            active={activeTab === 'text'} 
            onClick={() => dispatch(setActiveTab('text'))}
          >
            <TabIcon>T</TabIcon>
            <TabLabel>Text</TabLabel>
          </ControlTab>
          <ControlTab 
            active={activeTab === 'effects'} 
            onClick={() => dispatch(setActiveTab('effects'))}
          >
            <TabIcon>✨</TabIcon>
            <TabLabel>Effects</TabLabel>
          </ControlTab>
          <ControlTab 
            active={activeTab === 'draw'} 
            onClick={() => dispatch(setActiveTab('draw'))}
          >
            <TabIcon>✏️</TabIcon>
            <TabLabel>Draw</TabLabel>
          </ControlTab>
          <ControlTab 
            active={activeTab === 'rotate'} 
            onClick={() => dispatch(setActiveTab('rotate'))}
          >
            <TabIcon>↻</TabIcon>
            <TabLabel>Rotate</TabLabel>
          </ControlTab>
          {isAuthenticated && (
            <ControlTab 
              active={activeTab === 'upload'}
              onClick={() => dispatch(setActiveTab('upload'))}
            >
              <TabIcon>📤</TabIcon>
              Upload
            </ControlTab>
          )}
        </ControlTabs>
        
        {activeTab !== 'upload' && <MemeTitle>{displayImageName()}</MemeTitle>}
        
        <TabContentWrapper>
          {renderTabContent()}
        </TabContentWrapper>
        
        {/* Spacer to ensure content doesn't get hidden behind the sticky button */}
        <ButtonSpacer />
      </ScrollableContent>
      
  {activeTab !== 'upload' && (
<StickyButtonContainer>
    <GenerateButton onClick={downloadMeme} disabled={!memeImage}>
      Generate Meme
    </GenerateButton>
</StickyButtonContainer>
  )}
    </ControlsContainer>
  );
};

// Styled components
const ControlsContainer = styled.div`
  flex: 0 0 40%;
  border-left: 1px solid ${({ theme }) => theme.colors.border.light};
  position: relative;
  height: 400px; /* Match MemeCard height */
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.cardBackground};
  
  @media (max-width: 768px) {
    flex: 1 0 100%;
    height: auto;
    min-height: 400px;
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
    margin-top: 1rem;
  }
`;

const ScrollableContent = styled.div`
  padding: 1.25rem 1.25rem 0;
  flex: 1;
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  @media (max-width: 768px) {
    padding: 1rem 1rem 0;
  }
`;

const TabContentWrapper = styled.div`
  min-height: 200px;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    min-height: 150px;
  }
`;

const ButtonSpacer = styled.div`
  height: 80px; /* Ensures content is not hidden behind the sticky button */
  
  @media (max-width: 768px) {
    height: 70px;
  }
`;

const StickyButtonContainer = styled.div`
  position: absolute;
  bottom: -65px;
  left: 0;
  right: 0;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ControlTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  margin-bottom: 1.25rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    justify-content: space-around;
  }
`;

const TabIcon = styled.span`
  font-size: 1.1rem;
  display: none;
  
  @media (max-width: 480px) {
    display: block;
    margin-bottom: 0.2rem;
  }
`;

const TabLabel = styled.span`
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const ControlTab = styled.button<{ active?: boolean }>`
  padding: 0.6rem 0.9rem;
  border: none;
  background: none;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => props.active ? 
    props.theme.colors.text.primary : 
    props.theme.colors.text.secondary};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.7rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.5rem;
    flex: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.active ? 
      props.theme.colors.primary : 'transparent'};
  }
`;

const MemeTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0;
  margin-bottom: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.primary}66;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 0;
  }
`;

const PanelContainer = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  
  @media (min-width: 768px) {
    width: 38%;
  }
  
  @media (max-width: 767px) {
    margin-top: 1rem;
  }
`;

const PanelHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PanelContent = styled.div`
  padding: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
  }
`;

export default ControlPanel;