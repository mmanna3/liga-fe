import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SeccionPrincipalFichaje from './pages/SeccionPrincipalFichaje/SeccionPrincipalFichaje'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeccionPrincipalFichaje />
  </StrictMode>
)
