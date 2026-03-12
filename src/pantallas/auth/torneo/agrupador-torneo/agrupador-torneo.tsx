import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate } from 'react-router-dom'
import TablaAgrupadorTorneo from './components/tabla'

export default function AgrupadorTorneo() {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useApiQuery({
    key: ['torneoAgrupadores'],
    fn: async () => await api.torneoAgrupadorAll()
  })

  return (
    <FlujoHomeLayout
      titulo='Agrupadores de torneos'
      subtitulo='En la app, cada torneo aparecerá "adentro" de su agrupador.'
      iconoTitulo='Layout dashboard'
      pathBotonVolver={rutasNavegacion.torneos}
      botonera={{
        iconos: [
          {
            alApretar: () => navigate(rutasNavegacion.crearAgrupadorTorneo),
            tooltip:
              'Mientras el agrupador no tenga torneos, no se mostrará en la app.',
            icono: 'Agregar',
            visibleSoloParaAdmin: true
          }
        ]
      }}
      contenido={
        <div className='space-y-4'>
          <TablaAgrupadorTorneo
            data={data || []}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      }
    />
  )
}
