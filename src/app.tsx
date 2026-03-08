import { TooltipProvider } from '@/components/ui/tooltip'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { mapaRutasComponentes } from './routes/mapa-rutas-componentes'

const router = createBrowserRouter(mapaRutasComponentes)

export default function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}
