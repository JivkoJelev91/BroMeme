import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from 'store';
import { setActiveTab } from '../redux';

const TabBar: React.FC = () => {
  const { activeTab } = useAppSelector(state => state.meme);
  const dispatch = useAppDispatch();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Check if scrolling is needed and scroll to active tab
  useEffect(() => {
    const tabList = tabListRef.current;
    if (tabList) {
      const checkOverflow = () => {
        setShowScrollButtons(tabList.scrollWidth > tabList.clientWidth);
      };
      
      // Initial check
      checkOverflow();
      
      // Check on resize
      window.addEventListener('resize', checkOverflow);
      
      // Scroll to active tab
      const activeTabElement = tabList.querySelector(`[data-tab="${activeTab}"]`);
      if (activeTabElement) {
        const tabRect = activeTabElement.getBoundingClientRect();
        const listRect = tabList.getBoundingClientRect();
        
        if (tabRect.left < listRect.left || tabRect.right > listRect.right) {
          tabList.scrollLeft = (activeTabElement as HTMLElement).offsetLeft - 20;
        }
      }
      
      return () => window.removeEventListener('resize', checkOverflow);
    }
  }, [activeTab]);
  
  // Scroll tab list left or right
  const scrollTabs = (direction: 'left' | 'right') => {
    const tabList = tabListRef.current;
    if (tabList) {
      const scrollAmount = tabList.clientWidth * 0.6;
      tabList.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <TabContainer>
      {showScrollButtons && (
        <ScrollButton 
          direction="left" 
          onClick={() => scrollTabs('left')}
          aria-label="Scroll tabs left"
        >
          ◀
        </ScrollButton>
      )}
      
      <TabList ref={tabListRef}>
        {/* Editor tab */}
        <Tab 
          active={activeTab === 'text' || activeTab === 'effects' || activeTab === 'draw' || activeTab === 'rotate'}
          onClick={() => dispatch(setActiveTab('text'))}
          data-tab="text"
        >
          <TabIcon>✏️</TabIcon>
          Editor
        </Tab>
        
        {/* AI Editor tab - DISABLED */}
        <DisabledTab>
          <TabIcon>🤖</TabIcon>
          AI Editor
        </DisabledTab>
        
        {/* Template category tabs */}
        <Tab 
          active={activeTab === 'favorites'} 
          onClick={() => dispatch(setActiveTab('favorites'))}
        >
          <TabIcon>🎭</TabIcon>
          Favorites
        </Tab>
        <Tab 
          active={activeTab === 'popular'}
          onClick={() => dispatch(setActiveTab('popular'))}
          data-tab="popular"
        >
          <TabIcon>🔥</TabIcon>
          Popular Memes
        </Tab>

        <Tab 
          active={activeTab === 'hot'}
          onClick={() => dispatch(setActiveTab('hot'))}
        >
          <TabIcon>⚡</TabIcon>
          Hot Memes
        </Tab>
        
        <Tab 
          active={activeTab === 'classic'}
          onClick={() => dispatch(setActiveTab('classic'))}
        >
          <TabIcon>🏆</TabIcon>
          Classic Memes
        </Tab>
        
        <Tab 
          active={activeTab === 'reaction'}
          onClick={() => dispatch(setActiveTab('reaction'))}
          data-tab="reaction"
        >
          <TabIcon>😂</TabIcon>
          Reaction Memes
        </Tab>
        
        <Tab 
          active={activeTab === 'cats'}
          onClick={() => dispatch(setActiveTab('cat'))}
          data-tab="cats"
        >
          <TabIcon>🐱</TabIcon>
          Cat Memes
        </Tab>
        
        <Tab 
          active={activeTab === 'dogs'}
          onClick={() => dispatch(setActiveTab('dog'))}
          data-tab="dogs"
        >
          <TabIcon>🐶</TabIcon>
          Dog Memes
        </Tab>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => dispatch(setActiveTab('all'))}
        >
          <TabIcon>🎭</TabIcon>
          All
        </Tab>
      </TabList>
      
      {showScrollButtons && (
        <ScrollButton 
          direction="right" 
          onClick={() => scrollTabs('right')}
          aria-label="Scroll tabs right"
        >
          ▶
        </ScrollButton>
      )}
    </TabContainer>
  );
};

// Styled components
const TabContainer = styled.div`
  max-width: 1000px;
  width: 100%;
  padding: 0 1.75rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin-bottom: 0.75rem;
  position: relative;
  display: flex;
  align-items: center;
`;

const TabList = styled.div`
  display: flex;
  overflow-x: auto;
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  padding: 0.25rem 0;
  scroll-behavior: smooth;
  flex: 1;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Make sure all tabs fit */
  & > * {
    flex-shrink: 0;
  }
`;

const ScrollButton = styled.button<{ direction: 'left' | 'right' }>`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5f6368;
  font-size: 10px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  ${props => props.direction === 'left' ? 'left: 4px;' : 'right: 4px;'}
  
  &:hover {
    background: #f5f5f5;
    color: #4285f4;
  }
  
  &:active {
    background: #e0e0e0;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 0.85rem;
  background: transparent;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  color: ${props => props.active ? '#4285f4' : '#5f6368'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 600px) {
    padding: 0.75rem 0.7rem;
    font-size: 0.85rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.active ? '#4285f4' : 'transparent'};
    border-radius: 3px 3px 0 0;
  }
  
  &:hover {
    color: #4285f4;
  }
`;

// Disabled tab styling
const DisabledTab = styled.div`
  padding: 0.75rem 0.85rem;
  background: transparent;
  border: none;
  font-size: 0.9rem;
  cursor: not-allowed;
  color: #a0a0a0;
  font-weight: normal;
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.7;
  
  @media (max-width: 600px) {
    padding: 0.75rem 0.7rem;
    font-size: 0.85rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: transparent;
    border-radius: 3px 3px 0 0;
  }
`;

const TabIcon = styled.span`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

export default TabBar;