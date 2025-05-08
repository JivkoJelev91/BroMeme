import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from 'store';
import { setActiveTab, setMemeImage, setMemeImageName } from '../redux';
import { getPopularMemes, MemeTemplate } from '../memeTemplates';

const HotMemes: React.FC = () => {
  const [hotMemes] = useState(getPopularMemes());
  const dispatch = useAppDispatch();
  
  const handleSelectMeme = (meme: MemeTemplate) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const dataUrl = canvas.toDataURL('image/png');
          dispatch(setMemeImage(dataUrl));
          dispatch(setMemeImageName(meme.name));
        } catch (error) {
          // Fallback
          dispatch(setMemeImage(meme.url));
          dispatch(setMemeImageName(meme.name));
        }
      }
    };
    
    img.onerror = () => {
      // Fallback on error
      dispatch(setMemeImage(meme.url));
      dispatch(setMemeImageName(meme.name));
    };
    
    img.src = meme.url;
  };
  
  return (
    <Container>
      <HeaderRow>
        <Title>Hot Meme Templates</Title>
        <ViewAllLink href="#" onClick={(e) => {
          e.preventDefault();
          dispatch(setActiveTab('hot'));
        }}>
          View All
        </ViewAllLink>
      </HeaderRow>
      
      <MemeGrid>
        {hotMemes.slice(0,5).map(meme => (
          <MemeCard 
            key={meme.id}
            onClick={() => handleSelectMeme(meme)}
          >
            <MemeImageContainer>
              <MemeImage src={meme.url} alt={meme.name} />
            </MemeImageContainer>
            <MemeName>{meme.name}</MemeName>
          </MemeCard>
        ))}
      </MemeGrid>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 2px 6px ${({ theme }) => theme.colors.shadow};
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ViewAllLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
`;

const MemeCard = styled.div`
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px ${({ theme }) => theme.colors.shadow};
  transition: transform 0.2s, box-shadow 0.2s;
  background: ${({ theme }) => theme.colors.cardBackground};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px ${({ theme }) => theme.colors.shadow};
  }
`;

const MemeImageContainer = styled.div`
  height: 140px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.divider};
`;

const MemeImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const MemeName = styled.div`
  padding: 0.75rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
`;

export default HotMemes;