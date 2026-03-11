import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BuscadorDeEquiposParaZona } from './zonas/buscador-de-equipos-para-zona'
import { Zona, type ZonaEstado } from './zonas/zona'

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

  const { data: zonasApi = [] } = useApiQuery({
    key: ['zonasAll', faseId],
    fn: () => api.zonasAll(faseId)
  })

  const [zonasEstado, setZonasEstado] = useState<ZonaEstado[]>([
    { nombre: 'Zona A', equipos: [] }
  ])

  const zonasIds = zonasApi.map((z) => z.id).join(',')
  useEffect(() => {
    if (zonasApi.length > 0) {
      setZonasEstado(
        zonasApi.map((z) => ({
          id: z.id,
          nombre: z.nombre ?? 'Zona',
          equipos: [] as EquipoDTO[]
        }))
      )
    }
  }, [zonasIds])

  const fase = useMemo(
    () => torneo?.fases?.find((f) => f.id === faseId),
    [torneo, faseId]
  )

  const equiposEnZonas = useMemo(
    () => zonasEstado.flatMap((z) => z.equipos),
    [zonasEstado]
  )

  const actualizarZona = useCallback(
    (
      index: number,
      campo: 'nombre' | 'equipos',
      valor: string | EquipoDTO[]
    ) => {
      setZonasEstado((prev) =>
        prev.map((z, i) => (i === index ? { ...z, [campo]: valor } : z))
      )
    },
    []
  )

  const agregarEquipoAZona = useCallback((index: number, equipo: EquipoDTO) => {
    setZonasEstado((prev) =>
      prev.map((z, i) =>
        i === index
          ? {
              ...z,
              equipos: [...z.equipos, equipo]
            }
          : z
      )
    )
  }, [])

  const quitarEquipoDeZona = useCallback((index: number, equipoId: number) => {
    setZonasEstado((prev) =>
      prev.map((z, i) =>
        i === index
          ? {
              ...z,
              equipos: z.equipos.filter((e) => e.id !== equipoId)
            }
          : z
      )
    )
  }, [])

  const agregarZona = useCallback(() => {
    setZonasEstado((prev) => [...prev, { nombre: 'Nueva Zona', equipos: [] }])
  }, [])

  const pathVolver = `${rutasNavegacion.detalleTorneo}/${torneoId}`

  const titulo = `Zonas de la fase: ${fase?.nombre ?? 'Fase'}`

  return (
    <LayoutSegundoNivel
      titulo={titulo}
      pathBotonVolver={pathVolver}
      maxWidth='6xl'
      contenido={
        <div className='space-y-6'>
          <div className='flex flex-wrap gap-4 items-start'>
            {zonasEstado.map((zona, index) => (
              <div key={index} className='min-w-[280px] flex-1'>
                <Zona
                  zona={zona}
                  onNombreChange={(n) => actualizarZona(index, 'nombre', n)}
                  onQuitarEquipo={(eqId) => quitarEquipoDeZona(index, eqId)}
                  onDropEquipo={(eq) => agregarEquipoAZona(index, eq)}
                />
              </div>
            ))}
            <div className='min-w-[280px] flex-1 flex items-center'>
              <Boton
                type='button'
                variant='outline'
                size='sm'
                onClick={agregarZona}
                className='w-full py-6'
              >
                <Plus className='w-4 h-4 mr-2' />
                Agregar Zona
              </Boton>
            </div>
          </div>

          <div className='pt-6 border-t'>
            <BuscadorDeEquiposParaZona equiposEnZonas={equiposEnZonas} />
          </div>
        </div>
      }
    />
  )
}
