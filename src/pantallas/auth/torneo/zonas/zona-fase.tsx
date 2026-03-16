import { EquipoDTO } from '@/api/clients'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import Icono from '@/design-system/ykn-ui/icono'
import { TextoEditable } from '@/design-system/ykn-ui/texto-editable'
import { cn } from '@/logica-compartida/utils'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ZonaEstado } from './tipos-zona'

function textoEquipoCompleto(eq: EquipoDTO): string {
  const partes: string[] = []
  if (eq.codigoAlfanumerico) partes.push(eq.codigoAlfanumerico + ' -')
  partes.push(eq.nombre ?? '—')
  if (eq.clubNombre) partes.push(`(${eq.clubNombre})`)
  return partes.join(' ')
}

interface ZonaProps {
  zona: ZonaEstado
  onNombreChange: (nombre: string) => void
  onQuitarEquipo: (equipoId: number) => void
  onDropEquipo: (equipo: EquipoDTO) => void
  onEliminar?: () => void
  editable?: boolean
  /** Ruta a la pantalla Fixture de esta zona (solo en modo modificar, cuando la zona tiene id). */
  pathFixture?: string
}

export function Zona({
  zona,
  onNombreChange,
  onQuitarEquipo,
  onDropEquipo,
  onEliminar,
  editable = true,
  pathFixture
}: ZonaProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (data) {
      try {
        const parsed = JSON.parse(data) as EquipoDTO | EquipoDTO[]
        const equipos = Array.isArray(parsed) ? parsed : [parsed]
        equipos.forEach((eq) => onDropEquipo(eq))
      } catch {
        // ignore
      }
    }
  }

  return (
    <div
      data-testid='zona-card'
      className={cn(
        'rounded-lg p-4 bg-yellow-50 bg-[radial-gradient(#0001_1px,transparent_1px)] bg-size-[8px_8px] min-h-[120px]',
        'transition-colors relative',
        (editable && onEliminar) || pathFixture ? 'pr-12' : ''
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className='absolute top-4 right-4 flex items-center gap-1'>
        {pathFixture && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={pathFixture}
                className='p-1.5 rounded text-muted-foreground hover:text-primary transition-colors'
                aria-label='Ver fixture'
              >
                <Icono nombre='Fixture' className='h-4 w-4' />
              </Link>
            </TooltipTrigger>
            <TooltipContent side='left'>
              <p>Fixture</p>
            </TooltipContent>
          </Tooltip>
        )}
        {editable && onEliminar && (
          <button
            type='button'
            onClick={onEliminar}
            className='p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors'
            aria-label='Eliminar zona'
          >
            <Icono nombre='Eliminar' className='h-4 w-4' />
          </button>
        )}
      </div>
      <div className='mb-2'>
        {editable ? (
          <TextoEditable
            valor={zona.nombre}
            alCambiar={onNombreChange}
            tamanio='default'
            placeholder='Nombre de la zona'
          />
        ) : (
          <p className='font-semibold text-lg'>{zona.nombre}</p>
        )}
      </div>
      <p className='text-xs text-muted-foreground mb-2'>
        {zona.equipos.length == 1
          ? '1 equipo'
          : `${zona.equipos.length} equipos`}
      </p>
      <div className='space-y-2'>
        {zona.equipos.map((eq) => (
          <Tooltip key={eq.id}>
            <TooltipTrigger asChild>
              <div
                draggable={editable}
                onDragStart={
                  editable
                    ? (e) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify(eq)
                        )
                        e.dataTransfer.effectAllowed = 'move'
                      }
                    : undefined
                }
                className={cn(
                  'flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 border text-sm',
                  editable
                    ? 'cursor-grab active:cursor-grabbing'
                    : 'cursor-default'
                )}
              >
                <span className='truncate'>
                  {eq.nombre ?? '—'}
                  {eq.clubNombre && (
                    <span className='text-muted-foreground ml-1'>
                      ({eq.clubNombre})
                    </span>
                  )}
                </span>
                {editable && (
                  <button
                    type='button'
                    onClick={() => eq.id != null && onQuitarEquipo(eq.id)}
                    className='shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors'
                    aria-label='Quitar equipo'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side='top' className='max-w-sm'>
              <p className='whitespace-normal'>{textoEquipoCompleto(eq)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
