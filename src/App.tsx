import { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from './redux/store'
import './App.css'
import { Header, TabBar, MemePreview, ControlPanel, RecentMemes, Footer, MemeTemplatesPanel } from 'components'
import { supabase } from './supabase/supabaseConfig'
import { setUser } from './redux/slices/authSlice'
import { setMemeImage, setMemeImageName } from './redux'

// Styled components
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  width: 100%;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const TemplatesContainer = styled.div`
  max-width: 1000px;
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
`;

function App() {
  const memeRef = useRef<HTMLDivElement>(null!)
  const { activeTab } = useAppSelector(state => state.meme)
  const dispatch = useAppDispatch()

  // Set up auth state listener
  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Initial session check:', data.session);
      if (data?.session) {
        dispatch(setUser(data.session.user));
      }
    };
    
    checkSession();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session) {
          console.log('User logged in:', session.user);
          dispatch(setUser(session.user));
        } else {
          console.log('User logged out');
          dispatch(setUser(null));
        }
      }
    );
    
    // Clean up
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Check if current tab is one of the editor tabs
  const isEditorTab = ['text', 'effects', 'draw', 'upload'].includes(activeTab)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Truncate filename to max 20 symbols
      const truncatedName = file.name.length > 20 
        ? file.name.substring(0, 17) + '...' 
        : file.name;
      
      // Save the truncated name to the state
      dispatch(setMemeImageName(truncatedName))
      
      const reader = new FileReader()
      reader.onload = () => {
        dispatch(setMemeImage(reader.result as string))
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadMeme = () => {
    if (memeRef.current === null) return

    toPng(memeRef.current)
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'my-meme.png'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.error('Error generating image:', err)
      })
  }

// Then update the renderMainContent function to include template categories
const renderMainContent = () => {
  // These are your editor tabs
  if (['text', 'effects', 'draw', 'upload'].includes(activeTab)) {
    return (
      <EditorContainer>
        <MemePreview memeRef={memeRef} />
        <ControlPanel 
          handleImageUpload={handleImageUpload} 
          downloadMeme={downloadMeme} 
        />
      </EditorContainer>
    );
  } 
  // These are your template category tabs
  else if (['popular', 'hot', 'classic', 'reaction', 'cat', 'dog', 'all', 'favorites'].includes(activeTab)) {
    return (
      <MemeTemplatesPanel 
      key={`${activeTab}-${activeTab === 'favorites'}`}
      category={activeTab} 
      isFavorites={activeTab === 'favorites'} 
    />
    );
  }
  
  // Default case
  return null;
}

  return (
    <AppContainer>
      <Header />
      
      <Content>
        <TabBar />
        
        {renderMainContent()}
        
        {/* Only show hot memes when in editor mode */}
        {isEditorTab && (
          <TemplatesContainer>
            <RecentMemes />
          </TemplatesContainer>
        )}
      </Content>
      
      <Footer />
    </AppContainer>
  )
}

export default App