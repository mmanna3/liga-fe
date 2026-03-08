import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/design-system/base-ui/tooltip'
import ErrorBoundary from './design-system/error-boundary'
import { mapaRutasComponentes } from './ruteo/mapa-rutas-componentes'
import './index.css'

const queryClient = new QueryClient()
const router = createBrowserRouter(mapaRutasComponentes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
