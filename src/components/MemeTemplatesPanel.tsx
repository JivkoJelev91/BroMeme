import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from 'store';
import { setMemeImage, setMemeImageName, setActiveTab } from '../redux';
import { supabase } from '../supabase/supabaseConfig';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import AuthModal from './AuthModal';

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
    const [authModalOpen, setAuthModalOpen] = useState(false);
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
          <Spinner />
          <div>Loading templates...</div>
        </LoadingContainer>
      ) : error && error !== 'You must be logged in to view favorites' ? (
        <ErrorContainer>
          <div>Error loading templates: {error}</div>
          <RefreshButton onClick={fetchTemplates}>Try Again</RefreshButton>
        </ErrorContainer>
      ) : !user && isFavorites ? (
        <LoginPromptContainer>
          <LoginIcon>❤️</LoginIcon>
          <LoginTitle>Your Favorites Await!</LoginTitle>
          <LoginMessage>
            Log in to save your favorite meme templates and access them anytime.
          </LoginMessage>
       <LoginButton onClick={() => {
          setAuthModalOpen(true)
        }}>
          Sign In
        </LoginButton>
        </LoginPromptContainer>
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
         {/* Auth Modal */}
            <AuthModal 
              isOpen={authModalOpen} 
              onClose={() => setAuthModalOpen(false)}
            />
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
  color: ${({ theme }) => theme.colors.text.primary};
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
    background: ${({ theme }) => theme.colors.divider};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const TemplateCard = styled.div`
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  transition: transform 0.2s, box-shadow 0.2s;
  background: ${({ theme }) => theme.colors.cardBackground};
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${({ theme }) => theme.colors.shadow};
  }
`;

const TemplateImage = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
`;

const TemplateName = styled.div`
  padding: 0.75rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
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
  color: ${props => props.isFavorite ? 
    props.theme.colors.favorite : props.theme.colors.text.tertiary};
  z-index: 2;
  transition: all 0.2s;
  
  svg {
    stroke-width: ${props => props.isFavorite ? 2.5 : 2};
    transition: all 0.2s;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    color: ${props => props.isFavorite ? 
      props.theme.colors.error : props.theme.colors.favorite};
    transform: scale(1.05);
  }
`;

const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Spinner = styled.div`
  border: 3px solid ${({ theme }) => theme.colors.divider};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: 2rem;
`;

const RefreshButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.divider};
  }
`;

const DebugButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.divider};
  }
`;

const LoginPromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem;
`;

const LoginIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const LoginTitle = styled.h3`
  font-size: 1.5rem;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const LoginMessage = styled.p`
  font-size: 1rem;
  margin: 0;
  margin-bottom: 1rem;
`;

const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.inverse};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const SecondaryAction = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActionLink = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export default MemeTemplatesPanel;