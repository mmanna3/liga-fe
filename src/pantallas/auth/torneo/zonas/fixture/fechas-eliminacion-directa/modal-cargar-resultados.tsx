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
    { local: string; visitante: string }[]
  >([])
  const [resultadosVerificados, setResultadosVerificados] = useState(false)

  useEffect(() => {
    if (!open) {
      setValores([])
      setResultadosVerificados(false)
      return
    }
    setValores(
      jornadas.map((j) => ({
        local: j.partidos?.[0]?.resultadoLocal ?? '',
        visitante: j.partidos?.[0]?.resultadoVisitante ?? ''
      }))
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
      next[i] = { ...row, local }
      return next
    })
  }

  function setVisitante(i: number, visitante: string) {
    setValores((prev) => {
      const next = [...prev]
      const row = next[i]
      if (!row) return prev
      next[i] = { ...row, visitante }
      return next
    })
  }

  const puedeGuardar =
    jornadas.length > 0 &&
    jornadas.every((j) => j.id != null && j.partidos?.[0] != null)

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
              return (
                <div
                  key={j.id ?? i}
                  className='flex flex-wrap items-center gap-x-2 gap-y-2 px-3 py-3 text-sm'
                >
                  <span className='min-w-0 shrink font-medium text-right flex-1 basis-[8rem]'>
                    {local}
                  </span>
                  <Input
                    aria-label={`Resultado local, ${local}`}
                    className='h-9 w-16 shrink-0 text-center tabular-nums px-1'
                    value={valores[i]?.local ?? ''}
                    onChange={(e) => setLocal(i, e.target.value)}
                  />
                  <span className='text-muted-foreground shrink-0 px-0.5'>
                    vs.
                  </span>
                  <Input
                    aria-label={`Resultado visitante, ${visitante}`}
                    className='h-9 w-16 shrink-0 text-center tabular-nums px-1'
                    value={valores[i]?.visitante ?? ''}
                    onChange={(e) => setVisitante(i, e.target.value)}
                  />
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
