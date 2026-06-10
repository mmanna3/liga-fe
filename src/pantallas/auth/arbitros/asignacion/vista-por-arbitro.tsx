import type { ArbitroConJornadasAsignacionDTO } from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import { Checkbox } from '@/design-system/base-ui/checkbox'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Label } from '@/design-system/base-ui/label'
import { Input } from '@/design-system/ykn-ui/input'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  coincideBusquedaArbitro,
  formatearDiaCorto,
  nombreCompletoArbitro
} from './utilidades-asignacion'

interface VistaPorArbitroProps {
  arbitros: ArbitroConJornadasAsignacionDTO[]
}

export default function VistaPorArbitro({ arbitros }: VistaPorArbitroProps) {
  const [soloSinProximaJornada, setSoloSinProximaJornada] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const arbitrosFiltrados = useMemo(() => {
    let lista = arbitros
    if (soloSinProximaJornada) {
      lista = lista.filter((a) => (a.jornadasProximaFecha ?? []).length === 0)
    }
    if (busqueda.trim()) {
      lista = lista.filter((a) =>
        coincideBusquedaArbitro(a.nombre, a.apellido, busqueda)
      )
    }
    return lista
  }, [arbitros, soloSinProximaJornada, busqueda])

  const hayFiltrosActivos = soloSinProximaJornada || busqueda.trim().length > 0

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder='Buscar por nombre o apellido…'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className='flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3'>
        <Checkbox
          id='filtro-sin-jornada'
          checked={soloSinProximaJornada}
          onCheckedChange={(checked) =>
            setSoloSinProximaJornada(checked === true)
          }
        />
        <Label htmlFor='filtro-sin-jornada' className='cursor-pointer'>
          Solo árbitros sin próxima jornada asignada
        </Label>
      </div>

      {arbitrosFiltrados.length === 0 ? (
        <p className='py-8 text-center text-muted-foreground'>
          {arbitros.length === 0
            ? 'No hay árbitros habilitados para este agrupador.'
            : hayFiltrosActivos
              ? 'No hay árbitros que coincidan con la búsqueda o los filtros.'
              : 'No hay árbitros habilitados para este agrupador.'}
        </p>
      ) : (
        <div className='grid gap-4 md:grid-cols-2'>
          {arbitrosFiltrados.map((arbitro) => {
            const jornadas = arbitro.jornadasProximaFecha ?? []
            const sinAsignacion = jornadas.length === 0

            return (
              <Card key={arbitro.arbitroId} className='shadow-sm'>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center justify-between gap-2 text-base'>
                    <span>
                      {nombreCompletoArbitro(arbitro.nombre, arbitro.apellido)}
                    </span>
                    {sinAsignacion ? (
                      <Badge variant='outline' className='font-normal'>
                        Sin asignación
                      </Badge>
                    ) : (
                      <Badge variant='secondary'>
                        {jornadas.length}{' '}
                        {jornadas.length === 1 ? 'jornada' : 'jornadas'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sinAsignacion ? (
                    <p className='text-sm text-muted-foreground'>
                      No tiene jornadas asignadas en la próxima fecha.
                    </p>
                  ) : (
                    <ul className='space-y-3'>
                      {jornadas.map((j) => (
                        <li
                          key={`${j.jornadaId}-${j.orden}`}
                          className='rounded-md border border-border bg-muted/20 px-3 py-2 text-sm'
                        >
                          <p className='font-medium'>
                            {j.diaSemana}{' '}
                            {j.dia ? formatearDiaCorto(j.dia) : ''}
                            {j.fechaNumero != null &&
                              ` · Fecha ${j.fechaNumero}`}
                            {j.instanciaNombre && ` · ${j.instanciaNombre}`}
                          </p>
                          <p className='text-muted-foreground'>
                            {j.torneoNombre} · {j.faseNombre} · {j.zonaNombre}
                          </p>
                          <p>
                            {j.local} vs {j.visitante}
                            {j.localidadLocal && ` · ${j.localidadLocal}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
