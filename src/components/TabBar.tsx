import React from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { setActiveTab } from '../redux';

const TabBar: React.FC = () => {
  const { activeTab } = useAppSelector(state => state.meme);
  const dispatch = useAppDispatch();
  
  return (
    <TabBarContainer>
      <TabsGroup>
        {/* Editor tab */}
        <Tab 
          $active={activeTab === 'text' || activeTab === 'effects' || activeTab === 'draw'}
          onClick={() => dispatch(setActiveTab('text'))}
          data-tab="text"
        >
          <TabIcon>✏️</TabIcon>
          <TabLabel>Editor</TabLabel>
        </Tab>
        
        {/* AI Editor tab - DISABLED */}
        <Tab $active={false} style={{ cursor: 'not-allowed', opacity: 0.5 }}>
          <TabIcon>🤖</TabIcon>
          <TabLabel>AI Editor</TabLabel>
        </Tab>
        {/* Template category tabs */}
        <Tab 
          $active={activeTab === 'favorites'} 
          onClick={() => dispatch(setActiveTab('favorites'))}
        >
          <TabIcon>🎭</TabIcon>
          <TabLabel>Favorites</TabLabel>
        </Tab>
        <Tab 
          $active={activeTab === 'popular'}
          onClick={() => dispatch(setActiveTab('popular'))}
          data-tab="popular"
        >
          <TabIcon>🔥</TabIcon>
          <TabLabel>Popular</TabLabel>
        </Tab>

        <Tab 
          $active={activeTab === 'hot'}
          onClick={() => dispatch(setActiveTab('hot'))}
        >
          <TabIcon>⚡</TabIcon>
          Hot
        </Tab>
        
        <Tab 
          $active={activeTab === 'classic'}
          onClick={() => dispatch(setActiveTab('classic'))}
        >
          <TabIcon>🏆</TabIcon>
          Classic
        </Tab>
        
        <Tab 
          $active={activeTab === 'reaction'}
          onClick={() => dispatch(setActiveTab('reaction'))}
          data-tab="reaction"
        >
          <TabIcon>😂</TabIcon>
          <TabLabel>Reaction</TabLabel>
        </Tab>
        
        <Tab 
          $active={activeTab === 'cat'}
          onClick={() => dispatch(setActiveTab('cat'))}
          data-tab="cats"
        >
          <TabIcon>🐱</TabIcon>
          <TabLabel>Cat</TabLabel>
        </Tab>
        
        <Tab 
          $active={activeTab === 'dog'}
          onClick={() => dispatch(setActiveTab('dog'))}
          data-tab="dogs"
        >
          <TabIcon>🐶</TabIcon>
          <TabLabel>Dog</TabLabel>
        </Tab>
        <Tab 
          $active={activeTab === 'all'} 
          onClick={() => dispatch(setActiveTab('all'))}
        >
          <TabIcon>🎭</TabIcon>
          <TabLabel>All</TabLabel>
        </Tab>
      </TabsGroup>
    </TabBarContainer>
  );
};

// Styled components
const TabBarContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  max-width: 1000px;
  width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth; /* Add smooth scrolling */
  
  /* Add space between tab groups */
  justify-content: space-between;
  
  /* Hide scrollbar but keep functionality */
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
  scrollbar-width: none;
  
  /* Add snap scrolling for better tab alignment */
  scroll-snap-type: x mandatory;
  
  /* Prevent scroll chaining */
  overscroll-behavior-x: contain;
`;

const TabsGroup = styled.div`
  display: flex;
  gap: 0.25rem;
  
  /* Make first group stay left and second group stay right */
  &:first-child {
    margin-right: auto;
  }
  
  &:last-child {
    margin-left: auto;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  border: none;
  background: ${props => props.$active ? 
    props.theme.colors.secondary : 'transparent'};
  color: ${props => props.$active ? 
    props.theme.colors.primary : props.theme.colors.text.secondary};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 95px; /* Fixed width for all tabs */
  min-height: 70px; /* Ensure consistent height */
  
  &:hover {
    background: ${props => props.$active ? 
      props.theme.colors.secondary : 
      props.theme.colors.divider};
  }
  
  /* Make it responsive for smaller screens */
  @media (max-width: 768px) {
    width: 90px;
    min-height: 65px;
    padding: 0.6rem 0.4rem;
  }
  
  @media (max-width: 576px) {
    width: 80px;
    min-height: 60px;
    padding: 0.5rem 0.3rem;
  }
`;

const TabIcon = styled.div`
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TabLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default TabBar;