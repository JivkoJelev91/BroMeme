import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HotMemes } from 'components';
import { getAllMemeTemplates, getMemeTemplatesByCategory } from 'src/utils/uploadService';
import { useAppDispatch } from 'store';
import { setMemeImage } from '../../redux';

// Define MemeTemplate interface
interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  categories: string[];
  created_at: string;
}

interface TemplatesPanelProps {
  category?: string;
}

// Component
const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ category = 'popular' }) => {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If category is "all", get all templates
        // Otherwise get by category
        let fetchedTemplates;
        if (category === 'all') {
          fetchedTemplates = await getAllMemeTemplates();
        } else {
          fetchedTemplates = await getMemeTemplatesByCategory(category);
        }
        
        console.log(`Fetched ${fetchedTemplates.length} templates for category: ${category}`, fetchedTemplates);
        setTemplates(fetchedTemplates);
      } catch (err) {
        console.error(`Error fetching templates for category ${category}:`, err);
        setError('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [category]); // Reload when category changes

  const handleTemplateClick = (template: MemeTemplate) => {
    dispatch(setMemeImage(template.url));
  };

  return (
    <TemplatesPanelContainer>
      <HotMemes />
      
      <TemplatesSection>
        <SectionTitle>{category === 'all' ? 'All Templates' : `${category.charAt(0).toUpperCase() + category.slice(1)} Templates`}</SectionTitle>
        
        {isLoading && (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading templates...</LoadingText>
          </LoadingContainer>
        )}
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        {!isLoading && !error && templates.length === 0 && (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyText>No templates found in this category</EmptyText>
          </EmptyState>
        )}
        
        {!isLoading && !error && templates.length > 0 && (
          <TemplatesGrid>
            {templates.map(template => (
              <TemplateItem 
                key={template.id}
                onClick={() => handleTemplateClick(template)}
              >
                <TemplateImage src={template.url} alt={template.name} />
                <TemplateName>{template.name}</TemplateName>
              </TemplateItem>
            ))}
          </TemplatesGrid>
        )}
      </TemplatesSection>
    </TemplatesPanelContainer>
  );
};

// Add these styled components
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  text-align: center;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 1rem 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  color: #888;
`;

const EmptyIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-style: italic;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const TemplateItem = styled.div`
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TemplateImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
`;

const TemplateName = styled.div`
  padding: 0.5rem;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: white;
`;

// Your existing styled components
const TemplatesPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TemplatesSection = styled.div`
  padding: 0.5rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 1rem 0;
  color: #333;
`;

export default TemplatesPanel;