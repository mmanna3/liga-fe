import { api } from '@/api/api'
import {
  CargarResultadosDTO,
  LocalVisitanteEnum,
  PartidoDTO,
  type JornadaDTO
} from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Switch } from '@/design-system/base-ui/switch'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

/** Ambos resultados son numéricos (no vacíos), finitos y coinciden → se cargan penales. */
function empateNumericoResultado(local: string, visitante: string): boolean {
  const aStr = local.trim()
  const bStr = visitante.trim()
  if (aStr === '' || bStr === '') return false
  const a = Number(aStr)
  const b = Number(bStr)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  return a === b
}

function etiquetasLocalVisitanteJornada(j: JornadaDTO): {
  local: string
  visitante: string
} {
  if (j.tipo === 'Normal') {
    return { local: j.local ?? '—', visitante: j.visitante ?? '—' }
  }
  if (j.tipo === 'SinEquipos') {
    return { local: '—', visitante: '—' }
  }
  if (j.tipo === 'Libre') {
    return { local: j.equipoLocal ?? '—', visitante: 'Libre' }
  }
  const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
  return {
    local: esLocal ? (j.equipo ?? '—') : 'Interzonal',
    visitante: esLocal ? 'Interzonal' : (j.equipo ?? '—')
  }
}

export function ModalCargarResultados({
  open,
  onOpenChange,
  tituloInstancia,
  subtitulo,
  jornadas,
  zonaId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tituloInstancia: string
  subtitulo?: string
  jornadas: JornadaDTO[]
  zonaId: number
}) {
  const queryClient = useQueryClient()
  const descripcion = [tituloInstancia, subtitulo].filter(Boolean).join(' · ')

  const [valores, setValores] = useState<
    {
      local: string
      visitante: string
      penalesLocal: string
      penalesVisitante: string
    }[]
  >([])
  const [resultadosVerificados, setResultadosVerificados] = useState(false)

  useEffect(() => {
    if (!open) {
      setValores([])
      setResultadosVerificados(false)
      return
    }
    setValores(
      jornadas.map((j) => {
        const p = j.partidos?.[0]
        return {
          local: p?.resultadoLocal ?? '',
          visitante: p?.resultadoVisitante ?? '',
          penalesLocal: p?.penalesLocal ?? '',
          penalesVisitante: p?.penalesVisitante ?? ''
        }
      })
    )
    setResultadosVerificados(
      jornadas.length > 0 && jornadas.every((j) => j.resultadosVerificados)
    )
  }, [open, jornadas])

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      for (let i = 0; i < jornadas.length; i++) {
        const j = jornadas[i]
        if (j.id == null) {
          throw new Error('Una jornada no tiene id')
        }
        const p = j.partidos?.[0]
        if (p == null) {
          throw new Error('Cada jornada debe tener un partido')
        }
        const dto = new PartidoDTO()
        dto.id = p.id
        dto.categoriaId = p.categoriaId
        dto.categoria = p.categoria
        dto.resultadoLocal = valores[i]?.local ?? ''
        dto.resultadoVisitante = valores[i]?.visitante ?? ''
        const row = valores[i]
        const hayEmpate =
          row != null && empateNumericoResultado(row.local, row.visitante)
        dto.penalesLocal = hayEmpate ? (row.penalesLocal ?? '') : ''
        dto.penalesVisitante = hayEmpate ? (row.penalesVisitante ?? '') : ''
        const body = new CargarResultadosDTO()
        body.jornadaId = j.id
        body.resultadosVerificados = resultadosVerificados
        body.partidos = [dto]
        await api.cargarResultados(zonaId, j.id, body)
      }
    },
    mensajeDeExito: 'Resultados guardados',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
      queryClient.invalidateQueries({
        queryKey: ['fechasEliminacionDirecta', zonaId]
      })
      onOpenChange(false)
    },
    mensajeDeError: 'No se pudieron guardar los resultados'
  })

  function setLocal(i: number, local: string) {
    setValores((prev) => {
      const next = [...prev]
      const row = next[i]
      if (!row) return prev
      const eraEmpate = empateNumericoResultado(row.local, row.visitante)
      const seraEmpate = empateNumericoResultado(local, row.visitante)
      if (eraEmpate && !seraEmpate) {
        next[i] = {
          ...row,
          local,
          penalesLocal: '',
          penalesVisitante: ''
        }
      } else {
        next[i] = { ...row, local }
      }
      return next
    })
  }

  function setVisitante(i: number, visitante: string) {
    setValores((prev) => {
      const next = [...prev]
      const row = next[i]
      if (!row) return prev
      const eraEmpate = empateNumericoResultado(row.local, row.visitante)
      const seraEmpate = empateNumericoResultado(row.local, visitante)
      if (eraEmpate && !seraEmpate) {
        next[i] = {
          ...row,
          visitante,
          penalesLocal: '',
          penalesVisitante: ''
        }
      } else {
        next[i] = { ...row, visitante }
      }
      return next
    })
  }

  function setPenalesLocal(i: number, penalesLocal: string) {
    setValores((prev) => {
      const next = [...prev]
      const row = next[i]
      if (!row) return prev
      next[i] = { ...row, penalesLocal }
      return next
    })
  }

  function setPenalesVisitante(i: number, penalesVisitante: string) {
    setValores((prev) => {
      const next = [...prev]
      const row = next[i]
      if (!row) return prev
      next[i] = { ...row, penalesVisitante }
      return next
    })
  }

  const puedeGuardar = jornadas.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-1'>
            <Icono nombre='Pelota' className='size-6 shrink-0' />
            Cargar resultados
          </DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>

        <div className='mb-3 flex items-center gap-2'>
          <Label
            htmlFor='resultados-verificados-ed'
            className='text-sm font-medium cursor-pointer shrink-0'
          >
            Resultados Verificados
          </Label>
          <Switch
            id='resultados-verificados-ed'
            checked={resultadosVerificados}
            onCheckedChange={setResultadosVerificados}
          />
        </div>

        <div className='max-h-[min(60vh,28rem)] overflow-y-auto space-y-0 border border-border rounded-md divide-y divide-border'>
          {jornadas.length === 0 ? (
            <p className='text-sm text-muted-foreground p-4'>
              No hay jornadas en esta instancia.
            </p>
          ) : (
            jornadas.map((j, i) => {
              const { local, visitante } = etiquetasLocalVisitanteJornada(j)
              const rl = valores[i]?.local ?? ''
              const rv = valores[i]?.visitante ?? ''
              const mostrarPenales = empateNumericoResultado(rl, rv)
              return (
                <div
                  key={j.id ?? i}
                  className='flex flex-wrap items-center gap-x-2 gap-y-2 px-3 py-3 text-sm'
                >
                  <span className='min-w-0 shrink font-medium text-right flex-1 basis-[8rem]'>
                    {local}
                  </span>
                  {mostrarPenales && (
                    <Input
                      aria-label={`Penales local, ${local}`}
                      className='h-9 w-16 shrink-0 text-center tabular-nums px-1'
                      value={valores[i]?.penalesLocal ?? ''}
                      onChange={(e) => setPenalesLocal(i, e.target.value)}
                    />
                  )}
                  <Input
                    aria-label={`Resultado local, ${local}`}
                    className='h-9 w-16 shrink-0 text-center tabular-nums px-1'
                    value={rl}
                    onChange={(e) => setLocal(i, e.target.value)}
                  />
                  <span className='text-muted-foreground shrink-0 px-0.5'>
                    vs.
                  </span>
                  <Input
                    aria-label={`Resultado visitante, ${visitante}`}
                    className='h-9 w-16 shrink-0 text-center tabular-nums px-1'
                    value={rv}
                    onChange={(e) => setVisitante(i, e.target.value)}
                  />
                  {mostrarPenales && (
                    <Input
                      aria-label={`Penales visitante, ${visitante}`}
                      className='h-9 w-16 shrink-0 text-center tabular-nums px-1'
                      value={valores[i]?.penalesVisitante ?? ''}
                      onChange={(e) => setPenalesVisitante(i, e.target.value)}
                    />
                  )}
                  <span className='min-w-0 shrink font-medium text-left flex-1 basis-[8rem]'>
                    {visitante}
                  </span>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter>
          <Boton
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Boton>
          <Boton
            type='button'
            disabled={!puedeGuardar || guardarMutation.isPending}
            estaCargando={guardarMutation.isPending}
            onClick={() => guardarMutation.mutate()}
          >
            Guardar
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
