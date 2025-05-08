import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from 'store';
import { setActiveTab, setBottomText, setMemeImage, setMemeImageName, setTopText } from '../redux';
import { memeTemplates } from '../memeTemplates';
import { signOut } from '../redux/slices/authSlice';
import AuthModal from './AuthModal';
import { supabase } from '../supabase/supabaseConfig';
import { useTheme } from '../ThemeProvider';
import { FiSun, FiMoon } from 'react-icons/fi';

// Styled components
const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px ${({ theme }) => theme.colors.shadow};
  padding: 0.5rem 1rem;
  
  @media (max-width: 600px) {
    padding: 0.5rem;
    flex-wrap: wrap;
  }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  margin-right: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  
  @media (max-width: 600px) {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  @media (max-width: 350px) {
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.input.background};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  flex: 1;
  margin-right: 1rem;
  position: relative;
  
  @media (max-width: 600px) {
    padding: 0.3rem 0.6rem;
    margin-right: 0.5rem;
  }
  
  @media (max-width: 480px) {
    order: 3;
    margin-top: 0.5rem;
    margin-right: 0;
    width: 100%;
    flex-basis: 100%;
  }
`;

const SearchIcon = styled.span`
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  
  @media (max-width: 600px) {
    margin-right: 0.3rem;
    font-size: 0.9rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 1rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.input.placeholder};
  }
  
  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  
  @media (max-width: 480px) {
    margin-left: auto;
  }
`;

// Enhanced Avatar styling
const Avatar = styled.div`
  width: 38px;
  height: 38px;
  background: ${({ theme }) => theme.colors.avatarBackground};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1rem;
  
  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
`;

const ThemeToggle = styled.button<{ isDark: boolean }>`
  margin-left: 1rem;
  background: ${({ theme, isDark }) => 
    isDark ? theme.colors.secondary : '#f5f5f5'};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 1.3rem;
  color: ${({ theme, isDark }) => 
    isDark ? theme.colors.text.primary : theme.colors.text.secondary};
  transition: background 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ theme, isDark }) => 
      isDark ? theme.colors.secondary : '#e0e0e0'};
    border-color: ${({ theme }) => theme.colors.border.medium};
  }
  
  svg {
    transition: transform 0.5s cubic-bezier(0.4,2,0.6,1), opacity 0.3s;
    transform: rotate(${props => props.isDark ? '360deg' : '0deg'});
    opacity: 1;
  }
  
  @media (max-width: 600px) {
    margin-left: 0.5rem;
    padding: 0.3rem 0.6rem;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

// Search results dropdown styling
const SearchResults = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.shadow};
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  
  @media (max-width: 600px) {
    max-height: 250px;
  }
`;

const SearchResultItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.divider};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  }
  
  @media (max-width: 600px) {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
`;

const SearchResultContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchResultImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
`;

const SearchResultText = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SearchResultCategories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
`;

const CategoryTag = styled.span`
  font-size: 0.7rem;
  padding: 1px 6px;
  background-color: ${({ theme }) => theme.colors.categoryTag};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Auth-related styled components
const UserMenu = styled.div`
  position: relative;
  
  &:hover {
    & > div:last-child {
      visibility: visible;
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.shadow};
  padding: 0.75rem;
  min-width: 180px;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.2s ease-in-out;
  z-index: 100;
  
  &:before {
    content: '';
    position: absolute;
    top: -6px;
    right: 10px;
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors.cardBackground};
    transform: rotate(45deg);
    border-top: 1px solid ${({ theme }) => theme.colors.shadow};
    border-left: 1px solid ${({ theme }) => theme.colors.shadow};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.divider};
  margin: 0.5rem 0;
`;

const SignOutButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.5rem 0;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    font-weight: 500;
  }
`;

// Simplified auth button for non-authenticated users
const SignInButton = styled.button`
  padding: 0.35rem 0.7rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}11;
  }
  
  @media (max-width: 600px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
`;

// Component
const Header: React.FC = () => {
  // Theme state from ThemeProvider
  const { isDarkTheme, toggleTheme } = useTheme();
  
  // Search state
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Auth state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Auth from redux store
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  const dispatch = useAppDispatch();

  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  // Search types
  interface SearchResult {
    id: string;
    name: string;
    url: string;
    categories: string[];
  }

  // Search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (text.length > 1) {
      // Set a new timeout
      searchTimeout.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('meme_templates')
            .select('id, name, url, categories')
            .ilike('name', `%${text}%`)
            .limit(10);
            
          if (error) {
            console.error('Search error:', error);
            return;
          }
          
          setResults(data || []);
          setShowResults(true);
        } catch (err) {
          console.error('Search failed:', err);
          setResults([]);
        }
      }, 300); // 300ms delay before executing search
    } else {
      setShowResults(false);
    }
  };
  
  // Handle result click
  const handleResultClick = (template: SearchResult) => {
    // Reset text layers first
    dispatch(setTopText(''));
    dispatch(setBottomText(''));
    
    let targetTab = 'all';
    
    if (template.categories && template.categories.length > 0) {
      const firstCategory = template.categories[0];
      const validTabs = ['popular', 'hot', 'classic', 'reaction', 'cat', 'dog'];
      
      if (validTabs.includes(firstCategory)) {
        targetTab = firstCategory;
      }
    }
    
    dispatch(setActiveTab(targetTab));
    
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
          dispatch(setMemeImageName(template.name));
          
          setTimeout(() => {
            dispatch(setActiveTab('text'));
          }, 100);
        } catch (error) {
          console.error('Error converting image:', error);
          dispatch(setMemeImage(template.url));
          dispatch(setMemeImageName(template.name));
          dispatch(setActiveTab('text'));
        }
      }
    };
    
    img.onerror = () => {
      console.error('Error loading image:', template.url);
      dispatch(setMemeImage(template.url));
      dispatch(setMemeImageName(template.name));
      dispatch(setActiveTab('text'));
    };
    
    img.src = template.url;
    
    setShowResults(false);
    setSearchText('');
  };
  
  // Handle logo click
  const handleLogoClick = () => {
    dispatch(setActiveTab('text'));
  };
  
  // Auth handlers  
  const handleSignOut = () => {
    dispatch(signOut());
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo onClick={handleLogoClick}>BroMeme</Logo>
        <SearchContainer className="search-container">
          <SearchIcon>🔍</SearchIcon>
          <SearchInput 
            placeholder="Search all memes" 
            value={searchText}
            onChange={handleSearch}
          />
          
          {showResults && (
            <SearchResults>
              {results.length > 0 ? (
                results.map(template => (
                  <SearchResultItem 
                    key={template.id}
                    onClick={() => handleResultClick(template)}
                  >
                    <SearchResultContent>
                      <SearchResultImage src={template.url} alt={template.name} />
                      <SearchResultText>
                        <div>{template.name}</div>
                        {template.categories && template.categories.length > 0 && (
                          <SearchResultCategories>
                            {template.categories.map(cat => (
                              <CategoryTag key={cat}>{cat}</CategoryTag>
                            ))}
                          </SearchResultCategories>
                        )}
                      </SearchResultText>
                    </SearchResultContent>
                  </SearchResultItem>
                ))
              ) : (
                <SearchResultItem>No results found</SearchResultItem>
              )}
            </SearchResults>
          )}
        </SearchContainer>
        <HeaderActions>
        {isAuthenticated ? (
  <UserMenu>
    <Avatar>
      {user?.user_metadata?.name?.charAt(0).toUpperCase() || 
       user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 
       user?.email?.charAt(0).toUpperCase() || 
       '👤'}
    </Avatar>
    <UserDropdown>
      <UserInfo>
        <UserName>
          {user?.user_metadata?.name || 
           user?.user_metadata?.full_name || 
           user?.email?.split('@')[0]}
        </UserName>
        <UserEmail>{user?.email}</UserEmail>
      </UserInfo>
      <DropdownDivider />
      <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
    </UserDropdown>
  </UserMenu>
) : (
  <SignInButton onClick={openAuthModal}>
    <span>👤</span>
    <span>Sign in</span>
  </SignInButton>
)}
          <ThemeToggle onClick={toggleTheme} isDark={isDarkTheme}>
            {isDarkTheme ? <FiSun /> : <FiMoon />}
          </ThemeToggle>
        </HeaderActions>
      </HeaderContent>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
      />
    </HeaderContainer>
  );
};

export default Header;