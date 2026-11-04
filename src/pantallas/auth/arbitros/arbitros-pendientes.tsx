import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import TablaArbitrosPendientes from './components/tabla-arbitros-pendientes'

export default function ArbitrosPendientes() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['arbitrosPendientes'],
    fn: async () => await api.arbitrosPendientes()
  })

  return (
    <FlujoHomeLayout
      titulo='Pendientes de aprobación'
      iconoTitulo='Arbitros'
      pathBotonVolver={rutasNavegacion.arbitros}
      contenedorClassName='max-w-6xl'
      contenido={
        <TablaArbitrosPendientes
          data={data || []}
          isLoading={isLoading}
          isError={isError}
        />
      }
    />
  )
}
