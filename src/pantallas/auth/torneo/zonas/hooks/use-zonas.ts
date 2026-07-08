import { EquipoDTO } from '@/api/clients'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useMemo, useState } from 'react'
import {
  aplicarAgregarEquipoAZona,
  type ValidarZonasOpciones,
  type ZonaEstado
} from '../components/tipos'

export function useZonasEstado(
  initial: ZonaEstado[],
  opciones: ValidarZonasOpciones = {}
) {
  const [zonasEstado, setZonasEstado] = useState<ZonaEstado[]>(initial)

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

  const agregarEquipoAZona = useCallback(
    (index: number, equipo: EquipoDTO) => {
      setZonasEstado((prev) =>
        aplicarAgregarEquipoAZona(prev, index, equipo, opciones)
      )
    },
    [opciones]
  )

  const quitarEquipoDeZona = useCallback((index: number, equipoId: number) => {
    setZonasEstado((prev) =>
      prev.map((z, i) =>
        i === index
          ? { ...z, equipos: z.equipos.filter((e) => e.id !== equipoId) }
          : z
      )
    )
  }, [])

  const agregarZona = useCallback(() => {
    setZonasEstado((prev) => [
      ...prev,
      { nombre: 'Nueva Zona', equipos: [], clientKey: crypto.randomUUID() }
    ])
  }, [])

  const eliminarZona = useCallback((index: number) => {
    setZonasEstado((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const reordenarZonas = useCallback((fromIndex: number, toIndex: number) => {
    setZonasEstado((prev) => arrayMove(prev, fromIndex, toIndex))
  }, [])

  const setZonasEstadoDirecto = useCallback((zonas: ZonaEstado[]) => {
    setZonasEstado(zonas)
  }, [])

  return {
    zonasEstado,
    setZonasEstado: setZonasEstadoDirecto,
    equiposEnZonas,
    actualizarZona,
    agregarEquipoAZona,
    quitarEquipoDeZona,
    agregarZona,
    eliminarZona,
    reordenarZonas
  }
}
