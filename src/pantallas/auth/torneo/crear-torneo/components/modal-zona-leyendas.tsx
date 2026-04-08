import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Label } from '@/design-system/base-ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import { Textarea } from '@/design-system/base-ui/textarea'
import { Boton } from '@/design-system/ykn-ui/boton'
import {
  LeyendaTablaPosicionesDTO,
  type TorneoCategoriaDTO
} from '@/api/clients'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquareMore, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const VALOR_CATEGORIA_GENERAL = 'general'

const MAX_LEYENDA = 1000

function etiquetaCategoria(
  leyenda: LeyendaTablaPosicionesDTO,
  categorias: TorneoCategoriaDTO[]
): string {
  if (leyenda.categoriaId == null) return 'General'
  const cat = categorias.find((c) => c.id === leyenda.categoriaId)
  return cat?.nombre ?? 'General'
}

function agruparPorCategoria(
  leyendas: LeyendaTablaPosicionesDTO[],
  categorias: TorneoCategoriaDTO[]
) {
  const mapa = new Map<string, LeyendaTablaPosicionesDTO[]>()
  for (const l of leyendas) {
    const etiqueta = etiquetaCategoria(l, categorias)
    const lista = mapa.get(etiqueta) ?? []
    lista.push(l)
    mapa.set(etiqueta, lista)
  }
  const claves = [...mapa.keys()].sort((a, b) => {
    if (a === 'General') return -1
    if (b === 'General') return 1
    return a.localeCompare(b, 'es')
  })
  return claves.map((categoria) => ({
    categoria,
    items: mapa.get(categoria)!
  }))
}

interface ModalZonaLeyendasProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  zonaId: number
  nombreTorneo: string
  nombreFase: string
  tipoDeFase: string
  nombreZona: string
  categorias: TorneoCategoriaDTO[]
}

export default function ModalZonaLeyendas({
  open,
  onOpenChange,
  zonaId,
  nombreTorneo,
  nombreFase,
  tipoDeFase,
  nombreZona,
  categorias
}: ModalZonaLeyendasProps) {
  const queryClient = useQueryClient()
  const [textoNueva, setTextoNueva] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    VALOR_CATEGORIA_GENERAL
  )

  const {
    data: leyendas = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['leyendas-zona', zonaId],
    queryFn: () => api.leyendasAll(zonaId),
    enabled: open && zonaId > 0
  })

  const grupos = useMemo(
    () => agruparPorCategoria(leyendas, categorias),
    [leyendas, categorias]
  )

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['leyendas-zona', zonaId] })
  }

  const guardarMutation = useApiMutation({
    fn: async (body: LeyendaTablaPosicionesDTO) => {
      await api.leyendasPOST(zonaId, body)
    },
    mensajeDeExito: 'Leyenda guardada',
    antesDeMensajeExito: () => {
      setTextoNueva('')
      setCategoriaSeleccionada(VALOR_CATEGORIA_GENERAL)
      invalidar()
    }
  })

  const eliminarMutation = useApiMutation({
    fn: async (id: number) => {
      await api.leyendasDELETE(zonaId, id)
    },
    mensajeDeExito: 'Leyenda eliminada',
    antesDeMensajeExito: invalidar
  })

  useEffect(() => {
    if (!open) {
      setTextoNueva('')
      setCategoriaSeleccionada(VALOR_CATEGORIA_GENERAL)
    }
  }, [open])

  const guardar = () => {
    const leyenda = textoNueva.trim()
    if (!leyenda) return
    guardarMutation.mutate(
      LeyendaTablaPosicionesDTO.fromJS({
        leyenda,
        zonaId,
        categoriaId:
          categoriaSeleccionada === VALOR_CATEGORIA_GENERAL
            ? null
            : Number(categoriaSeleccionada)
      })
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden sm:max-w-lg'>
        <DialogHeader className='shrink-0 space-y-1 pr-8 text-left'>
          <DialogTitle className='flex items-center gap-2 text-left'>
            <MessageSquareMore
              className='h-5 w-5 shrink-0 text-foreground'
              aria-hidden
            />
            Leyendas de la zona
          </DialogTitle>
          <DialogDescription asChild>
            <div className='space-y-1 text-sm text-muted-foreground'>
              <p>
                <span className='font-medium text-foreground'>Torneo:</span>{' '}
                {nombreTorneo || '—'}
              </p>
              <p>
                <span className='font-medium text-foreground'>Fase:</span>{' '}
                {nombreFase || '—'}
                {tipoDeFase && tipoDeFase !== '—' ? ` · ${tipoDeFase}` : ''}
              </p>
              <p>
                <span className='font-medium text-foreground'>Zona:</span>{' '}
                {nombreZona || '—'}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4 shrink-0 space-y-3 border-b pb-4'>
          <div className='space-y-2'>
            <Label htmlFor='categoria-leyenda-zona'>Categoría</Label>
            <Select
              value={categoriaSeleccionada}
              onValueChange={setCategoriaSeleccionada}
            >
              <SelectTrigger
                id='categoria-leyenda-zona'
                className='w-full'
                aria-label='Categoría de la leyenda'
              >
                <SelectValue placeholder='Elegí una categoría' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VALOR_CATEGORIA_GENERAL}>General</SelectItem>
                {categorias.map((cat) =>
                  cat.id != null ? (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nombre}
                    </SelectItem>
                  ) : null
                )}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='nueva-leyenda-zona'>Nueva Leyenda</Label>
            <Textarea
              id='nueva-leyenda-zona'
              placeholder='Nueva Leyenda'
              maxLength={MAX_LEYENDA}
              value={textoNueva}
              onChange={(e) => setTextoNueva(e.target.value)}
              className='min-h-20 resize-y'
            />
            <div className='flex items-center justify-between gap-2'>
              <span className='text-muted-foreground text-xs'>
                {textoNueva.length}/{MAX_LEYENDA}
              </span>
              <Boton
                type='button'
                onClick={guardar}
                estaCargando={guardarMutation.isPending}
                disabled={!textoNueva.trim()}
              >
                Guardar
              </Boton>
            </div>
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto pt-4'>
          {isError ? (
            <p className='text-destructive text-sm'>
              No se pudieron cargar las leyendas.
            </p>
          ) : isLoading ? (
            <p className='text-muted-foreground text-sm'>Cargando…</p>
          ) : grupos.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No hay leyendas en esta zona.
            </p>
          ) : (
            <ul className='space-y-6'>
              {grupos.map(({ categoria, items }) => (
                <li key={categoria}>
                  <h3 className='mb-2 border-b pb-1 text-sm font-semibold text-foreground'>
                    {categoria}
                  </h3>
                  <ul className='space-y-2'>
                    {items.map((item, idx) => (
                      <li
                        key={item.id ?? `leyenda-${idx}`}
                        className='flex gap-2 rounded-md border border-border bg-muted/20 px-3 py-2'
                      >
                        <p className='min-w-0 flex-1 whitespace-pre-wrap text-sm'>
                          {item.leyenda}
                        </p>
                        <Boton
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                          aria-label='Eliminar leyenda'
                          estaCargando={
                            eliminarMutation.isPending &&
                            eliminarMutation.variables === item.id
                          }
                          disabled={
                            item.id == null ||
                            (eliminarMutation.isPending &&
                              eliminarMutation.variables !== item.id)
                          }
                          onClick={() => {
                            if (item.id != null)
                              eliminarMutation.mutate(item.id)
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Boton>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
