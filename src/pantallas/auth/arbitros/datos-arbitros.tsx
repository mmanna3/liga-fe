import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate } from 'react-router-dom'
import TablaArbitros from './components/tabla'

export default function DatosArbitros() {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useApiQuery({
    key: ['arbitros'],
    fn: async () => await api.arbitroAll()
  })

  return (
    <FlujoHomeLayout
      titulo='Datos de los árbitros'
      iconoTitulo='Arbitros'
      pathBotonVolver={rutasNavegacion.arbitros}
      contenedorClassName='max-w-6xl'
      botonera={{
        iconos: [
          {
            alApretar: () => navigate(rutasNavegacion.crearArbitro),
            tooltip: 'Agregar árbitro',
            icono: 'Agregar',
            visibleSoloParaAdmin: true
          }
        ]
      }}
      contenido={
        <TablaArbitros
          data={data || []}
          isLoading={isLoading}
          isError={isError}
        />
      }
    />
  )
}
