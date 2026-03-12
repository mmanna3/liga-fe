import { api } from '@/api/api'
import { EquipoDTO, EquipoParaZonasDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { useEffect, useMemo, useState } from 'react'
import { FiltrosBuscadorDeEquipos } from './filtros-buscador-de-equipos'
import { RenglonBuscadorDeEquipos } from './renglon-buscador-de-equipos'

/** Convierte EquipoParaZonasDTO a EquipoDTO para compatibilidad con zona-fase y RenglonBuscadorDeEquipos */
function equipoParaZonasAEquipoDto(e: EquipoParaZonasDTO): EquipoDTO {
  const zonaExcluyente = e.zonas?.find((z) => z.esExcluyente)
  const primeraZona = e.zonas?.[0]
  return {
    id: e.id,
    nombre: e.nombre,
    clubNombre: e.club,
    codigoAlfanumerico: e.codigoAlfanumerico,
    clubId: 0,
    torneoId: primeraZona?.torneoId,
    faseId: primeraZona?.faseId,
    agrupadorId: primeraZona?.agrupadorId,
    zonaExcluyenteId: zonaExcluyente?.id,
    torneo: primeraZona?.torneo,
    fase: primeraZona?.fase,
    zonaExcluyente: zonaExcluyente?.nombre
  } as EquipoDTO
}

const MODO_BUSCAR = 'buscar'
const MODO_OTRO_TORNEO = 'otro-torneo'

interface BuscadorDeEquiposParaZonaProps {
  equiposEnZonas: EquipoDTO[]
}

export function BuscadorDeEquiposParaZona({
  equiposEnZonas
}: BuscadorDeEquiposParaZonaProps) {
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
    const algunoMovido = [...idsSeleccionados].some((id) => idsEnZonas.has(id))
    if (algunoMovido) {
      setIdsSeleccionados(new Set())
      setSeleccionMultipleActiva(false)
    }
  }, [equiposEnZonas, idsEnZonas, idsSeleccionados])

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

  const equiposFiltrados = useMemo(() => {
    let lista = equiposParaZonas.filter(
      (e) => e.id != null && !idsEnZonas.has(e.id)
    )

    if (modo === MODO_BUSCAR) {
      const t = textoBusqueda.trim().toLowerCase()
      if (t) {
        lista = lista.filter(
          (e) =>
            (e.nombre?.toLowerCase().includes(t) ?? false) ||
            (e.codigoAlfanumerico?.toLowerCase().includes(t) ?? false) ||
            (e.club?.toLowerCase().includes(t) ?? false)
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

    return lista.map(equipoParaZonasAEquipoDto)
  }, [
    equiposParaZonas,
    idsEnZonas,
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

  const handleDragStart = (e: React.DragEvent, equipo: EquipoDTO) => {
    const equiposADrag: EquipoDTO[] =
      seleccionMultipleActiva &&
      idsSeleccionados.has(equipo.id ?? 0) &&
      idsSeleccionados.size > 1
        ? equiposFiltrados.filter(
            (eq) => eq.id != null && idsSeleccionados.has(eq.id)
          )
        : [equipo]
    e.dataTransfer.setData('application/json', JSON.stringify(equiposADrag))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className='space-y-4'>
      <SelectorSimple
        opciones={opcionesModo}
        valorActual={modo}
        alElegirOpcion={setModo}
      />

      {modo === MODO_BUSCAR && (
        <Input
          tipo='text'
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          placeholder='Código, nombre o club'
        />
      )}

      {modo === MODO_OTRO_TORNEO && (
        <FiltrosBuscadorDeEquipos
          filtroAnio={filtroAnio}
          onFiltroAnioChange={setFiltroAnio}
          filtroAgrupadorId={filtroAgrupadorId}
          onFiltroAgrupadorIdChange={setFiltroAgrupadorId}
          filtroTorneoId={filtroTorneoId}
          onFiltroTorneoIdChange={setFiltroTorneoId}
          filtroFaseId={filtroFaseId}
          onFiltroFaseIdChange={setFiltroFaseId}
          filtroZonaId={filtroZonaId}
          onFiltroZonaIdChange={setFiltroZonaId}
        />
      )}

      <div className='mb-2 flex justify-end'>
        <CajitaConTick
          id='seleccion-varios'
          checked={seleccionMultipleActiva}
          onCheckedChange={handleSeleccionVariosChange}
          label='Seleccionar varios'
        />
      </div>

      <div>
        <div className='space-y-2 max-h-64 overflow-y-auto'>
          {equiposFiltrados.map((eq) => (
            <RenglonBuscadorDeEquipos
              key={eq.id}
              equipo={eq}
              seleccionMultipleActiva={seleccionMultipleActiva}
              idsSeleccionados={idsSeleccionados}
              onToggleSeleccion={toggleSeleccion}
              onDragStart={handleDragStart}
            />
          ))}
          {equiposFiltrados.length === 0 && (
            <p className='text-sm text-muted-foreground py-4 text-center'>
              No hay equipos disponibles
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
