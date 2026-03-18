import type {
  EquipoDeLaZonaDTO,
  JornadaDTO,
  TorneoFechaDTO
} from '@/api/clients'

const claseEspecial = (label: string) => {
  if (label === 'Interzonal') return 'text-blue-700 bg-blue-100 px-1 rounded'
  if (label === 'Libre') return 'text-yellow-700 bg-yellow-100 px-1 rounded'
  return ''
}

type ColumnaJornada = { label: string; numero?: number }

function resolverColumnas(j: JornadaDTO): {
  local: ColumnaJornada
  visitante: ColumnaJornada
} {
  if (j.tipo === 'Normal') {
    return {
      local: { label: j.local! },
      visitante: { label: j.visitante! }
    }
  }
  if (j.tipo === 'Libre') {
    return {
      local: { label: j.equipo! },
      visitante: { label: 'Libre' }
    }
  }
  // Interzonal: localOVisitanteId = 1 → equipo es local, 2 → equipo es visitante
  if (j.localOVisitante === 2) {
    return {
      local: { label: 'Interzonal' },
      visitante: { label: j.equipo! }
    }
  }
  return {
    local: { label: j.equipo! },
    visitante: { label: 'Interzonal' }
  }
}

export function FechasZona({
  fechas
}: {
  fechas: TorneoFechaDTO[]
  equipos: EquipoDeLaZonaDTO[]
}) {
  const fechasOrdenadas = [...fechas].sort((a, b) => a.numero - b.numero)

  return (
    <div className='grid grid-cols-3 gap-4 py-4'>
      {fechasOrdenadas.map((f) => (
        <div key={f.id ?? f.numero} className='rounded-lg border bg-card p-4'>
          <h3 className='font-semibold mb-3 text-center'>Fecha {f.numero}</h3>

          <div className='grid grid-cols-[1fr_1fr] gap-4 text-xs font-medium text-muted-foreground mb-1'>
            <span className='text-right'>LOCAL</span>
            <span className='text-left'>VISITANTE</span>
          </div>

          <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
            {(f.jornadas ?? []).map((j, i) => {
              const { local, visitante } = resolverColumnas(j)
              return (
                <div
                  key={i}
                  className='grid grid-cols-[1fr_1fr] gap-4 text-sm py-1'
                >
                  <span className={`text-right ${claseEspecial(local.label)}`}>
                    {local.label}
                  </span>
                  <span
                    className={`text-left ${claseEspecial(visitante.label)}`}
                  >
                    {visitante.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
