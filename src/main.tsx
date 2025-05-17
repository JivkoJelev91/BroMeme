import { Provider } from 'react-redux'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './redux/store'
import './index.css'
import App from 'src/App'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './ThemeProvider'
import { supabase } from './supabase/supabaseConfig'

// Create a component to handle the auth redirect
 
function AuthHandler() {
  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Get URL hash
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        // This means we have an OAuth redirect
        console.log('Detected OAuth redirect, handling session');
        
        // Supabase will automatically handle this,
        // but we can also manually extract the data if needed
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session after redirect:', error);
        } else {
          // Optionally, clear the URL hash for cleaner UX
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };
    
    handleAuthRedirect();
  }, []);
  
  return null;
}

// Include this component in your app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthHandler />
        <App />
      </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
