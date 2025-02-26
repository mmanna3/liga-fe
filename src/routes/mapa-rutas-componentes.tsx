import AdminLayout from '../pages/admin/admin-layout'
import Club from '../pages/admin/club/club'
import CrearClub from '../pages/admin/club/crear-club'
import PaginaNoEncontrada from '../pages/pagina-no-encontrada'
import SeccionPrincipalFichaje from '../pages/SeccionPrincipalFichaje/SeccionPrincipalFichaje'
import { rutas } from './rutas'

export const mapaRutasComponentes = [
  {
    path: '/',
    element: (
      <div className='flex justify-center w-screen'>
        <SeccionPrincipalFichaje />
      </div>
    )
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <></> },
      { path: rutas.clubs, element: <Club /> },
      { path: rutas.crearClub, element: <CrearClub /> }
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> }
]
