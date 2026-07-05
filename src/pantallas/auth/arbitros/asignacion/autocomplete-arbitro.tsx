import type { ArbitroElegibleAsignacionDTO } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import { Label } from '@/design-system/base-ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/design-system/base-ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { Input } from '@/design-system/base-ui/input'
import { cn } from '@/logica-compartida/utils'
import { AlertTriangle, ChevronsUpDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type AdvertenciaArbitro,
  ETIQUETA_TIPO_ADVERTENCIA_ARBITRO,
  claveAdvertenciaArbitro,
  coincideBusquedaArbitro,
  nombreCompletoArbitro
} from './utilidades-asignacion'

const SIN_ARBITRO = 'sin-arbitro'

export interface OpcionArbitroAutocomplete {
  id: string
  nombre: string
  nombrePila: string
  apellido: string
  tieneAdvertencias: boolean
  advertencias: AdvertenciaArbitro[]
}

interface AutocompleteArbitroProps {
  titulo: string
  valor: string
  opciones: OpcionArbitroAutocomplete[]
  deshabilitado?: boolean
  advertenciasSeleccionadas?: AdvertenciaArbitro[]
  accionDerecha?: React.ReactNode
  alCambiar: (arbitroId: string) => void
}

export function construirOpcionesArbitro(
  arbitros: ArbitroElegibleAsignacionDTO[],
  otroSlotArbitroId: string,
  obtenerAdvertencias: (
    arbitro: ArbitroElegibleAsignacionDTO
  ) => AdvertenciaArbitro[]
): OpcionArbitroAutocomplete[] {
  return arbitros
    .filter((a) => String(a.id) !== otroSlotArbitroId)
    .map((a) => {
      const advertencias = obtenerAdvertencias(a)
      return {
        id: String(a.id),
        nombre: nombreCompletoArbitro(a.nombre, a.apellido),
        nombrePila: a.nombre ?? '',
        apellido: a.apellido ?? '',
        tieneAdvertencias: advertencias.length > 0,
        advertencias
      }
    })
}

function ContenidoAdvertenciasTooltip({
  advertencias
}: {
  advertencias: AdvertenciaArbitro[]
}) {
  return (
    <ul className='space-y-2'>
      {advertencias.map((advertencia) => (
        <li key={claveAdvertenciaArbitro(advertencia)}>
          <p className='font-bold text-primary-foreground'>
            {ETIQUETA_TIPO_ADVERTENCIA_ARBITRO[advertencia.tipo]}
          </p>
          <p className='text-xs text-primary-foreground'>
            {advertencia.detalle ?? advertencia.titulo}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default function AutocompleteArbitro({
  titulo,
  valor,
  opciones,
  deshabilitado,
  advertenciasSeleccionadas = [],
  accionDerecha,
  alCambiar
}: AutocompleteArbitroProps) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const etiquetaSeleccionada =
    valor === SIN_ARBITRO
      ? 'Sin árbitro'
      : (opciones.find((o) => o.id === valor)?.nombre ?? 'Sin árbitro')

  const opcionesVisibles = useMemo(() => {
    const filtradas = opciones.filter((o) =>
      coincideBusquedaArbitro(o.nombrePila, o.apellido, busqueda)
    )

    const sinAdvertencias = filtradas
      .filter((o) => !o.tieneAdvertencias)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    const conAdvertencias = filtradas
      .filter((o) => o.tieneAdvertencias)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    return [...sinAdvertencias, ...conAdvertencias]
  }, [opciones, busqueda])

  useEffect(() => {
    if (abierto) {
      setBusqueda('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [abierto])

  const seleccionar = (id: string) => {
    alCambiar(id)
    setAbierto(false)
  }

  const manejarKeyDownLista = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && opcionesVisibles.length > 0) {
      e.preventDefault()
      seleccionar(opcionesVisibles[0].id)
    }
    if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  const hayAdvertencias = advertenciasSeleccionadas.length > 0

  return (
    <div className='min-w-[200px] flex-1 space-y-1'>
      <Label className='text-sm font-medium'>{titulo}</Label>
      <div className='flex items-center gap-2'>
        <Popover open={abierto} onOpenChange={setAbierto}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              role='combobox'
              aria-expanded={abierto}
              disabled={deshabilitado}
              className={cn(
                'min-w-0 flex-1 justify-between font-normal',
                hayAdvertencias && 'border-amber-500/60 bg-amber-50/50'
              )}
            >
              <span className='truncate'>{etiquetaSeleccionada}</span>
              <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='w-[var(--radix-popover-trigger-width)] p-0'
            align='start'
          >
            <div className='border-b border-border p-2'>
              <Input
                ref={inputRef}
                placeholder='Buscar nombre o apellido…'
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={manejarKeyDownLista}
              />
            </div>
            <ul
              className='max-h-60 overflow-y-auto p-1'
              role='listbox'
              onKeyDown={manejarKeyDownLista}
            >
              <li>
                <button
                  type='button'
                  className={cn(
                    'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                    valor === SIN_ARBITRO && 'bg-accent'
                  )}
                  onClick={() => seleccionar(SIN_ARBITRO)}
                >
                  Sin árbitro
                </button>
              </li>
              {opcionesVisibles.length === 0 ? (
                <li className='px-2 py-3 text-center text-sm text-muted-foreground'>
                  No hay árbitros que coincidan
                </li>
              ) : (
                opcionesVisibles.map((opcion) => (
                  <li key={opcion.id}>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            className={cn(
                              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                              valor === opcion.id && 'bg-accent',
                              opcion.tieneAdvertencias &&
                                'text-amber-800 hover:bg-amber-50'
                            )}
                            onClick={() => seleccionar(opcion.id)}
                          >
                            {opcion.tieneAdvertencias && (
                              <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
                            )}
                            <span className='truncate'>{opcion.nombre}</span>
                          </button>
                        </TooltipTrigger>
                        {opcion.advertencias.length > 0 && (
                          <TooltipContent side='right' className='max-w-xs'>
                            <ContenidoAdvertenciasTooltip
                              advertencias={opcion.advertencias}
                            />
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))
              )}
            </ul>
          </PopoverContent>
        </Popover>
        {accionDerecha}
      </div>
      <div
        className={cn(
          'min-h-4 space-y-0.5 text-xs text-amber-700',
          !hayAdvertencias && 'invisible'
        )}
        aria-hidden={!hayAdvertencias}
        data-testid={hayAdvertencias ? 'advertencias-arbitro' : undefined}
      >
        {advertenciasSeleccionadas.map((advertencia) => (
          <p
            key={claveAdvertenciaArbitro(advertencia)}
            className='flex items-center gap-1'
          >
            <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
            {advertencia.titulo}
          </p>
        ))}
      </div>
    </div>
  )
}
