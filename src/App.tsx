import { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector, setMemeImage, setMemeImageName } from 'store'
import './App.css'
import { Header, TabBar, MemePreview, ControlPanel, HotMemes, Footer, MemeTemplatesPanel } from 'components'
import { supabase } from './supabase/supabaseConfig'
import { setUser } from './redux/slices/authSlice'

// Styled components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f9f9f9;
  font-family: Arial, sans-serif;
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
`;

const EditorContainer = styled.div`
  display: flex;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 0.75rem;
    /* Default layout for desktop: row direction */
  flex-direction: row;
  
  /* Switch to column layout only on mobile */
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HotMemesContainer = styled.div`
  max-width: 1000px;
  width: 100%;
`;

function App() {
  const memeRef = useRef<HTMLDivElement | null>(null)
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
  const isEditorTab = ['text', 'effects', 'draw', 'rotate', 'upload'].includes(activeTab)

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
  if (['text', 'effects', 'draw', 'rotate', 'upload'].includes(activeTab)) {
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
          <HotMemesContainer>
            <HotMemes />
          </HotMemesContainer>
        )}
      </Content>
      
      <Footer />
    </AppContainer>
  )
}

export default App