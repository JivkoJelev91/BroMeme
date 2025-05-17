import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { supabase } from '../../supabase/supabaseConfig';
import { setActiveTab } from 'src/redux';

const categories = [
  { id: 'popular', label: 'Popular' },
  { id: 'hot', label: 'Hot' },
  { id: 'classic', label: 'Classic' },
  { id: 'reaction', label: 'Reaction' },
  { id: 'cat', label: 'Cat' },
  { id: 'dog', label: 'Dog' },
];

const UploadPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
    }
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !name || selectedCategories.length === 0) {
      setError('Please fill in all fields and select at least one category');
      return;
    }
    
    if (!user?.id) {
      setError('You must be logged in to upload templates');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // 1. Upload image to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `meme-templates/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('memes')
        .upload(filePath, selectedFile);
        
      if (uploadError) throw new Error(uploadError.message);
      
      // 2. Get the public URL - add await here
      const { data: urlData } = await supabase.storage
        .from('memes')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData?.publicUrl;
      
      if (!publicUrl) throw new Error('Failed to get public URL');
      
      // 3. Insert record into database
      const { error: dbError } = await supabase
        .from('meme_templates')
        .insert({
          name,
          url: publicUrl,
          categories: selectedCategories,
          created_by: user.id
        })
        .select();
        
      if (dbError) throw new Error(dbError.message);
      
      setSuccess(true);
    } catch (err: unknown) {
      // Map backend errors to user-friendly messages
      const getUserFriendlyError = (err: unknown): string => {
        if (err instanceof Error) {
          // Map specific error messages to user-friendly versions
          if (err.message.includes('storage/object-too-large')) {
            return 'The image is too large. Please use a smaller file.';
          }
          if (err.message.includes('permission denied')) {
            return 'You do not have permission to upload files.';
          }
          // Add more mappings as needed
        }
        // Default generic message
        return 'There was a problem uploading your image. Please try again.';
      };

      setError(getUserFriendlyError(err));
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    // setPreviewUrl(null);
    setName('');
    setSelectedCategories([]);
    setSuccess(false);
    setError(null);
    // setUploadedTemplateId(null);
  };
  
  const viewTemplate = () => {
    if (selectedCategories.length > 0) {
      // Navigate to the first selected category
      dispatch(setActiveTab(selectedCategories[0]));
    }
  };
  
  return (
    <PanelContainer>
      {success ? (
        <UploadForm>
          <FormGroup>
            <SuccessDropArea>
              <SuccessCard>
                <SuccessIcon>
                  🚀
                  <RocketTrail />
                </SuccessIcon>
                <SuccessMessage>Template added to gallery!</SuccessMessage>
              </SuccessCard>
            </SuccessDropArea>
          </FormGroup>
          
          <ButtonWrapper>
            <Button onClick={resetForm}>
              Upload Another Template
            </Button>
            <ViewGalleryButton onClick={viewTemplate}>
              View in Gallery
            </ViewGalleryButton>
          </ButtonWrapper>
        </UploadForm>
      ) : (
        <UploadForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Template Image</Label>
            <DropArea 
              onClick={() => fileInputRef.current?.click()}
              $hasPreview={!!selectedFile}
            >
              {selectedFile ? (
                <SelectedFileInfo>
                  <FileName>{selectedFile.name}</FileName>
                  <FileSize>({(selectedFile.size / 1024).toFixed(1)} KB)</FileSize>
                </SelectedFileInfo>
              ) : (
                <UploadIcon>📁 Select Image</UploadIcon>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </DropArea>
          </FormGroup>
                    
          <FormGroup>
            <Label>Template Name</Label>
            <Input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this template"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Categories (select at least one)</Label>
            <CategoriesContainer>
              {categories.map(category => (
                <CategoryCheckbox key={category.id}>
                  <CheckboxInput 
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  <CheckboxLabel htmlFor={`category-${category.id}`}>
                    {category.label}
                  </CheckboxLabel>
                </CategoryCheckbox>
              ))}
            </CategoriesContainer>
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonWrapper>
            <Button 
              type="submit" 
              disabled={isUploading || !selectedFile || !name || selectedCategories.length === 0}
            >
              {isUploading ? (
                <>
                  <LoadingSpinner />
                  Uploading...
                </>
              ) : (
                'Upload Template'
              )}
            </Button>
          </ButtonWrapper>
        </UploadForm>
      )}
    </PanelContainer>
  );
};

// Styled components remain the same
const PanelContainer = styled.div`
  padding: 0.5rem 0;
`;

const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DropArea = styled.div<{ $hasPreview: boolean }>`
  border: 2px dashed ${props => props.$hasPreview ? 
    props.theme.colors.primary : props.theme.colors.border.medium};
  border-radius: 4px;
  padding: ${props => props.$hasPreview ? '0' : '0.5rem'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${props => props.$hasPreview ? 
    `${props.theme.colors.primary}11` : props.theme.colors.input.background};
  
  &:hover {
    background: ${props => props.$hasPreview ? 
      `${props.theme.colors.primary}22` : props.theme.colors.divider};
    border-color: ${props => props.$hasPreview ? 
      props.theme.colors.primary : props.theme.colors.border.medium};
  }
`;

const CategoriesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
  margin-bottom: 0.25rem;
`;

const UploadIcon = styled.div`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: 4px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.colors.input.background};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CategoryCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CheckboxInput = styled.input`
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: -65px;
  left: 0;
  right: 0;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  z-index: 10;
  width: 100%;
`;

const Button = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.85rem 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary}dd;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.error}15;
  border-radius: 4px;
`;

const SuccessDropArea = styled.div`
  border-radius: 4px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const SuccessCard = styled.div`
  width: 100%;
  padding: 2rem;
  background: linear-gradient(145deg, #2ecc7133,#2ecc7155);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(46, 204, 113, 0.2);
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform 0.3s ease;
  margin: -1rem 0;
  
  &:hover {
    transform: rotateY(5deg) rotateX(5deg);
  }
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #46c15a;
  position: relative;
`;

const RocketTrail = styled.div`
  position: absolute;
  bottom: -35px;
  left: 42%;
  transform: translateX(-150%);
  rotate: 45deg;
  width: 20px;
  height: 30px;
  
  &:before, &:after {
    content: "";
    position: absolute;
    top: 0;
    width: 8px;
    height: 15px;
    border-radius: 50%;
    background: linear-gradient(to bottom, #ff9500, #ff5e3a);
    animation: flame 0.6s ease-out infinite alternate;
  }
  
  &:before {
    left: 0;
    animation-delay: 0.2s;
  }
  
  &:after {
    right: 0;
  }
  
  @keyframes flame {
    0% {
      height: 15px;
      opacity: 0.8;
    }
    100% {
      height: 30px;
      opacity: 0.5;
    }
  }
`;

const SuccessMessage = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
`;

const ViewGalleryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  margin-top: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}11;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SelectedFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FileName = styled.div`
  font-weight: 500;
  word-break: break-word;
  text-align: center;
  max-width: 100%;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FileSize = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default UploadPanel;