import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './store/AppStore'
import { UIProvider } from './store/UIStore'
import { ToastProvider } from './components/Toast'
import CartDrawer from './components/CartDrawer'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/landing.css'
import './styles/pages.css'
import './styles/pages-garden.css'
import './styles/pages-journal.css'
import './styles/pages-shop.css'
import './styles/pages-community.css'
import './styles/pages-auth.css'
import './styles/game.css'
import './styles/dark.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <UIProvider>
            <CartDrawer />
            <App />
          </UIProvider>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
