import { api } from '@/api/api'
import type { TorneoDTO, TorneoFaseDTO } from '@/api/clients'
import { Card, CardContent } from '@/design-system/base-ui/card'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

interface TorneoCardProps {
  torneo: TorneoDTO
}

function FaseItem({ fase }: { fase: TorneoFaseDTO }) {
  const titulo = `${fase.nombre ?? ''}`.trim()
  const subtitulo = [
    fase.faseFormatoNombre ?? '',
    fase.esExcluyente ? 'Es exclusiva' : 'No es exclusiva'
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className='flex gap-3 rounded-md border border-border bg-muted/30 px-3 py-2'>
      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary'>
        {fase.numero}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium text-sm'>{titulo}</p>
        <p className='text-muted-foreground text-xs'>{subtitulo}</p>
      </div>
    </li>
  )
}

export default function TorneoCard({ torneo }: TorneoCardProps) {
  const navigate = useNavigate()

  const { data: fases } = useQuery({
    queryKey: ['torneo', torneo.id, 'fases'],
    queryFn: () => api.fasesAll(torneo.id!),
    enabled: !!torneo.id
  })

  const agrupador = torneo.torneoAgrupadorNombre ?? 'Sin agrupador'
  const subtitulo = `${agrupador} - ${torneo.anio}`

  return (
    <Card
      className='cursor-pointer transition-shadow hover:shadow-md'
      onClick={() => navigate(`${rutasNavegacion.detalleTorneo}/${torneo.id}`)}
    >
      <CardContent className='flex flex-col gap-3 pt-4'>
        <div>
          <h3 className='flex items-center gap-2 font-semibold text-lg leading-tight'>
            <Icono nombre='Torneos' className='h-5 w-5 shrink-0 text-primary' />
            {torneo.nombre}
          </h3>
          <p className='text-muted-foreground my-2 text-sm'>{subtitulo}</p>
        </div>
        {fases && fases.length > 0 && (
          <ul className='flex flex-col gap-1.5'>
            {fases.map((fase) => (
              <FaseItem key={fase.id} fase={fase} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
