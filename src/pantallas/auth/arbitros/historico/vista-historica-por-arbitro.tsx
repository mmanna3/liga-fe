import type { ArbitroConJornadasHistoricasDTO } from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Input } from '@/design-system/ykn-ui/input'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  coincideBusquedaArbitro,
  formatearDiaCorto,
  nombreCompletoArbitro
} from '../asignacion/utilidades-asignacion'
import DetalleWhatsappHistorico from './detalle-whatsapp-historico'

interface VistaHistoricaPorArbitroProps {
  arbitros: ArbitroConJornadasHistoricasDTO[]
}

export default function VistaHistoricaPorArbitro({
  arbitros
}: VistaHistoricaPorArbitroProps) {
  const [busqueda, setBusqueda] = useState('')

  const arbitrosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return arbitros
    return arbitros.filter((a) =>
      coincideBusquedaArbitro(a.nombre, a.apellido, busqueda)
    )
  }, [arbitros, busqueda])

  if (arbitros.length === 0) {
    return (
      <p
        className='py-8 text-center text-muted-foreground'
        data-testid='historico-vacio-por-arbitro'
      >
        No hay asignaciones históricas para este agrupador y año.
      </p>
    )
  }

  return (
    <div className='space-y-4' data-testid='historico-por-arbitro'>
      <div className='relative'>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder='Buscar por nombre o apellido…'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {arbitrosFiltrados.length === 0 ? (
        <p className='py-8 text-center text-muted-foreground'>
          No hay árbitros que coincidan con la búsqueda.
        </p>
      ) : (
        <div className='grid gap-4 md:grid-cols-2'>
          {arbitrosFiltrados.map((arbitro) => {
            const jornadas = arbitro.jornadasHistoricas ?? []
            return (
              <Card
                key={arbitro.arbitroId}
                data-testid={`arbitro-historico-${arbitro.arbitroId}`}
              >
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg'>
                    {nombreCompletoArbitro(arbitro.nombre, arbitro.apellido)}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    {jornadas.length}{' '}
                    {jornadas.length === 1 ? 'jornada' : 'jornadas'} históricas
                  </p>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {jornadas.map((jornada) => (
                    <div
                      key={`${jornada.jornadaId}-${jornada.orden}`}
                      className='space-y-2 rounded-lg border border-border p-3'
                    >
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='text-sm font-medium'>
                          {jornada.diaSemana} {formatearDiaCorto(jornada.dia)} ·
                          Árbitro {jornada.orden}
                        </p>
                        {jornada.whatsapp?.enviado && (
                          <Badge
                            variant='secondary'
                            className='border-emerald-600 bg-emerald-100 text-emerald-900'
                          >
                            WhatsApp
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm'>
                        <span className='font-semibold'>{jornada.local}</span>
                        {' vs '}
                        <span className='font-semibold'>
                          {jornada.visitante}
                        </span>
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {jornada.torneoNombre} · {jornada.faseNombre} ·{' '}
                        {jornada.zonaNombre}
                      </p>
                      <DetalleWhatsappHistorico whatsapp={jornada.whatsapp} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
