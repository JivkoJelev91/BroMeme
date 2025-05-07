import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from 'store';
import { setActiveTab } from '../redux';
import { memeTemplates } from '../memeTemplates';
import { signOut } from '../redux/slices/authSlice';
import AuthModal from './AuthModal';

// Styled components
const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: #f9f9f9;
  border-bottom: 1px solid #eaeaea;
  
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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
  color: #333;
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
  background: white;
  border: 1px solid #ddd;
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
  color: #777;
  
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
  background: #4285f4;
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

const ThemeToggle = styled.button<{ dark: boolean }>`
  margin-left: 1rem;
  background: none;
  border: 1px solid #ccc;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 1.3rem;
  color: #555;
  background-color: #f5f5f5;
  transition: background 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: #e0e0e0;
    border-color: #888;
  }
  
  svg {
    transition: transform 0.5s cubic-bezier(0.4,2,0.6,1), opacity 0.3s;
    transform: rotate(${props => props.dark ? '360deg' : '0deg'});
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
    background: #f5f5f5;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
  
  @media (max-width: 600px) {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
    background: white;
    transform: rotate(45deg);
    border-top: 1px solid rgba(0,0,0,0.05);
    border-left: 1px solid rgba(0,0,0,0.05);
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
  color: #333;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #777;
  max-width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: #eaeaea;
  margin: 0.5rem 0;
`;

const SignOutButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.5rem 0;
  background: transparent;
  border: none;
  color: #e53935;
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
  color: #4285f4;
  border: 1px solid #4285f4;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  &:hover {
    background: rgba(66, 133, 244, 0.05);
  }
  
  @media (max-width: 600px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
`;

// Component
const Header: React.FC = () => {
  // Theme state in localStorage for persistence
  const [dark, setDark] = React.useState(() => {
    return document.body.classList.contains('dark-theme') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Search state
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Auth state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Auth from redux store
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  const dispatch = useAppDispatch();

  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  // Search handler
  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);
    
    if (text.length > 2) {
      const matches = memeTemplates.filter(meme => 
        meme.name.toLowerCase().includes(text.toLowerCase())
      );
      setResults(matches);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  
  // Handle result click
  const handleResultClick = (meme) => {
    dispatch(setActiveTab(meme.category));
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
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo onClick={handleLogoClick}>BroMeme</Logo>
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput 
            placeholder="Search all memes" 
            value={searchText}
            onChange={handleSearch}
          />
          
          {showResults && (
            <SearchResults>
              {results.length > 0 ? (
                results.map(meme => (
                  <SearchResultItem 
                    key={meme.id}
                    onClick={() => handleResultClick(meme)}
                  >
                    {meme.name}
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
          <ThemeToggle onClick={toggleTheme} dark={dark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? (
              <svg key="moon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 0111.21 3a7 7 0 100 14 9 9 0 009.79-4.21z" fill="#FFD600"/>
              </svg>
            ) : (
              <svg key="sun" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" fill="#FFD600"/>
                <g stroke="#FFD600" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="4"/>
                  <line x1="12" y1="20" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="4" y2="12"/>
                  <line x1="20" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </g>
              </svg>
            )}
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