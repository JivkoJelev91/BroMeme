import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from 'store';
import { setMemeImage, setMemeImageName, setActiveTab } from '../redux';
import { supabase } from '../supabase/supabaseConfig';

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  categories: string[];
  created_at: string;
}

interface MemeTemplatesPanelProps {
  category: string;
}

// Component
const MemeTemplatesPanel: React.FC<MemeTemplatesPanelProps> = ({ category }) => {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    fetchTemplates();
  }, [category]);
  
  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching templates for category: ${category}`);
      
      let query = supabase.from('meme_templates').select('*');
      
      // Apply category filter if not "all"
      if (category !== 'all') {
        query = query.filter('categories', 'cs', `{${category}}`);
      }
      
      // Get results
      const { data, error } = await query;
      
      console.log('Fetched templates:', data, 'Error:', error);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setTemplates(data || []);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message);
      setTemplates([]);
    } finally {
      setIsLoading(false);
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
    switch(category) {
      case 'popular': return 'Popular Memes';
      case 'hot': return 'Hot Memes';
      case 'classic': return 'Classic Memes';
      case 'reaction': return 'Reaction Memes';
      case 'cat': return 'Cat Memes';
      case 'dog': return 'Dog Memes';
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
                <TemplateName>{template.name}</TemplateName>
              </TemplateCard>
            ))
          ) : (
            <NoResults>
              <div>No templates found for {category} category.</div>
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

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