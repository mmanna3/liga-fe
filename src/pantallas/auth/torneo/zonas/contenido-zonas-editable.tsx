import { EquipoDTO } from '@/api/clients'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Plus } from 'lucide-react'
import type { ZonaEstado } from './tipos-zona'
import { Zona } from './zona-fase'

interface ContenidoZonasEditableProps {
  zonasEstado: ZonaEstado[]
  onActualizarNombre: (index: number, nombre: string) => void
  onQuitarEquipo: (index: number, equipoId: number) => void
  onDropEquipo: (index: number, equipo: EquipoDTO) => void
  onEliminarZona: (index: number) => void
  onAgregarZona: () => void
}

/** Contenido compartido: grid de zonas editables + buscador. Usado en CrearZonas y ModificarZonas. */
export function ContenidoZonasEditable({
  zonasEstado,
  onActualizarNombre,
  onQuitarEquipo,
  onDropEquipo,
  onEliminarZona,
  onAgregarZona
}: ContenidoZonasEditableProps) {
  return (
    <div className='space-y-6'>
      <Boton
        type='button'
        variant='outline'
        size='sm'
        onClick={onAgregarZona}
        className='py-1 text-xs'
      >
        Agregar Zona
        <Plus className='w-3 h-3' />
      </Boton>

      <div className='flex flex-wrap gap-4 items-start'>
        {zonasEstado.map((zona, index) => (
          <div key={zona.id ?? index} className='min-w-[280px] flex-1'>
            <Zona
              zona={zona}
              onNombreChange={(n) => onActualizarNombre(index, n)}
              onQuitarEquipo={(eqId) => onQuitarEquipo(index, eqId)}
              onDropEquipo={(eq) => onDropEquipo(index, eq)}
              onEliminar={() => onEliminarZona(index)}
              editable
            />
          </div>
        ))}
      </div>
    </div>
  )
}
