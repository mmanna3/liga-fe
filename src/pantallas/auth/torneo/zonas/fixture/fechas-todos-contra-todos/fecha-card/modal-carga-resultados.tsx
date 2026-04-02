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

interface ModalCargaResultadosProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jornada: JornadaDTO | null
  zonaId: number
  /** Número de fecha (Fecha N) para el subtítulo. */
  numeroFecha: number
}

function etiquetasLocalVisitanteJornada(j: JornadaDTO): {
  local: string
  visitante: string
} {
  if (j.tipo === 'Normal') {
    return { local: j.local ?? '—', visitante: j.visitante ?? '—' }
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

export function ModalCargaResultados({
  open,
  onOpenChange,
  jornada,
  zonaId,
  numeroFecha
}: ModalCargaResultadosProps) {
  const queryClient = useQueryClient()
  const partidos = jornada?.partidos ?? []

  const [valores, setValores] = useState<
    { local: string; visitante: string }[]
  >([])
  const [resultadosVerificados, setResultadosVerificados] = useState(false)

  useEffect(() => {
    if (!open || !jornada) {
      setValores([])
      setResultadosVerificados(false)
      return
    }
    setResultadosVerificados(jornada.resultadosVerificados ?? false)
    if (!jornada.partidos?.length) {
      setValores([])
      return
    }
    setValores(
      jornada.partidos.map((p) => ({
        local: p.resultadoLocal ?? '',
        visitante: p.resultadoVisitante ?? ''
      }))
    )
  }, [open, jornada])

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      if (jornada?.id == null) {
        throw new Error('La jornada no tiene id')
      }
      const partidosDto = partidos.map((p, i) => {
        const dto = new PartidoDTO()
        dto.id = p.id
        dto.categoriaId = p.categoriaId
        dto.categoria = p.categoria
        dto.resultadoLocal = valores[i]?.local ?? ''
        dto.resultadoVisitante = valores[i]?.visitante ?? ''
        return dto
      })
      const body = new CargarResultadosDTO()
      body.jornadaId = jornada.id
      body.resultadosVerificados = resultadosVerificados
      body.partidos = partidosDto
      await api.cargarResultados(zonaId, jornada.id, body)
    },
    mensajeDeExito: 'Resultados guardados',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
      onOpenChange(false)
    },
    mensajeDeError: 'No se pudieron guardar los resultados'
  })

  const setLocal = (i: number, local: string) => {
    setValores((prev) => {
      const next = [...prev]
      const row = next[i]
      if (!row) return prev
      next[i] = { ...row, local }
      return next
    })
  }

  const setVisitante = (i: number, visitante: string) => {
    setValores((prev) => {
      const next = [...prev]
      const row = next[i]
      if (!row) return prev
      next[i] = { ...row, visitante }
      return next
    })
  }

  const puedeGuardar = jornada?.id != null

  const etiquetasVs =
    jornada != null ? etiquetasLocalVisitanteJornada(jornada) : null
  const subtituloModal = etiquetasVs
    ? `Fecha ${numeroFecha} - ${etiquetasVs.local} vs. ${etiquetasVs.visitante}`
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        {jornada && (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-1'>
                <Icono nombre='Pelota' className='size-6 shrink-0' />
                Cargar resultados
              </DialogTitle>
              <DialogDescription>{subtituloModal}</DialogDescription>
            </DialogHeader>

            <div className='mb-3 flex items-center gap-2'>
              <Label
                htmlFor='resultados-verificados'
                className='text-sm font-medium cursor-pointer shrink-0'
              >
                Resultados Verificados
              </Label>
              <Switch
                id='resultados-verificados'
                checked={resultadosVerificados}
                onCheckedChange={setResultadosVerificados}
              />
            </div>

            {partidos.length === 0 ? (
              <p className='text-sm text-muted-foreground py-2'>
                No hay partidos en esta jornada.
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm border-collapse'>
                  <thead>
                    <tr className='border-b text-left text-muted-foreground'>
                      <th className='py-2 pr-3 font-medium'>Categoría</th>
                      <th className='py-2 px-2 font-medium w-26'>Local</th>
                      <th className='py-2 pl-2 font-medium w-26'>Visitante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partidos.map((p, i) => (
                      <tr
                        key={p.id ?? `${p.categoriaId}-${i}`}
                        className='border-b border-border/60 last:border-0'
                      >
                        <td className='py-2 pr-3 align-middle'>
                          {p.categoria ?? '—'}
                        </td>
                        <td className='py-2 px-2 align-middle'>
                          <Input
                            aria-label={`Resultado local, ${p.categoria ?? 'categoría'}`}
                            className='h-9 text-center tabular-nums'
                            value={valores[i]?.local ?? ''}
                            onChange={(e) => setLocal(i, e.target.value)}
                          />
                        </td>
                        <td className='py-2 pl-2 align-middle'>
                          <Input
                            aria-label={`Resultado visitante, ${p.categoria ?? 'categoría'}`}
                            className='h-9 text-center tabular-nums'
                            value={valores[i]?.visitante ?? ''}
                            onChange={(e) => setVisitante(i, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <DialogFooter>
              <Boton
                type='button'
                disabled={!puedeGuardar || guardarMutation.isPending}
                estaCargando={guardarMutation.isPending}
                onClick={() => guardarMutation.mutate()}
              >
                Guardar
              </Boton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
