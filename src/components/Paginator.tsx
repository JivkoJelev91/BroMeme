// src/components/Paginator.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 12,
  totalItems = 0
}) => {
  // Generate page numbers array with ellipsis where needed
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    // If we're past page 3, show ellipsis
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    // Always show at least 3 pages in the middle if available
    if (rangeEnd - rangeStart < 2 && totalPages > 4) {
      if (currentPage < totalPages / 2) {
        rangeEnd = Math.min(totalPages - 1, rangeStart + 2);
      } else {
        rangeStart = Math.max(2, rangeEnd - 2);
      }
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // If we're more than 2 pages from the end, show ellipsis
    if (currentPage < totalPages - 2 && totalPages > 4) {
      pages.push('...');
    }
    
    // Always show last page if we have more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Calculate displayed items range
  const firstItemIndex = (currentPage - 1) * itemsPerPage + 1;
  const lastItemIndex = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <PaginatorContainer>
      <InfoText>
        {totalItems > 0 && (
          <>Showing {firstItemIndex}-{lastItemIndex} of {totalItems} memes</>
        )}
      </InfoText>
      
      <PaginationButtons>
        <PageButton 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          $navigation
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6"/>
          </svg>
        </PageButton>
        
        {pageNumbers.map((page, index) => (
          typeof page === 'number' ? (
            <PageButton
              key={index}
              onClick={() => onPageChange(page)}
              $active={currentPage === page}
            >
              {page}
            </PageButton>
          ) : (
            <Ellipsis key={index}>···</Ellipsis>
          )
        ))}
        
        <PageButton 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          $navigation
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6l6 6-6 6"/>
          </svg>
        </PageButton>
      </PaginationButtons>
    </PaginatorContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const PaginatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const InfoText = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.75rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.35rem;
  align-items: center;
`;

const PageButton = styled.button<{ $active?: boolean, $navigation?: boolean }>`
  min-width: ${props => props.$navigation ? '36px' : '32px'};
  height: ${props => props.$navigation ? '36px' : '32px'};
  border-radius: ${props => props.$navigation ? '50%' : '6px'};
  background: ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.cardBackground};
  color: ${props => props.$active 
    ? '#fff' 
    : props.theme.colors.text.primary};
  border: 1px solid ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active 
    ? `0 2px 8px ${props.theme.colors.primary}66` 
    : 'none'};
  
  &:hover:not(:disabled) {
    background: ${props => props.$active 
      ? props.theme.colors.primary 
      : props.theme.colors.divider};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => props.$active && `
    animation: ${pulse} 0.3s ease-out;
  `}
`;

const Ellipsis = styled.span`
  padding: 0 0.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  user-select: none;
`;

export default Paginator;