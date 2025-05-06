import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from 'store';
import { setMemeImage, setMemeImageName, setActiveTab } from '../redux';
import { memeTemplates, MemeTemplate } from '../memeTemplates';

interface TemplateGridProps {
  category: string;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({ category }) => {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    let filteredTemplates: MemeTemplate[];
    
    if (searchQuery.trim()) {
      // Search across all templates if there's a search query
      const lowercaseQuery = searchQuery.toLowerCase();
      filteredTemplates = memeTemplates.filter(meme => 
        meme.name.toLowerCase().includes(lowercaseQuery) || 
        meme.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } else if (category === 'popular') {
      // Popular memes - first 8 memes
      filteredTemplates = memeTemplates.slice(0, 8);
    } else if (category === 'hot') {
      // Hot memes - different set, maybe the most trending ones
      filteredTemplates = memeTemplates.filter(meme => 
        ['drake', 'distracted-boyfriend', 'two-buttons', 'woman-yelling-at-cat'].includes(meme.id)
      );
    } else if (category === 'all') {
      // All memes
      filteredTemplates = [...memeTemplates];
    } else {
      // Category specific memes
      filteredTemplates = memeTemplates.filter(meme => meme.category === category);
    }
    
    setTemplates(filteredTemplates);
  }, [category, searchQuery]);
  
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
      console.error('Error loading image');
      // Fallback - just set the image URL directly
      dispatch(setMemeImage(template.url));
      dispatch(setMemeImageName(template.name));
      dispatch(setActiveTab('text'));
    };
    
    img.src = template.url;
  };
  
  return (
    <Container>
      <SearchContainer>
        <SearchInput 
          type="text" 
          placeholder="Search templates..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>
      
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
            No templates found. Try a different search.
          </NoResults>
        )}
      </TemplatesGrid>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  padding: 1.25rem;
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SearchContainer = styled.div`
  margin-bottom: 1.25rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
  overflow-y: auto;
  flex: 1;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;

const TemplateCard = styled.div`
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TemplateImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
`;

const TemplateName = styled.div`
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #f9f9f9;
  border-top: 1px solid #eee;
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 0;
  color: #888;
  font-size: 1.1rem;
`;

export default TemplateGrid;