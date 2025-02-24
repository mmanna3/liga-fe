import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminLayout from './pages/admin/admin-layout'
import Club from './pages/admin/club'
import PaginaNoEncontrada from './pages/pagina-no-encontrada'
import SeccionPrincipalFichaje from './pages/SeccionPrincipalFichaje/SeccionPrincipalFichaje'

// Definir rutas
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className='flex justify-center w-screen'>
        <SeccionPrincipalFichaje />
      </div>
    )
  }, // Ruta base
  {
    path: '/admin',
    element: <AdminLayout />, // Layout de admin
    children: [
      { path: '', element: <></> },
      { path: 'clubs', element: <Club /> } // /admin/users
      // { path: 'settings', element: <AdminSettings /> } // /admin/settings
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> } // Página 404
])

export default function App() {
  return <RouterProvider router={router} />
}
