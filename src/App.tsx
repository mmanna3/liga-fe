import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { mapaRutasComponentes } from './routes/mapa-rutas-componentes'

const router = createBrowserRouter(mapaRutasComponentes)

export default function App() {
  return <RouterProvider router={router} />
}
