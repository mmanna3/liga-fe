import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate } from 'react-router-dom'
import TablaUsuarios from './components/tabla'

export default function Usuarios() {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useApiQuery({
    key: ['usuarios'],
    fn: async () => await api.usuarioAll()
  })

  return (
    <FlujoHomeLayout
      titulo='Usuarios'
      iconoTitulo='Usuario'
      pathBotonVolver={rutasNavegacion.configuracion}
      contenedorClassName='max-w-6xl'
      botonera={{
        iconos: [
          {
            alApretar: () => navigate(rutasNavegacion.crearUsuario),
            tooltip: 'Agregar usuario',
            icono: 'Agregar',
            visibleSoloParaAdmin: true
          }
        ]
      }}
      contenido={
        <TablaUsuarios
          data={data || []}
          isLoading={isLoading}
          isError={isError}
        />
      }
    />
  )
}
