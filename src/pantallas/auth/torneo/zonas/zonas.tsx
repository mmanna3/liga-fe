import { api } from '@/api/api'
import { TipoDeFaseEnum } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { tipoDeFaseNombreDesdeEnum } from '../detalle-torneo/lib'
import { GestorZonas } from './gestor-zonas'
import { ZonaHeader } from './zona-header'

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
        fase?.tipoDeFaseNombre ?? tipoDeFaseNombreDesdeEnum(fase?.tipoDeFase)
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

  if (fase?.tipoDeFase === TipoDeFaseEnum._2) {
    return (
      <div className='max-w-6xl mx-auto px-4'>
        <div className='mb-4'>
          <BotonVolver path={pathVolver} />
        </div>
        {headerCard}
        <p className='text-muted-foreground mt-4 max-w-prose'>
          El armado de zonas por equipos (drag and drop) está disponible solo
          para fases en formato <strong>todos contra todos</strong>. Las fases
          de <strong>eliminación directa</strong> usan otro modelo de zonas en
          el sistema.
        </p>
      </div>
    )
  }

  return (
    <GestorZonas
      modo={tieneZonas ? 'modificar' : 'crear'}
      headerCard={headerCard}
      pathVolver={pathVolver}
    />
  )
}
