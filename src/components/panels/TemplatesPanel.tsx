import React from 'react';
import styled from 'styled-components';
import { HotMemes } from 'components';

// Component
const TemplatesPanel: React.FC = () => {
  return (
    <TemplatesPanelContainer>
      <HotMemes />
      
      <TemplatesSection>
        <SectionTitle>All Templates</SectionTitle>
        <ComingSoonMessage>
          Full template library coming soon!
        </ComingSoonMessage>
      </TemplatesSection>
    </TemplatesPanelContainer>
  );
};

// Styled components
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

const ComingSoonMessage = styled.div`
  text-align: center;
  color: #888;
  padding: 2rem 0;
  font-style: italic;
`;

export default TemplatesPanel;