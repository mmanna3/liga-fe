import DetalleClub from '@/pages/admin/club/detalle-club'
import CrearEquipo from '@/pages/admin/equipo/crear-equipo'
import DetalleEquipo from '@/pages/admin/equipo/detalle-equipo'
import Equipo from '@/pages/admin/equipo/equipo'
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
      { path: rutas.crearClub, element: <CrearClub /> },
      { path: `${rutas.detalleClub}/:id`, element: <DetalleClub /> },
      { path: rutas.equipos, element: <Equipo /> },
      { path: `${rutas.crearEquipo}/:clubid`, element: <CrearEquipo /> },
      { path: `${rutas.detalleEquipo}/:id`, element: <DetalleEquipo /> }
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> }
]
