import React, { useState } from 'react';
import styled from 'styled-components';
import { FaGoogle } from 'react-icons/fa';
import { supabase } from '../supabase/supabaseConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      // User will be redirected to Google for authentication
      console.log('Redirecting to Google for authentication');
    } catch (err: unknown) {
      console.error('Error signing in with Google:', err);
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to sign in with Google'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <ModalHeader>
          <ModalTitle>Sign in to BroMeme</ModalTitle>
        </ModalHeader>
        
        <ModalContent>
          <Subtitle>Create and share memes with the community</Subtitle>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <GoogleButton 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FaGoogle />
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </GoogleButton>
          
          <TermsText>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </TermsText>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.modalOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.error}15;
  border-radius: 4px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 1.5rem;
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  color: #4285F4;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #f1f6ff;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 1.25rem;
  }
`;

const TermsText = styled.p`
  font-size: 0.8rem;
  color: #777;
  text-align: center;
  margin-top: 1.5rem;
`;

export default AuthModal;