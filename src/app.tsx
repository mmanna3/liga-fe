import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/ui/base-ui/tooltip'
import ErrorBoundary from './ui/error-boundary'
import { mapaRutasComponentes } from './routes/mapa-rutas-componentes'
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
