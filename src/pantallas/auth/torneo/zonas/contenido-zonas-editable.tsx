import { EquipoDTO } from '@/api/clients'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Plus } from 'lucide-react'
import { BuscadorDeEquiposParaZona } from './buscador-de-equipos-para-zona'
import { DetalleZonasDeLaFase } from './detalle-zonas-de-la-fase'
import type { ZonaEstado } from './tipos-zona'

interface ContenidoZonasEditableProps {
  zonasEstado: ZonaEstado[]
  equiposEnZonas: EquipoDTO[]
  onActualizarNombre: (index: number, nombre: string) => void
  onQuitarEquipo: (index: number, equipoId: number) => void
  onDropEquipo: (index: number, equipo: EquipoDTO) => void
  onAgregarZona: () => void
}

/** Contenido compartido: grid de zonas editables + buscador. Usado en CrearZonas y ModificarZonas. */
export function ContenidoZonasEditable({
  zonasEstado,
  equiposEnZonas,
  onActualizarNombre,
  onQuitarEquipo,
  onDropEquipo,
  onAgregarZona
}: ContenidoZonasEditableProps) {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-4 items-start'>
        {zonasEstado.map((zona, index) => (
          <div key={zona.id ?? index} className='min-w-[280px] flex-1'>
            <DetalleZonasDeLaFase
              zona={zona}
              onNombreChange={(n) => onActualizarNombre(index, n)}
              onQuitarEquipo={(eqId) => onQuitarEquipo(index, eqId)}
              onDropEquipo={(eq) => onDropEquipo(index, eq)}
              editable
            />
          </div>
        ))}
        <div className='min-w-[280px] flex-1 flex items-center'>
          <Boton
            type='button'
            variant='outline'
            size='sm'
            onClick={onAgregarZona}
            className='w-full py-6'
          >
            <Plus className='w-4 h-4 mr-2' />
            Agregar Zona
          </Boton>
        </div>
      </div>

      <div className='pt-6 border-t'>
        <BuscadorDeEquiposParaZona equiposEnZonas={equiposEnZonas} />
      </div>
    </div>
  )
}
