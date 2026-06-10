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
  coincideBusquedaArbitro,
  nombreCompletoArbitro
} from './utilidades-asignacion'

const SIN_ARBITRO = 'sin-arbitro'

export interface OpcionArbitroAutocomplete {
  id: string
  nombre: string
  nombrePila: string
  apellido: string
  tieneConflicto: boolean
  textoConflicto: string | null
}

interface AutocompleteArbitroProps {
  titulo: string
  valor: string
  opciones: OpcionArbitroAutocomplete[]
  deshabilitado?: boolean
  textoConflictoSeleccionado?: string | null
  alCambiar: (arbitroId: string) => void
}

export function construirOpcionesArbitro(
  arbitros: ArbitroElegibleAsignacionDTO[],
  otroSlotArbitroId: string,
  obtenerConflicto: (arbitro: ArbitroElegibleAsignacionDTO) => string | null
): OpcionArbitroAutocomplete[] {
  return arbitros
    .filter((a) => String(a.id) !== otroSlotArbitroId)
    .map((a) => {
      const textoConflicto = obtenerConflicto(a)
      return {
        id: String(a.id),
        nombre: nombreCompletoArbitro(a.nombre, a.apellido),
        nombrePila: a.nombre ?? '',
        apellido: a.apellido ?? '',
        tieneConflicto: textoConflicto != null,
        textoConflicto
      }
    })
}

export default function AutocompleteArbitro({
  titulo,
  valor,
  opciones,
  deshabilitado,
  textoConflictoSeleccionado,
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

    const sinConflicto = filtradas
      .filter((o) => !o.tieneConflicto)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    const conConflicto = filtradas
      .filter((o) => o.tieneConflicto)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    return [...sinConflicto, ...conConflicto]
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

  return (
    <div className='min-w-[200px] flex-1 space-y-1'>
      <Label className='text-sm font-medium'>{titulo}</Label>
      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={abierto}
            disabled={deshabilitado}
            className={cn(
              'w-full justify-between font-normal',
              textoConflictoSeleccionado && 'border-amber-500/60 bg-amber-50/50'
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
                            opcion.tieneConflicto &&
                              'text-amber-800 hover:bg-amber-50'
                          )}
                          onClick={() => seleccionar(opcion.id)}
                        >
                          {opcion.tieneConflicto && (
                            <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
                          )}
                          <span className='truncate'>{opcion.nombre}</span>
                        </button>
                      </TooltipTrigger>
                      {opcion.textoConflicto && (
                        <TooltipContent side='right' className='max-w-xs'>
                          Ya tiene jornada ese día: {opcion.textoConflicto}
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
      {textoConflictoSeleccionado && (
        <p className='flex items-center gap-1 text-xs text-amber-700'>
          <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
          Ya tiene jornada ese día
        </p>
      )}
    </div>
  )
}
