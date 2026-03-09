import type { EquipoWizard } from '../tipos'

interface EquiposSinAsignarProps {
  equipos: EquipoWizard[]
  idZonaSinAsignar: string
  onIniciarArrastre: (equipo: EquipoWizard, zonaId: string) => void
}

export function EquiposSinAsignar({
  equipos,
  idZonaSinAsignar,
  onIniciarArrastre
}: EquiposSinAsignarProps) {
  return (
    <div className='mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200'>
      <h4 className='font-bold mb-3'>Equipos sin asignar</h4>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {equipos.map((equipo) => (
          <div
            key={equipo.id}
            draggable
            onDragStart={() => onIniciarArrastre(equipo, idZonaSinAsignar)}
            className='bg-background p-2 rounded-lg shadow-sm border text-sm cursor-move hover:shadow-md hover:border-primary/30 transition-all'
          >
            <div className='font-medium'>{equipo.nombre}</div>
            <div className='text-xs text-muted-foreground'>{equipo.club}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
