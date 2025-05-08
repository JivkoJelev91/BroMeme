import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAppDispatch, useAppSelector } from 'store';
import { setMemeImage, setMemeImageName, setActiveTab } from '../redux';
import { supabase } from '../supabase/supabaseConfig';
import { FiHeart, FiCheckCircle, FiCheck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  categories: string[];
  created_at: string;
}

interface MemeTemplatesPanelProps {
  category: string;
  isFavorites?: boolean;
}

const MemeTemplatesPanel: React.FC<MemeTemplatesPanelProps> = ({ 
  category, 
  isFavorites = false 
}) => {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  // Fetch templates based on category or favorites
  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching templates for ${isFavorites ? 'favorites' : `category: ${category}`}`);
      
      if (isFavorites) {
        // For favorites view, we need to:
        // 1. Get the user's favorite template IDs
        // 2. Then get the actual templates with those IDs
        
        if (!user) {
          setTemplates([]);
          setError('You must be logged in to view favorites');
          return;
        }
        
        // First get the favorite template IDs
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('favorites')
          .select('template_id')
          .eq('user_id', user.id);
          
        if (favoriteError) throw new Error(favoriteError.message);
        
        // If no favorites found, return empty array
        if (!favoriteData?.length) {
          setTemplates([]);
          return;
        }
        
        // Extract the template IDs from favorites
        const templateIds = favoriteData.map(fav => fav.template_id);
        
        // Then fetch the templates with those IDs
        const { data: templatesData, error: templatesError } = await supabase
          .from('meme_templates')
          .select('*')
          .in('id', templateIds);
          
        if (templatesError) throw new Error(templatesError.message);
        
        setTemplates(templatesData || []);
      } else {
        // For regular category view, filter by category
        let query = supabase.from('meme_templates').select('*');
        
        // Apply category filter if not "all"
        if (category !== 'all') {
          // For dog/cat categories which might have special handling
          if (category === 'dog' || category === 'cat') {
            query = query.contains('categories', [category.toLowerCase()]);
          } else {
            query = query.filter('categories', 'cs', `{${category}}`);
          }
        }
        
        // Get results
        const { data, error } = await query;
        
        if (error) throw new Error(error.message);
        
        setTemplates(data || []);
      }
      
      // Also fetch user's favorites to highlight them
      if (user) {
        fetchUserFavorites();
      }
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch user's favorites
  const fetchUserFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('template_id')
        .eq('user_id', user.id);
        
      if (error) throw new Error(error.message);
      
      setFavoriteIds(data.map(item => item.template_id));
    } catch (err: any) {
      console.error('Error fetching user favorites:', err);
    }
  };

  // Fetch templates when component mounts or category/favorites changes
  useEffect(() => {
    fetchTemplates();
  }, [category, isFavorites, user]);

  const toggleFavorite = async (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent template selection when clicking favorite button
    
    if (!user) return;
    
    const isFavorite = favoriteIds.includes(templateId);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('template_id', templateId);
          
        if (error) throw new Error(error.message);
        
        setFavoriteIds(prev => prev.filter(id => id !== templateId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            template_id: templateId
          });
          
        if (error) throw new Error(error.message);
        
        setFavoriteIds(prev => [...prev, templateId]);
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  const handleSelectTemplate = (template: MemeTemplate) => {
    // Create a new Image object to load the template
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the image on canvas to get a data URL
        ctx.drawImage(img, 0, 0);
        try {
          const dataUrl = canvas.toDataURL('image/png');
          dispatch(setMemeImage(dataUrl));
          dispatch(setMemeImageName(template.name));
          // Switch to the editor after selecting a template
          dispatch(setActiveTab('text'));
        } catch (error) {
          console.error('Error converting image to data URL:', error);
          // Fallback - just set the image URL directly
          dispatch(setMemeImage(template.url));
          dispatch(setMemeImageName(template.name));
          dispatch(setActiveTab('text'));
        }
      }
    };
    
    img.onerror = () => {
      console.error('Error loading image:', template.url);
      // Fallback - just set the image URL directly
      dispatch(setMemeImage(template.url));
      dispatch(setMemeImageName(template.name));
      dispatch(setActiveTab('text'));
    };
    
    img.src = template.url;
  };
  
  // Get the category title for display
  const getCategoryTitle = () => {
    if (isFavorites) return 'My Favorites';
    
    switch(category) {
      case 'popular': return 'Popular Memes';
      case 'hot': return 'Hot Memes';
      case 'classic': return 'Classic Memes';
      case 'reaction': return 'Reaction Memes';
      case 'cat': return 'Cat Memes';
      case 'dog': return 'Dog Memes';
      case 'all': return 'All Memes';
      default: return 'Meme Templates';
    }
  };

  return (
    <Container>
      <HeaderSection>
        <CategoryTitle>{getCategoryTitle()}</CategoryTitle>
      </HeaderSection>
      
      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <div>Loading templates...</div>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <div>Error loading templates: {error}</div>
          <RefreshButton onClick={fetchTemplates}>Try Again</RefreshButton>
        </ErrorContainer>
      ) : (
        <TemplatesGrid>
          {templates.length > 0 ? (
            templates.map(template => (
              <TemplateCard key={template.id} onClick={() => handleSelectTemplate(template)}>
                <TemplateImage src={template.url} alt={template.name} />
                {user && (
                  <FavoriteButton 
                    onClick={(event) => toggleFavorite(template.id, event)}
                    isFavorite={favoriteIds.includes(template.id)}
                  >
                    {favoriteIds.includes(template.id) ? <FaHeart /> : <FiHeart />}
                  </FavoriteButton>
                )}
                <TemplateName>{template.name}</TemplateName>
              </TemplateCard>
            ))
          ) : (
            <NoResults>
              {isFavorites ? (
                <div>
                  You haven't added any favorites yet.
                  <br />
                  Click the heart icon on memes to add them to your favorites.
                </div>
              ) : (
                <div>No templates found for {category} category.</div>
              )}
              <DebugButton onClick={async () => {
                const { data } = await supabase.from('meme_templates').select('*');
                console.log('All templates in database:', data);
                alert(`Database has ${data?.length || 0} total templates. Check console.`);
              }}>
                Check Database
              </DebugButton>
            </NoResults>
          )}
        </TemplatesGrid>
      )}
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  width: 100%;
  max-width: var(--app-max-width, 1000px); /* Match your app's max-width */
  margin: 0 auto;
  box-sizing: border-box;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CategoryTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  
  /* Desktop - more columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
  
  /* Large Desktop - even more columns */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #bbb;
  }
`;

const TemplateCard = styled.div`
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
  position: relative; /* Add this to make FavoriteButton position relative to the card */
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

// Update TemplateImage to fit within the container
const TemplateImage = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
`;

const TemplateName = styled.div`
  font-size: 0.85rem;
  padding: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid #f0f0f0;
`;

const HeartAnimation = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

const FavoriteButton = styled.button<{ isFavorite?: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  color: ${props => props.isFavorite ? 'red' : '#777'};
  z-index: 2;
  transition: background 0.2s;
  
  svg {
    animation: ${props => props.isFavorite ? css`${HeartAnimation} 0.3s ease forwards` : 'none'};
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    color: ${props => props.isFavorite ? '#e00' : '#ff4b4b'};
  }
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #888;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #d32f2f;
  text-align: center;
  gap: 1rem;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
`;

const RefreshButton = styled.button`
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const DebugButton = styled.button`
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  
  &:hover {
    background: #e0e0e0;
  }
`;

export default MemeTemplatesPanel;