/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { setMemeImage, setMemeImageName, setActiveTab } from '../redux';
import { supabase } from '../supabase/supabaseConfig';
import { FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  // Fetch templates based on category or favorites
  const fetchTemplates = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      if (isFavorites) {
        // For favorites view
        if (!user) {
          setTemplates([]);
          setError('You must be logged in to view favorites');
          return;
        }
        
        try {
          // First just get all favorite template IDs for this user
          const { data: favoriteData, error: favoriteError } = await supabase
            .from('favorites')
            .select('template_id')
            .eq('user_id', user.id);
            
          if (favoriteError) throw new Error(favoriteError.message);
          
          // If no favorites found, return empty array
          if (!favoriteData?.length) {
            setTemplates([]);
            setTotalPages(1);
            return;
          }
          
          // Set total items and pages
          const count = favoriteData.length;
          setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
          
          // Extract the template IDs for the current page
          const templateIds = favoriteData
            .map(fav => fav.template_id)
            .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
          
          // Then fetch the templates with those IDs
          const { data: templatesData, error: templatesError } = await supabase
            .from('meme_templates')
            .select('*')
            .in('id', templateIds);
            
          if (templatesError) throw new Error(templatesError.message);
          
          setTemplates(templatesData || []);
        } catch (err: unknown) {
          console.error('Error fetching favorites:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setTemplates([]);
        }
        
      } else {
        // For regular category view, filter by category
        let countQuery = supabase.from('meme_templates').select('id', { count: 'exact' });
        let dataQuery = supabase
                .from('meme_templates')
                .select('*')
                .order('created_at', { ascending: false }) // Sort by newest first
                .range(from, to);        
        // Apply category filter if not "all"
        if (category !== 'all') {
          if (category === 'dog' || category === 'cat') {
            countQuery = countQuery.contains('categories', [category.toLowerCase()]);
            dataQuery = dataQuery.contains('categories', [category.toLowerCase()]);
          } else {
            countQuery = countQuery.filter('categories', 'cs', `{${category}}`);
            dataQuery = dataQuery.filter('categories', 'cs', `{${category}}`);
          }
        }
        
        // Get total count first
        const { count, error: countError } = await countQuery;
        
        if (countError) throw new Error(countError.message);
        
        setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
        
        // Then get the data for current page
        const { data, error } = await dataQuery;
        
        if (error) throw new Error(error.message);
        
        setTemplates(data || []);
      }
      
      // Also fetch user's favorites to highlight them
      if (user) {
        fetchUserFavorites();
      }
    } catch (err: unknown) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTemplates([]);
      setTotalPages(1);
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
    } catch (err: unknown) {
      console.error('Error fetching user favorites:', err);
    }
  };
  // Fetch templates when component mounts or category/favorites/page changes
  useEffect(() => {
    fetchTemplates(currentPage);
  }, [category, isFavorites, user, currentPage]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, isFavorites]);

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
    } catch (err: unknown) {
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
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
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
          <RefreshButton onClick={() => fetchTemplates(currentPage)}>Try Again</RefreshButton>
        </ErrorContainer>
      ) : !user && isFavorites ? (
        <LoginPromptContainer>
          <LoginIcon>❤️</LoginIcon>
          <LoginTitle>Your Favorites Await!</LoginTitle>
          <LoginMessage>
            Log in to save your favorite meme templates and access them anytime.
          </LoginMessage>
          <LoginButton onClick={() => setAuthModalOpen(true)}>
            Sign In
          </LoginButton>
        </LoginPromptContainer>
      ) : (
        <MainContent>
          <TemplatesGrid>
            {templates.length > 0 ? (
              templates.map(template => (
                <TemplateCard 
                  key={template.id} 
                  onClick={() => handleSelectTemplate(template)}
                >
                  <TemplateImage src={template.url} alt={template.name} />
                  {user && (
                    <FavoriteButton 
                      onClick={(event) => toggleFavorite(template.id, event)}
                      $isFavorite={favoriteIds.includes(template.id)}
                    >
                      {favoriteIds.includes(template.id) ? <FaHeart /> : <FiHeart />}
                    </FavoriteButton>
                  )}
                  <TemplateName>{template.name}</TemplateName>
                </TemplateCard>
              ))
            ) : (
             <NoResults>
              <EmptyStateIcon>🔍</EmptyStateIcon>
              <EmptyStateTitle>No templates found</EmptyStateTitle>
              <EmptyStateMessage>
                We couldn't find any memes in the <CategoryBadge>{getCategoryTitle().toLowerCase()}</CategoryBadge> category.
              </EmptyStateMessage>
              <EmptyStateActions>
                <EmptyStateButton onClick={() => dispatch(setActiveTab('all'))}>
                  Browse all memes
                </EmptyStateButton>
                <EmptyStateLink onClick={() => fetchTemplates(currentPage)}>
                  Try again
                </EmptyStateLink>
              </EmptyStateActions>
            </NoResults>
            )}
          </TemplatesGrid>
          
          {templates.length > 0 && totalPages > 1 && (
            <PaginatorContainer>
              <PaginatorControls>
                <PageButton 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                </PageButton>
                
                <PageNumbers>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // For simplicity, just show 5 pages
                    let pageToShow;
                    
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageToShow = i + 1;
                    } else {
                      // Otherwise, center around current page
                      const middle = Math.min(Math.max(currentPage, 3), totalPages - 2);
                      pageToShow = middle - 2 + i;
                    }
                    
                    return (
                      <PageNumber
                        key={pageToShow}
                        $isActive={currentPage === pageToShow}
                        onClick={() => handlePageChange(pageToShow)}
                      >
                        {pageToShow}
                      </PageNumber>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PageEllipsis>...</PageEllipsis>
                      <PageNumber
                        $isActive={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PageNumber>
                    </>
                  )}
                </PageNumbers>
                
                <PageButton 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <FiChevronRight />
                </PageButton>
              </PaginatorControls>
            </PaginatorContainer>
          )}
        </MainContent>
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

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
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

const FavoriteButton = styled.button<{ $isFavorite?: boolean }>`
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
  color: ${props => props.$isFavorite ? 
    props.theme.colors.favorite : props.theme.colors.text.tertiary};
  z-index: 2;
  transition: all 0.2s;
  
  svg {
    stroke-width: ${props => props.$isFavorite ? 2.5 : 2};
    transition: all 0.2s;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    color: ${props => props.$isFavorite ? 
      props.theme.colors.error : props.theme.colors.favorite};
    transform: scale(1.05);
  }
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

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PaginatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0 1rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PaginatorControls = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  svg {
    stroke-width: 2;
    font-size: 1.1rem;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -0.5rem;
    width: 1px;
    height: 24px;
    background: ${({ theme }) => theme.colors.divider};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -0.5rem;
    width: 1px;
    height: 24px;
    background: ${({ theme }) => theme.colors.divider};
  }
`;

const PageNumber = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  border: none;
  background: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.primary : 'transparent'};
  color: ${({ $isActive, theme }) => 
    $isActive ? 'white' : theme.colors.text.primary};
  font-weight: ${({ $isActive }) => $isActive ? '500' : '400'};
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 6px;
  margin: 0 0.15rem;
  position: relative;
  overflow: hidden;
  
  ${({ $isActive }) => !$isActive && `
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    &:active {
      background-color: rgba(0, 0, 0, 0.08);
    }
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.3s ease-out;
    pointer-events: none;
  }
  
  &:active::after {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
    transition: transform 0.5s, opacity 0.3s;
  }
`;

const PageEllipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 36px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0.1rem;
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
  grid-column: 1 / -1;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmptyStateMessage = styled.div`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  max-width: 300px;
`;

const CategoryBadge = styled.span`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
`;

const EmptyStateActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`;

const EmptyStateButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover || theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const EmptyStateLink = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  padding: 0.4rem;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export default MemeTemplatesPanel;