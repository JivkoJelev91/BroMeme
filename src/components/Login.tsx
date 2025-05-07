import React from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from 'store';
import { signInWithProvider, clearError } from 'src/redux/slices/authSlice';
import { FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import { AiFillInstagram } from 'react-icons/ai';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'github' | 'instagram') => {
    dispatch(clearError());
    dispatch(signInWithProvider(provider));
  };

  return (
    <FormContainer>
      <FormTitle>Log in to BroMeme</FormTitle>
      <FormDescription>Continue with your favorite social account</FormDescription>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <SocialButtonsContainer>
        <SocialButton 
          provider="google"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
        >
          <FaGoogle />
          <span>Continue with Google</span>
        </SocialButton>
        
        <SocialButton 
          provider="facebook"
          onClick={() => handleSocialLogin('facebook')}
          disabled={isLoading}
        >
          <FaFacebook />
          <span>Continue with Facebook</span>
        </SocialButton>
        
        <SocialButton 
          provider="github"
          onClick={() => handleSocialLogin('github')}
          disabled={isLoading}
        >
          <FaGithub />
          <span>Continue with GitHub</span>
        </SocialButton>
        
        <SocialButton 
          provider="instagram"
          onClick={() => handleSocialLogin('instagram')}
          disabled={isLoading}
        >
          <AiFillInstagram />
          <span>Continue with Instagram</span>
        </SocialButton>
      </SocialButtonsContainer>
      
      <RegisterFooter>
        New to BroMeme? <FooterLink>Create account</FooterLink>
      </RegisterFooter>
    </FormContainer>
  );
};

// Styled components (reusing most styles from Register.tsx)
const FormContainer = styled.div`
  max-width: 400px;
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 2rem;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #202124;
  text-align: center;
`;

const FormDescription = styled.p`
  margin-bottom: 1.5rem;
  color: #5f6368;
  font-size: 0.95rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: #d93025;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  padding: 0.75rem;
  background-color: #fce8e6;
  border-radius: 0.5rem;
`;

const SocialButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SocialButton = styled.button<{ provider: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
  background-color: white;
  
  ${({ provider }) => {
    switch (provider) {
      case 'google':
        return `
          color: #4285F4;
          &:hover {
            background-color: #f1f6ff;
          }
        `;
      case 'facebook':
        return `
          color: #1877F2;
          &:hover {
            background-color: #e7f3ff;
          }
        `;
      case 'github':
        return `
          color: #333;
          &:hover {
            background-color: #f5f5f5;
          }
        `;
      case 'instagram':
        return `
          color: #E1306C;
          &:hover {
            background-color: #fdeef6;
          }
        `;
      default:
        return '';
    }
  }}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const RegisterFooter = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #5f6368;
`;

const FooterLink = styled.span`
  color: #4285f4;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default Login;