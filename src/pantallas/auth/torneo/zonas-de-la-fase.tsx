import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { CrearZonas } from './zonas/crear-zonas'
import { ModificarZonas } from './zonas/modificar-zonas'

export default function ZonasDeLaFase() {
  const { id: torneoIdParam, faseId: faseIdParam } = useParams<{
    id: string
    faseId: string
  }>()
  const torneoId = Number(torneoIdParam)
  const faseId = Number(faseIdParam)

  const { data: torneo } = useApiQuery({
    key: ['torneo', torneoId],
    fn: () => api.torneoGET(torneoId)
  })

  const { data: zonasApi = [], isLoading: zonasCargando } = useApiQuery({
    key: ['zonasAll', faseId],
    fn: () => api.zonasAll(faseId)
  })

  const fase = useMemo(
    () => torneo?.fases?.find((f) => f.id === faseId),
    [torneo, faseId]
  )

  const titulo = `Zonas de la fase: ${fase?.nombre ?? 'Fase'}`
  const pathVolver = `${rutasNavegacion.detalleTorneo}/${torneoId}`

  const tieneZonas = zonasApi.length > 0

  if (zonasCargando) {
    return (
      <div className='max-w-6xl mx-auto px-4'>
        <div className='mb-4'>
          <BotonVolver path={pathVolver} />
        </div>
        <p className='text-muted-foreground'>Cargando zonas...</p>
      </div>
    )
  }

  if (tieneZonas) {
    return <ModificarZonas titulo={titulo} pathVolver={pathVolver} />
  }

  return <CrearZonas titulo={titulo} pathVolver={pathVolver} />
}
