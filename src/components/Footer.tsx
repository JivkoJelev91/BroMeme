import React from 'react';
import styled from 'styled-components';

// Styled components
const FooterContainer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: #f9f9f9;
  border-top: 1px solid #eaeaea;
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
  padding: 0.5rem 1rem;
`;

const Copyright = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const FooterLink = styled.a`
  color: #666;
  text-decoration: none;
  font-size: 0.85rem;
  
  &:hover {
    text-decoration: underline;
    color: #4285f4;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialIcon = styled.a`
  color: #777;
  font-size: 1.1rem;
  transition: color 0.2s;
  
  &:hover {
    color: #4285f4;
  }
`;

// Component
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          © {currentYear} Meme Generator. All rights reserved.
        </Copyright>
        
        <FooterLinks>
          <FooterLink href="#">Terms</FooterLink>
          <FooterLink href="#">Privacy</FooterLink>
          <FooterLink href="#">Support</FooterLink>
        </FooterLinks>
        
        <SocialLinks>
          <SocialIcon href="#" title="Facebook">
            <span role="img" aria-label="facebook">📘</span>
          </SocialIcon>
          <SocialIcon href="#" title="Twitter">
            <span role="img" aria-label="twitter">🐦</span>
          </SocialIcon>
          <SocialIcon href="#" title="Instagram">
            <span role="img" aria-label="instagram">📷</span>
          </SocialIcon>
        </SocialLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;