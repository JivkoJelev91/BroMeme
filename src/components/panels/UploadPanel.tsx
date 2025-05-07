import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from 'store';
import { supabase } from '../../supabase/supabaseConfig';
import { setActiveTab } from 'store';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedTemplateId, setUploadedTemplateId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
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
    
    try {
      setIsUploading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('Starting upload with:', { 
        fileName: selectedFile.name, 
        fileSize: selectedFile.size, 
        categories: selectedCategories,
        user: user
      });
      
      if (!user?.id) {
        throw new Error('You must be logged in to upload templates');
      }
      
      // 1. Upload image to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `meme-templates/${fileName}`;
      
      console.log('Uploading to path:', filePath);
      
      // Create the bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some(b => b.name === 'memes')) {
        await supabase.storage.createBucket('memes', {
          public: true
        });
        console.log('Created memes bucket');
      }
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes')
        .upload(filePath, selectedFile);
        
      console.log('Upload response:', { uploadData, uploadError });
      
      if (uploadError) throw new Error(uploadError.message);
      
      // 2. Get the public URL
      const { data: urlData } = supabase.storage
        .from('memes')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData?.publicUrl;
      setUploadedUrl(publicUrl);
      
      console.log('Public URL:', publicUrl);
      
      if (!publicUrl) throw new Error('Failed to get public URL');
      
      // 3. Insert record into database
      const { data: insertData, error: dbError } = await supabase
      .from('meme_templates')
      .insert({
        name,
        url: publicUrl,
        categories: selectedCategories,
        created_by: user.id  // This should match auth.uid()
      })
      .select();
        
      console.log('DB response:', { insertData, dbError });
      
      if (dbError) throw new Error(dbError.message);
      
      // Save the ID for navigation
      if (insertData && insertData.length > 0) {
        setUploadedTemplateId(insertData[0].id);
      }
      
      // Success!
      console.log('Upload successful!');
      setSuccess(true);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setName('');
    setSelectedCategories([]);
    setSuccess(false);
    setError(null);
    setDebugInfo(null);
    setUploadedUrl(null);
  };
  
  const viewTemplate = () => {
    if (selectedCategories.length > 0) {
      // Navigate to the first selected category
      const category = selectedCategories[0];
      console.log(`Navigating to category: ${category}`);
      dispatch(setActiveTab(category));
    }
  };
  
  const checkDatabase = async () => {
    try {
      setDebugInfo('Checking database...');
      
      // Check if table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('meme_templates')
        .select('count(*)', { count: 'exact', head: true });
      
      if (tableError) {
        setDebugInfo(`Table error: ${tableError.message}`);
        return;
      }
      
      // Get all templates
      const { data: allTemplates, error: templatesError } = await supabase
        .from('meme_templates')
        .select('*');
        
      if (templatesError) {
        setDebugInfo(`Templates query error: ${templatesError.message}`);
        return;
      }
      
      // Get just uploaded template
      let uploadedTemplate = null;
      if (uploadedTemplateId) {
        const { data, error } = await supabase
          .from('meme_templates')
          .select('*')
          .eq('id', uploadedTemplateId)
          .single();
          
        if (!error) {
          uploadedTemplate = data;
        }
      }
      
      // Check for templates in each selected category
      const categoryResults = [];
      for (const category of selectedCategories) {
        const { data: categoryTemplates, error: categoryError } = await supabase
          .from('meme_templates')
          .select('*')
          .filter('categories', 'cs', `{${category}}`);
        
        categoryResults.push({
          category,
          count: categoryTemplates?.length || 0,
          error: categoryError?.message
        });
      }
      
      // Set debug info
      setDebugInfo(
        `DATABASE CHECK RESULTS:
        
- Templates table exists: ${!tableError ? 'Yes' : 'No'}
- Total templates: ${allTemplates?.length || 0}
- Current template ID: ${uploadedTemplateId || 'None'}
- Categories for this template: ${uploadedTemplate?.categories?.join(', ') || 'None'}

CATEGORY COUNTS:
${categoryResults.map(r => `- ${r.category}: ${r.count} templates${r.error ? ` (Error: ${r.error})` : ''}`).join('\n')}

RECENT TEMPLATES:
${allTemplates?.slice(0, 5).map(t => `- ${t.name} (${t.categories.join(', ')})`).join('\n') || 'None'}`
      );
    } catch (err: any) {
      setDebugInfo(`Error checking database: ${err.message}`);
    }
  };
  
  return (
    <PanelContainer>
      {/* Only show success page after successful upload */}
      {success ? (
        <SuccessContainer>
          <SuccessIcon>✅</SuccessIcon>
          <SuccessMessage>Template uploaded successfully!</SuccessMessage>
          <SuccessText>
            Your template has been added to the selected categories.
            <br/>
            <small>It may take a moment to appear in the gallery.</small>
          </SuccessText>
          
          {/* Show the uploaded image */}
          {uploadedUrl && (
            <UploadedPreview>
              <img src={uploadedUrl} alt={name} />
              <div className="template-info">
                <span>{name}</span>
                <small>{selectedCategories.join(', ')}</small>
              </div>
            </UploadedPreview>
          )}
          
          <ButtonGroup>
            <Button onClick={resetForm}>Upload Another</Button>
            <ViewButton onClick={viewTemplate}>
              View in Gallery
            </ViewButton>
          </ButtonGroup>
          
          <DebugButton onClick={checkDatabase}>
            Debug Database
          </DebugButton>
          
          {debugInfo && (
            <DebugInfo>
              <pre>{debugInfo}</pre>
            </DebugInfo>
          )}
        </SuccessContainer>
      ) : (
        <UploadForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Template Image</Label>
            <DropArea 
              onClick={() => fileInputRef.current?.click()}
              hasPreview={!!previewUrl}
            >
              {previewUrl ? (
                <PreviewImage src={previewUrl} alt="Preview" />
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
        </UploadForm>
      )}
    </PanelContainer>
  );
};

// Styled components
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
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: #555;
`;

const DropArea = styled.div<{ hasPreview: boolean }>`
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: ${props => props.hasPreview ? '0' : '2rem'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${props => props.hasPreview ? 'transparent' : '#f9f9f9'};
  
  &:hover {
    background: ${props => props.hasPreview ? 'transparent' : '#f5f5f5'};
    border-color: ${props => props.hasPreview ? '#ccc' : '#aaa'};
  }
`;

const UploadIcon = styled.div`
  font-size: 1.2rem;
  color: #777;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  display: block;
  border-radius: 4px;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const CategoriesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
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
`;

const Button = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: #3367d6;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
`;

const SuccessText = styled.p`
  color: #555;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ViewButton = styled.button`
  background: white;
  color: #4285f4;
  border: 1px solid #4285f4;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f5ff;
  }
`;

const DebugButton = styled.button`
  margin-top: 1.5rem;
  background: #f2f2f2;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const DebugInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 4px;
  text-align: left;
  width: 100%;
  overflow-x: auto;
  
  pre {
    margin: 0;
    font-size: 0.75rem;
    color: #555;
    white-space: pre-wrap;
  }
`;

const UploadedPreview = styled.div`
  margin: 1rem 0 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 300px;
  
  img {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: cover;
    display: block;
  }
  
  .template-info {
    padding: 0.75rem;
    background: white;
    text-align: center;
    
    span {
      display: block;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    small {
      color: #666;
      display: block;
    }
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

export default UploadPanel;