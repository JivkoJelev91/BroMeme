import { Provider } from 'react-redux'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { store } from 'store'
import './index.css'
import App from 'src/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
