import { Input } from '@/design-system/base-ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { Boton } from '@/design-system/ykn-ui/boton'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { Info, Pencil, Trash2 } from 'lucide-react'
import type { EquipoWizard, Zona } from '../tipos'

interface ZonaConEquiposArrastrablesProps {
  zona: Zona
  editandoZonaId: string | null
  setEditandoZonaId: (id: string | null) => void
  cantidadZonas: number
  alArrastrarSobre: (e: React.DragEvent) => void
  alSoltar: () => void
  onIniciarArrastre: (equipo: EquipoWizard, zonaId: string) => void
  onActualizarZona: (zonaId: string, campo: Partial<Zona>) => void
  onActualizarFechasZona: (
    zonaId: string,
    campo: { fechasLibres?: number; fechasInterzonales?: number }
  ) => void
  onQuitarZona: (zonaId: string) => void
}

export function ZonaConEquiposArrastrables({
  zona,
  editandoZonaId,
  setEditandoZonaId,
  cantidadZonas,
  alArrastrarSobre,
  alSoltar,
  onIniciarArrastre,
  onActualizarZona,
  onActualizarFechasZona,
  onQuitarZona
}: ZonaConEquiposArrastrablesProps) {
  return (
    <div
      onDragOver={alArrastrarSobre}
      onDrop={alSoltar}
      className='bg-muted rounded-xl p-4 border-2 border-dashed min-h-[300px]'
    >
      <div className='flex items-center justify-between mb-4 gap-2'>
        {editandoZonaId === zona.id ? (
          <Input
            type='text'
            value={zona.nombre}
            onChange={(e) =>
              onActualizarZona(zona.id, { nombre: e.target.value })
            }
            onBlur={() => setEditandoZonaId(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditandoZonaId(null)
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className='flex-1 min-w-0'
          />
        ) : (
          <>
            <h4
              className='font-bold cursor-pointer hover:text-primary transition-colors flex-1 min-w-0'
              onClick={() => setEditandoZonaId(zona.id)}
            >
              {zona.nombre}
            </h4>
            <span
              onClick={(e) => {
                e.stopPropagation()
                setEditandoZonaId(zona.id)
              }}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditandoZonaId(zona.id)
              }}
              className='p-1 hover:bg-accent rounded transition-colors cursor-pointer'
            >
              <Pencil className='w-3 h-3 text-muted-foreground' />
            </span>
          </>
        )}
        <Boton
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0'
          onClick={(e) => {
            e.stopPropagation()
            onQuitarZona(zona.id)
          }}
          disabled={cantidadZonas <= 1}
        >
          <Trash2 className='w-4 h-4' />
        </Boton>
      </div>

      <TooltipProvider delayDuration={300}>
        <div className='space-y-2 mb-3'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1'>
              <span className='text-xs font-medium'>Fechas LIBRES</span>
              <Tooltip>
                <TooltipTrigger type='button'>
                  <Info className='w-3 h-3 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent className='max-w-[200px] text-xs'>
                  Cantidad de fechas en las que cada equipo de la zona quedará
                  libre
                </TooltipContent>
              </Tooltip>
            </div>
            <SelectorSimple
              tamano='sm'
              opciones={[
                { id: '0', texto: '0' },
                { id: '1', texto: '1' },
                { id: '2', texto: '2' }
              ]}
              valorActual={String(zona.fechasLibres)}
              alElegirOpcion={(v) =>
                onActualizarFechasZona(zona.id, {
                  fechasLibres: Number(v)
                })
              }
            />
          </div>

          {cantidadZonas > 1 && (
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-1'>
                <span className='text-xs font-medium'>Fechas INTERZONALES</span>
                <Tooltip>
                  <TooltipTrigger type='button'>
                    <Info className='w-3 h-3 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-[200px] text-xs'>
                    Cantidad de fechas en las que cada equipo jugará contra un
                    rival de otra zona
                  </TooltipContent>
                </Tooltip>
              </div>
              <SelectorSimple
                tamano='sm'
                opciones={[
                  { id: '0', texto: '0' },
                  { id: '1', texto: '1' },
                  { id: '2', texto: '2' }
                ]}
                valorActual={String(zona.fechasInterzonales)}
                alElegirOpcion={(v) =>
                  onActualizarFechasZona(zona.id, {
                    fechasInterzonales: Number(v)
                  })
                }
              />
            </div>
          )}
        </div>
      </TooltipProvider>

      <div className='text-xs text-muted-foreground mb-3'>
        {zona.equipos.length} equipo
        {zona.equipos.length !== 1 ? 's' : ''}
      </div>

      <div className='space-y-2'>
        {zona.equipos.map((equipo) => (
          <div
            key={equipo.id}
            draggable
            onDragStart={() => onIniciarArrastre(equipo, zona.id)}
            className='bg-background p-3 rounded-lg shadow-sm border cursor-move hover:shadow-md hover:border-primary/30 transition-all'
          >
            <div className='font-medium text-sm'>{equipo.nombre}</div>
            <div className='text-xs text-muted-foreground mt-1'>
              {equipo.club}
            </div>
          </div>
        ))}

        {zona.equipos.length === 0 && (
          <div className='text-center py-8 text-muted-foreground text-sm'>
            Arrastra equipos aquí
          </div>
        )}
      </div>
    </div>
  )
}
