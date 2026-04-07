import { api } from '@/api/api'
import { EquipoDTO, EquipoParaZonasDTO, ZonaResumenDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

const MODO_BUSCAR = 'buscar'
const MODO_OTRO_TORNEO = 'otro-torneo'

/** Convierte EquipoParaZonasDTO a EquipoDTO para compatibilidad con zona-fase y RenglonBuscadorDeEquipos */
function equipoParaZonasAEquipoDto(e: EquipoParaZonasDTO): EquipoDTO {
  return new EquipoDTO({
    id: e.id,
    nombre: e.nombre,
    clubNombre: e.club,
    codigoAlfanumerico: e.codigoAlfanumerico,
    clubId: 0,
    zonas: e.zonas?.map(
      (z) =>
        new ZonaResumenDTO({
          id: z.id,
          nombre: z.nombre,
          anio: z.anio ?? new Date().getFullYear(),
          torneo: z.torneo,
          fase: z.fase,
          agrupador: z.agrupador,
          agrupadorId: z.agrupadorId,
          torneoId: z.torneoId,
          faseId: z.faseId
        })
    )
  })
}

export interface UseBuscadorEquiposParams {
  equiposEnZonas: EquipoDTO[]
}

export function useBuscadorEquipos({
  equiposEnZonas
}: UseBuscadorEquiposParams) {
  const [modo, setModo] = useState(MODO_BUSCAR)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [seleccionMultipleActiva, setSeleccionMultipleActiva] = useState(false)
  const [idsSeleccionados, setIdsSeleccionados] = useState<Set<number>>(
    new Set()
  )
  const [filtroAnio, setFiltroAnio] = useState(() => new Date().getFullYear())
  const [filtroAgrupadorId, setFiltroAgrupadorId] = useState<string>('')
  const [filtroTorneoId, setFiltroTorneoId] = useState<string>('')
  const [filtroFaseId, setFiltroFaseId] = useState<string>('')
  const [filtroZonaId, setFiltroZonaId] = useState<string>('')

  const idsEnZonas = useMemo(
    () => new Set(equiposEnZonas.map((e) => e.id).filter(Boolean)),
    [equiposEnZonas]
  )

  useEffect(() => {
    setIdsSeleccionados((prev) => {
      const next = new Set([...prev].filter((id) => !idsEnZonas.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [idsEnZonas])

  const { data: equiposParaZonas = [] } = useApiQuery({
    key: ['equiposParaZonas'],
    fn: () => api.equiposParaZonas()
  })

  const { data: torneosTodos = [] } = useApiQuery({
    key: ['torneoAll'],
    fn: () => api.torneoAll(),
    activado: modo === MODO_OTRO_TORNEO
  })

  const torneosFiltrados = useMemo(() => {
    return torneosTodos.filter((t) => {
      if (t.anio !== filtroAnio) return false
      if (
        filtroAgrupadorId &&
        t.torneoAgrupadorId !== parseInt(filtroAgrupadorId, 10)
      )
        return false
      return true
    })
  }, [torneosTodos, filtroAnio, filtroAgrupadorId])

  /** Equipos que aún no están en ninguna zona (catálogo para selección y drag). */
  const catalogoEquiposDisponibles = useMemo(() => {
    const lista = equiposParaZonas.filter(
      (e) => e.id != null && !idsEnZonas.has(e.id)
    )
    const ordenada = [...lista].sort((a, b) =>
      (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')
    )
    return ordenada.map(equipoParaZonasAEquipoDto)
  }, [equiposParaZonas, idsEnZonas])

  const equiposFiltrados = useMemo(() => {
    let lista = catalogoEquiposDisponibles

    if (modo === MODO_BUSCAR) {
      const t = textoBusqueda.trim().toLowerCase()
      if (t) {
        lista = lista.filter(
          (e) =>
            (e.nombre?.toLowerCase().includes(t) ?? false) ||
            (e.codigoAlfanumerico?.toLowerCase().includes(t) ?? false) ||
            (e.clubNombre?.toLowerCase().includes(t) ?? false)
        )
      }
    } else {
      const torneoIdsValidos = new Set(
        filtroTorneoId
          ? torneosFiltrados.some((t) => String(t.id) === filtroTorneoId)
            ? [parseInt(filtroTorneoId, 10)]
            : []
          : torneosFiltrados
              .map((t) => t.id)
              .filter((id): id is number => id != null)
      )

      const agrupadorIdNum = filtroAgrupadorId
        ? parseInt(filtroAgrupadorId, 10)
        : null
      const faseIdNum = filtroFaseId ? parseInt(filtroFaseId, 10) : null
      const zonaIdNum = filtroZonaId ? parseInt(filtroZonaId, 10) : null

      lista = lista.filter((e) => {
        const algunaZonaCoincide = e.zonas?.some((z) => {
          if (z.torneoId == null || !torneoIdsValidos.has(z.torneoId))
            return false
          if (agrupadorIdNum != null && z.agrupadorId !== agrupadorIdNum)
            return false
          if (faseIdNum != null && z.faseId !== faseIdNum) return false
          if (zonaIdNum != null && z.id !== zonaIdNum) return false
          return true
        })
        return algunaZonaCoincide ?? false
      })
    }

    return lista
  }, [
    catalogoEquiposDisponibles,
    modo,
    textoBusqueda,
    torneosFiltrados,
    filtroAgrupadorId,
    filtroTorneoId,
    filtroFaseId,
    filtroZonaId
  ])

  const opcionesModo = [
    { id: MODO_BUSCAR, titulo: 'Buscar por código/nombre/club' },
    { id: MODO_OTRO_TORNEO, titulo: 'Desde otro torneo' }
  ]

  const toggleSeleccion = (equipoId: number) => {
    setIdsSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(equipoId)) next.delete(equipoId)
      else next.add(equipoId)
      return next
    })
  }

  const handleSeleccionVariosChange = (checked: boolean) => {
    setSeleccionMultipleActiva(checked)
    if (!checked) setIdsSeleccionados(new Set())
  }

  const limpiarSeleccion = useCallback(() => {
    setIdsSeleccionados(new Set())
  }, [])

  const handleDragStart = (e: React.DragEvent, equipo: EquipoDTO) => {
    const equiposADrag: EquipoDTO[] =
      seleccionMultipleActiva &&
      idsSeleccionados.has(equipo.id ?? 0) &&
      idsSeleccionados.size > 1
        ? catalogoEquiposDisponibles.filter(
            (eq) => eq.id != null && idsSeleccionados.has(eq.id)
          )
        : [equipo]
    e.dataTransfer.setData('application/json', JSON.stringify(equiposADrag))
    e.dataTransfer.effectAllowed = 'move'
  }

  return {
    modo,
    setModo,
    textoBusqueda,
    setTextoBusqueda,
    seleccionMultipleActiva,
    idsSeleccionados,
    filtroAnio,
    setFiltroAnio,
    filtroAgrupadorId,
    setFiltroAgrupadorId,
    filtroTorneoId,
    setFiltroTorneoId,
    filtroFaseId,
    setFiltroFaseId,
    filtroZonaId,
    setFiltroZonaId,
    equiposFiltrados,
    catalogoEquiposDisponibles,
    opcionesModo,
    toggleSeleccion,
    handleSeleccionVariosChange,
    limpiarSeleccion,
    handleDragStart
  }
}
