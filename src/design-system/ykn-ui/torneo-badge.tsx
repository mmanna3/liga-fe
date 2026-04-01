import { ZonaResumenDTO } from '@/api/clients'

interface TorneoBadgeProps {
  zonas?: ZonaResumenDTO[]
}

export default function TorneoBadge({ zonas }: TorneoBadgeProps) {
  const texto = zonas?.length
    ? [...new Set(zonas.map((z) => z.torneo).filter(Boolean))].join(', ')
    : null

  if (texto) {
    return (
      <span className='text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full'>
        {texto}
      </span>
    )
  }
  return (
    <span className='text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full'>
      Sin torneo
    </span>
  )
}
