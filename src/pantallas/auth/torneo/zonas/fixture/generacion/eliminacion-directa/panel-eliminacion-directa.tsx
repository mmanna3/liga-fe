import { Button } from '@/design-system/base-ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { DndContext } from '@dnd-kit/core'
import type { SensorDescriptor } from '@dnd-kit/core'
import { useState } from 'react'
import type { ItemFixture } from '../../tipos'
import { FixtureGeneracionListaEquipos } from '../lista-equipos'
import { FixtureVistaPrevia } from './fixture-vista-previa'
import { FixtureSelectorFecha } from '../selector-fecha'

const CONTEOS_VALIDOS_ELIMINACION_DIRECTA = [2, 4, 8, 16]

export function esConteoValidoEliminacionDirecta(n: number): boolean {
  return CONTEOS_VALIDOS_ELIMINACION_DIRECTA.includes(n)
}

interface PanelEliminacionDirectaProps {
  listaOrdenada: ItemFixture[]
  sensors: SensorDescriptor<object>[]
  handleDragEnd: (event: never) => void
  primeraFecha: Date
  onPrimeraFechaChange: (fecha: Date) => void
}

export function PanelEliminacionDirecta({
  listaOrdenada,
  sensors,
  handleDragEnd,
  primeraFecha,
  onPrimeraFechaChange
}: PanelEliminacionDirectaProps) {
  const cantidadEquipos = listaOrdenada.length
  const esValido = esConteoValidoEliminacionDirecta(cantidadEquipos)

  const [listaFijada, setListaFijada] = useState<ItemFixture[] | null>(null)

  function handleGenerarVistaPreviaClick() {
    setListaFijada(listaOrdenada)
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-6'>
        <FixtureSelectorFecha
          primeraFecha={primeraFecha}
          onFechaChange={onPrimeraFechaChange}
        />
        <Card className='min-w-0 flex flex-col'>
          <CardHeader>
            <CardTitle className='text-base'>
              Generar Fixture Eliminación Directa
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <Button
              disabled={!esValido}
              onClick={handleGenerarVistaPreviaClick}
            >
              Generar vista previa
            </Button>
            {!esValido && (
              <p className='text-sm text-muted-foreground mt-3'>
                La cantidad de equipos tiene que ser 2, 4, 8 o 16
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <FixtureGeneracionListaEquipos listaOrdenada={listaOrdenada} />
      </DndContext>

      {listaFijada != null && (
        <FixtureVistaPrevia lista={listaFijada} primeraFecha={primeraFecha} />
      )}
    </div>
  )
}
