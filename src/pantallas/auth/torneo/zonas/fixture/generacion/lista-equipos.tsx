import { Card, CardContent } from '@/design-system/base-ui/card'
import { FilaLista, SlotDroppable } from './fila-lista-equipos'
import { EspecialDraggable, ZonaDerechaDroppable } from '../panel-especiales'
import type { ItemFixture } from '../tipos'

interface FixtureGeneracionListaEquiposProps {
  listaOrdenada: ItemFixture[]
}

export function FixtureGeneracionListaEquipos({
  listaOrdenada
}: FixtureGeneracionListaEquiposProps) {
  return (
    <Card>
      <CardContent>
        <div className='flex gap-8'>
          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-medium text-muted-foreground mb-2'>
              Orden de equipos (arrastrá para reordenar)
            </h3>
            <ul className='space-y-2 list-none p-0 m-0'>
              {listaOrdenada.map((item, index) => (
                <SlotDroppable key={`slot-${index}`} index={index}>
                  <FilaLista item={item} index={index} />
                </SlotDroppable>
              ))}
              <SlotDroppable index={listaOrdenada.length}>
                <div className='rounded-md border-2 border-dashed border-muted-foreground/25 px-3 py-2 min-h-[44px]' />
              </SlotDroppable>
            </ul>
          </div>

          <div className='w-48 shrink-0'>
            <h3 className='text-sm font-medium text-muted-foreground mb-2'>
              Agregar a la lista
            </h3>
            <ZonaDerechaDroppable>
              <div className='space-y-2'>
                <EspecialDraggable valor='INTERZONAL' />
                <EspecialDraggable valor='LIBRE' />
              </div>
              <p className='text-xs text-muted-foreground pt-2'>
                Arrastrá Libre o Interzonal a la lista para sumarlos. Arrastrá
                desde la lista acá para quitarlos.
              </p>
            </ZonaDerechaDroppable>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
