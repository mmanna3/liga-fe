import { Badge } from '@/components/ui/badge'
import { EstadoJugador } from '@/lib/utils'

const estadoConfig = {
  [EstadoJugador.FichajePendienteDeAprobacion]: {
    texto: 'Pendiente de aprobación',
    color: 'bg-blue-600 text-slate-200'
  },
  [EstadoJugador.FichajeRechazado]: {
    texto: 'Fichaje rechazado',
    color: 'bg-red-600 text-slate-200'
  },
  [EstadoJugador.Activo]: {
    texto: 'Activo',
    color: 'bg-green-600 text-slate-200'
  },
  [EstadoJugador.Suspendido]: {
    texto: 'Suspendido',
    color: 'bg-orange-600 text-slate-200'
  },
  [EstadoJugador.Inhabilitado]: {
    texto: 'Inhabilitado',
    color: 'bg-gray-600 text-slate-200'
  }
}

export default function JugadorEquipoEstadoBadge({
  estado
}: {
  estado: EstadoJugador
}) {
  const config = estadoConfig[estado] || {
    texto: 'Desconocido',
    color: 'bg-gray-300 text-black'
  }

  return (
    <Badge className={`${config.color} px-3 py-1 rounded-md`}>
      {config.texto}
    </Badge>
  )
}
