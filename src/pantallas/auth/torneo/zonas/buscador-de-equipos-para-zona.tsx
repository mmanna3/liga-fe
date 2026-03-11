import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import { Label } from '@/design-system/base-ui/label'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { cn } from '@/logica-compartida/utils'
import { useMemo, useState } from 'react'

function obtenerOpcionesAnio(): { value: string; label: string }[] {
  const anioActual = new Date().getFullYear()
  const opciones: { value: string; label: string }[] = []
  for (let a = anioActual; a >= anioActual - 20; a--) {
    opciones.push({ value: String(a), label: String(a) })
  }
  return opciones
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
  const anioActual = new Date().getFullYear()
  const [filtroAnio, setFiltroAnio] = useState(anioActual)
  const [filtroAgrupadorId, setFiltroAgrupadorId] = useState<string>('')
  const [filtroTorneoId, setFiltroTorneoId] = useState<string>('')
  const [filtroFaseId, setFiltroFaseId] = useState<string>('')
  const [filtroZonaId, setFiltroZonaId] = useState<string>('')

  const idsEnZonas = useMemo(
    () => new Set(equiposEnZonas.map((e) => e.id).filter(Boolean)),
    [equiposEnZonas]
  )

  const { data: equipos = [] } = useApiQuery({
    key: ['equipoAll'],
    fn: () => api.equipoAll()
  })

  const { data: agrupadores = [] } = useApiQuery({
    key: ['torneoAgrupadorAll'],
    fn: () => api.torneoAgrupadorAll()
  })

  const { data: torneos = [] } = useApiQuery({
    key: ['torneosFiltrar', filtroAnio, filtroAgrupadorId || undefined],
    fn: () =>
      api.torneosFiltrar(
        filtroAnio,
        filtroAgrupadorId ? parseInt(filtroAgrupadorId, 10) : undefined
      )
  })

  const torneoSeleccionado = useMemo(
    () => torneos.find((t) => String(t.id) === filtroTorneoId),
    [torneos, filtroTorneoId]
  )

  const { data: fases = [] } = useApiQuery({
    key: ['fasesAll', torneoSeleccionado?.id],
    fn: () => api.fasesAll(torneoSeleccionado!.id!),
    activado: !!torneoSeleccionado?.id
  })

  const faseSeleccionada = useMemo(
    () => fases.find((f) => String(f.id) === filtroFaseId),
    [fases, filtroFaseId]
  )

  const { data: zonas = [] } = useApiQuery({
    key: ['zonasAll', faseSeleccionada?.id],
    fn: () => api.zonasAll(faseSeleccionada!.id!),
    activado: !!faseSeleccionada?.id
  })

  const equiposFiltrados = useMemo(() => {
    let lista = equipos.filter((e) => !idsEnZonas.has(e.id))

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
      const torneoId = filtroTorneoId ? parseInt(filtroTorneoId, 10) : null
      if (torneoId) {
        lista = lista.filter((e) => e.torneoId === torneoId)
      }
    }

    return lista
  }, [equipos, idsEnZonas, modo, textoBusqueda, filtroTorneoId])

  const opcionesModo = [
    { id: MODO_BUSCAR, titulo: 'Buscar por código/nombre' },
    { id: MODO_OTRO_TORNEO, titulo: 'Desde otro torneo' }
  ]

  const opcionesAnio = useMemo(() => obtenerOpcionesAnio(), [])

  const handleDragStart = (e: React.DragEvent, equipo: EquipoDTO) => {
    e.dataTransfer.setData('application/json', JSON.stringify(equipo))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className='space-y-4'>
      <SelectorSimple
        titulo='Origen de equipos'
        opciones={opcionesModo}
        valorActual={modo}
        alElegirOpcion={setModo}
      />

      {modo === MODO_BUSCAR && (
        <Input
          titulo='Buscar'
          tipo='text'
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          placeholder='Código, nombre o club'
        />
      )}

      {modo === MODO_OTRO_TORNEO && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-lg border bg-muted/30'>
          <div className='space-y-2'>
            <Label>Año</Label>
            <Select
              value={String(filtroAnio)}
              onValueChange={(v) =>
                setFiltroAnio(parseInt(v, 10) || anioActual)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Año' />
              </SelectTrigger>
              <SelectContent>
                {opcionesAnio.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Agrupador</Label>
            <Select
              value={filtroAgrupadorId || 'todos'}
              onValueChange={(v) =>
                setFiltroAgrupadorId(v === 'todos' ? '' : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Agrupador' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todos'>Todos</SelectItem>
                {agrupadores.map((a) => (
                  <SelectItem key={a.id} value={String(a.id ?? 0)}>
                    {a.nombre ?? ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Torneo</Label>
            <Select
              value={filtroTorneoId || 'todos'}
              onValueChange={(v) => setFiltroTorneoId(v === 'todos' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Torneo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todos'>Todos</SelectItem>
                {torneos.map((t) => (
                  <SelectItem key={t.id} value={String(t.id ?? 0)}>
                    {t.nombre ?? ''} ({t.anio ?? ''})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Fase</Label>
            <Select
              value={filtroFaseId || 'todas'}
              onValueChange={(v) => setFiltroFaseId(v === 'todas' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Fase' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todas'>Todas</SelectItem>
                {fases.map((f) => (
                  <SelectItem key={f.id} value={String(f.id ?? 0)}>
                    {f.nombre ?? ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Zona</Label>
            <Select
              value={filtroZonaId || 'todas'}
              onValueChange={(v) => setFiltroZonaId(v === 'todas' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Zona' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todas'>Todas</SelectItem>
                {zonas.map((z) => (
                  <SelectItem key={z.id} value={String(z.id ?? 0)}>
                    {z.nombre ?? ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <h3 className='text-sm font-semibold mb-2'>Equipos disponibles</h3>
        <p className='text-xs text-muted-foreground mb-2'>
          Arrastrá un equipo hacia la zona deseada
        </p>
        <div className='space-y-2 max-h-64 overflow-y-auto'>
          {equiposFiltrados.map((eq) => (
            <div
              key={eq.id}
              draggable
              onDragStart={(e) => handleDragStart(e, eq)}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-2 bg-background',
                'cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors'
              )}
            >
              <span className='font-mono text-sm text-muted-foreground shrink-0'>
                {eq.codigoAlfanumerico ?? '—'}
              </span>
              <span className='font-medium truncate'>{eq.nombre ?? '—'}</span>
              <span className='text-muted-foreground text-sm truncate'>
                {eq.clubNombre ?? '—'}
              </span>
            </div>
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
