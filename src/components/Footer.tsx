import React from 'react';
import styled from 'styled-components';
import { FiHeart, FiCode, FiCoffee, FiGithub } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from 'store';
import { setActiveTab } from '../redux';

// Styled components
const FooterContainer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: #f9f9f9;
  border-top: 1px solid #eaeaea;
  
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const FooterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }
`;

const Copyright = styled.div`
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  
  svg {
    margin: 0 0.25rem;
    color: #ff6b6b;
  }
  
  @media (max-width: 768px) {
    order: 3;
    font-size: 0.75rem;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 600px) {
    gap: 1rem;
  }
`;

const FooterLink = styled.a`
  color: #666;
  text-decoration: none;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  svg {
    font-size: 1rem;
  }
  
  &:hover {
    color: #4285f4;
  }
  
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

const FooterButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
  
  svg {
    font-size: 1rem;
  }
  
  &:hover {
    color: #4285f4;
  }
  
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

const StatsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 600px) {
    gap: 0.75rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #666;
  
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

// Component
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const dispatch = useAppDispatch();
  const { memeCount } = useAppSelector(state => state.stats) || { memeCount: 0 };
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          © {currentYear} BroMeme - Made with <FiHeart /> by BroMeme Team
        </Copyright>
        
        <StatsSection>
          <StatItem>
            <FiCoffee />
            {memeCount > 0 ? `${memeCount} memes created` : 'Start creating memes!'}
          </StatItem>
        </StatsSection>
        
        <FooterLinks>
          <FooterButton onClick={() => dispatch(setActiveTab('popular'))}>
            Popular Memes
          </FooterButton>
          
          <FooterButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to Top
          </FooterButton>
          
          <FooterLink href="https://github.com/JivkoJelev91/BroMeme" target="_blank" rel="noopener noreferrer">
            <FiGithub />
            GitHub
          </FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;