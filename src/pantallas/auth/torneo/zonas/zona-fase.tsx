import { EquipoDTO } from '@/api/clients'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/design-system/base-ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import Icono from '@/design-system/ykn-ui/icono'
import { TextoEditable } from '@/design-system/ykn-ui/texto-editable'
import { cn } from '@/logica-compartida/utils'
import { X } from 'lucide-react'
import { useState } from 'react'
import type { ZonaEstado } from './tipos-zona'

function textoEquipoCompleto(eq: EquipoDTO): string {
  const partes: string[] = []
  if (eq.codigoAlfanumerico) partes.push(eq.codigoAlfanumerico + ' -')
  partes.push(eq.nombre ?? '—')
  if (eq.clubNombre) partes.push(`(${eq.clubNombre})`)
  return partes.join(' ')
}

function equipoEnZonaExcluyente(
  eq: EquipoDTO,
  esExcluyente: boolean,
  idsEnZonas: Set<number>
): boolean {
  if (!esExcluyente) return false
  return (
    (eq.zonaExcluyenteId != null && eq.zonaExcluyenteId > 0) ||
    idsEnZonas.has(eq.id ?? 0)
  )
}

interface ZonaProps {
  zona: ZonaEstado
  onNombreChange: (nombre: string) => void
  onQuitarEquipo: (equipoId: number) => void
  onDropEquipo: (equipo: EquipoDTO) => void
  onEliminar?: () => void
  editable?: boolean
  esExcluyente?: boolean
  idsEnZonas?: Set<number>
}

export function Zona({
  zona,
  onNombreChange,
  onQuitarEquipo,
  onDropEquipo,
  onEliminar,
  editable = true,
  esExcluyente = false,
  idsEnZonas = new Set()
}: ZonaProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [pendienteDrop, setPendienteDrop] = useState<{
    equipos: EquipoDTO[]
  } | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const ejecutarDrop = (equipos: EquipoDTO[]) => {
    equipos.forEach((eq) => onDropEquipo(eq))
    setPendienteDrop(null)
    setModalAbierto(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (data) {
      try {
        const parsed = JSON.parse(data) as EquipoDTO | EquipoDTO[]
        const equipos = Array.isArray(parsed) ? parsed : [parsed]
        const equiposEnExcluyente = equipos.filter((eq) =>
          equipoEnZonaExcluyente(eq, esExcluyente, idsEnZonas)
        )

        if (esExcluyente && equiposEnExcluyente.length > 0) {
          setPendienteDrop({ equipos })
          setModalAbierto(true)
        } else {
          ejecutarDrop(equipos)
        }
      } catch {
        // ignore
      }
    }
  }

  const esUnSoloEquipo = pendienteDrop && pendienteDrop.equipos.length === 1
  const tituloModal = esUnSoloEquipo
    ? '¿Estás seguro de mover de zona excluyente a este equipo?'
    : '¿Estás seguro de este movimiento?'
  const subtituloModal = esUnSoloEquipo
    ? 'Al guardar los cambios, dejará de estar en la zona excluyente en la que actualmente está.'
    : 'Tu selección incluye equipos que están en zonas excluyentes. Al moverlos a esta zona (excluyente) dejarán de estar en la zona que estaban.'
  const textoBotonConfirmar = esUnSoloEquipo ? 'Mover equipo' : 'Mover equipos'

  return (
    <>
      <AlertDialog
        open={modalAbierto}
        onOpenChange={(open) => {
          setModalAbierto(open)
          if (!open) setPendienteDrop(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tituloModal}</AlertDialogTitle>
            <AlertDialogDescription>{subtituloModal}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendienteDrop && ejecutarDrop(pendienteDrop.equipos)
              }
            >
              {textoBotonConfirmar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className={cn(
          'rounded-lg p-4 bg-yellow-50 bg-[radial-gradient(#0001_1px,transparent_1px)] bg-size-[8px_8px] min-h-[120px]',
          'transition-colors relative',
          editable && onEliminar && 'pr-12'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {editable && onEliminar && (
          <button
            type='button'
            onClick={onEliminar}
            className='absolute top-4 right-4 p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors'
            aria-label='Eliminar zona'
          >
            <Icono nombre='Eliminar' className='h-4 w-4' />
          </button>
        )}
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
    </>
  )
}
