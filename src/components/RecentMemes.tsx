import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/store';
import { setActiveTab, setMemeImageName, setMemeImage } from '../redux/slices/memeSlice';
import { MemeTemplate } from '../utils/uploadService';
import { supabase } from '../supabase/supabaseConfig';

const RecentMemes: React.FC = () => {
  const [hotMemes, setHotMemes] = useState<MemeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const fetchHotMemes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Determine limit based on screen width
        const isMobile = window.innerWidth <= 768;
        const limit = isMobile ? 6 : 5;
        
        // Fetch memes from Supabase
        const { data, error } = await supabase
          .from('meme_templates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw new Error(error.message);
        
        if (data) {
          setHotMemes(data);
        }
      } catch (err: unknown) {
        console.error('Error fetching recent memes:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add window resize listener to refresh when screen size changes
    const handleResize = () => {
      fetchHotMemes();
    };
    
    window.addEventListener('resize', handleResize);
    fetchHotMemes();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
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
        } catch (_error) {
          // Fallback
          console.error('Error converting image to data URL:', _error);
        }
      }
    };
    
    // Fix: meme.url is always a string, remove typeof check
    img.src = meme.url;
  };
  
  return (
    <Container>
      <HeaderRow>
        <Title>Recent Memes</Title>
        <ViewAllLink href="#" onClick={(e) => {
          e.preventDefault();
          dispatch(setActiveTab('all'));
        }}>
          View All
        </ViewAllLink>
      </HeaderRow>
      
      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading hot templates...</LoadingText>
        </LoadingContainer>
      ) : error ? (
        <ErrorMessage>
          Failed to load templates. Please try again later.
        </ErrorMessage>
      ) : hotMemes.length === 0 ? (
        <EmptyState>
          <EmptyText>No templates available yet.</EmptyText>
        </EmptyState>
      ) : (
        <MemeGrid>
          {hotMemes.map(meme => (
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
      )}
    </Container>
  );
};

// Add new styled components for loading and error states
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingSpinner = styled.div`
  border: 3px solid ${({ theme }) => theme.colors.divider};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.error}15;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin: 2rem 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyText = styled.div`
  font-size: 0.9rem;
  text-align: center;
`;

const Container = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 2px 6px ${({ theme }) => theme.colors.shadow};
  width: 100%;
  overflow: visible;
  z-index: 1;
  
  @media (max-width: a576px) {
    padding: 1rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  padding-bottom: 0.75rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
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
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr); /* Show 3 memes per row on tablet */
  }
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr); /* Show 2 memes per row on mobile */
    gap: 0.75rem; /* Smaller gap on mobile */
  }
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

export default RecentMemes;