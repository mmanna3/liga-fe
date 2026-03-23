import { EquipoDTO } from '@/api/clients'
import { useCallback, useMemo, useState } from 'react'
import type { ZonaEstado } from '../tipos'

export function useZonasEstado(initial: ZonaEstado[]) {
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

  const agregarEquipoAZona = useCallback((index: number, equipo: EquipoDTO) => {
    setZonasEstado((prev) => {
      const equipoId = equipo.id
      let zonasActualizadas = prev

      const indiceOrigen = prev.findIndex(
        (z, i) => i !== index && z.equipos.some((e) => e.id === equipoId)
      )
      if (indiceOrigen >= 0) {
        zonasActualizadas = zonasActualizadas.map((z, i) =>
          i === indiceOrigen
            ? { ...z, equipos: z.equipos.filter((e) => e.id !== equipoId) }
            : z
        )
      }

      return zonasActualizadas.map((z, i) =>
        i === index ? { ...z, equipos: [...z.equipos, equipo] } : z
      )
    })
  }, [])

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
    setZonasEstado((prev) => [...prev, { nombre: 'Nueva Zona', equipos: [] }])
  }, [])

  const eliminarZona = useCallback((index: number) => {
    setZonasEstado((prev) => prev.filter((_, i) => i !== index))
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
    eliminarZona
  }
}
