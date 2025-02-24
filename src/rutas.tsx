import AdminLayout from './pages/admin/admin-layout'
import Club from './pages/admin/club'
import CrearClub from './pages/admin/crear-club'
import PaginaNoEncontrada from './pages/pagina-no-encontrada'
import SeccionPrincipalFichaje from './pages/SeccionPrincipalFichaje/SeccionPrincipalFichaje'

export const rutas = [
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
      { path: 'clubs', element: <Club /> },
      { path: 'clubs/crear', element: <CrearClub /> }
      // { path: 'settings', element: <AdminSettings /> } // /admin/settings
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> } // Página 404
]
