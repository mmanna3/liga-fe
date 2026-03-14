import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { formatoNombreDesdeId } from './detalle-torneo/lib'
import { CrearZonas } from './zonas/crear-zonas'
import { ModificarZonas } from './zonas/modificar-zonas'
import { ZonaHeader } from './zonas/zona-header'

export default function ZonasDeLaFase() {
  const { id: torneoIdParam, faseId: faseIdParam } = useParams<{
    id: string
    faseId: string
  }>()
  const torneoId = Number(torneoIdParam)
  const faseId = Number(faseIdParam)

  const { data: torneo, isLoading: torneoCargando } = useApiQuery({
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

  const pathVolver = `${rutasNavegacion.detalleTorneo}/${torneoId}`

  const headerCard = (
    <ZonaHeader
      nombreTorneo={torneo?.nombre}
      nombreFase={fase?.nombre}
      formatoFase={
        fase?.faseFormatoNombre ?? formatoNombreDesdeId(fase?.faseFormatoId)
      }
    />
  )

  const tieneZonas = zonasApi.length > 0

  if (torneoCargando || zonasCargando) {
    return (
      <div className='max-w-6xl mx-auto px-4'>
        <div className='mb-4'>
          <BotonVolver path={pathVolver} />
        </div>
        <p className='text-muted-foreground'>Cargando zonas...</p>
      </div>
    )
  }

  if (torneo && !fase) {
    return (
      <div className='max-w-6xl mx-auto px-4'>
        <div className='mb-4'>
          <BotonVolver path={pathVolver} />
        </div>
        <p className='text-muted-foreground'>
          No se encontró la fase. Puede que el enlace sea inválido o la fase
          haya sido eliminada.
        </p>
      </div>
    )
  }

  if (tieneZonas) {
    return <ModificarZonas headerCard={headerCard} pathVolver={pathVolver} />
  }

  return <CrearZonas headerCard={headerCard} pathVolver={pathVolver} />
}
