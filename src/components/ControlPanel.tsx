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
        
        <MemeTitle>{displayImageName()}</MemeTitle>
        
        <TabContentWrapper>
          {renderTabContent()}
        </TabContentWrapper>
        
        {/* Spacer to ensure content doesn't get hidden behind the sticky button */}
        <ButtonSpacer />
      </ScrollableContent>
      
      // Change it to only show for editor tabs, not for upload:
<StickyButtonContainer>
  {activeTab !== 'upload' && (
    <GenerateButton onClick={downloadMeme} disabled={!memeImage}>
      Generate Meme
    </GenerateButton>
  )}
</StickyButtonContainer>
    </ControlsContainer>
  );
};

// Styled components
const ControlsContainer = styled.div`
  flex: 0 0 40%;
  border-left: 1px solid #eaeaea;
  position: relative;
  height: 450px; /* Match MemeCard height */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex: 1 0 100%;
    height: auto;
    min-height: 400px;
    border-left: none;
    border-top: 1px solid #eaeaea;
    margin-top: 1rem;
  }
`;

const ScrollableContent = styled.div`
  padding: 1.25rem 1.25rem 0;
  flex: 1;
  overflow-y: auto;
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
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.25rem;
  background: white;
  border-top: 1px solid #f5f5f5;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ControlTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #eaeaea;
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
  color: ${props => props.active ? '#000' : '#777'};
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
    background: ${props => props.active ? '#4285f4' : 'transparent'};
  }
`;

const MemeTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0;
  margin-bottom: 1.25rem;
  color: #222;
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
  background: #4285f4;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #3367d6;
  }
  
  &:disabled {
    background: #a1c0fa;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 0;
  }
`;

export default ControlPanel;