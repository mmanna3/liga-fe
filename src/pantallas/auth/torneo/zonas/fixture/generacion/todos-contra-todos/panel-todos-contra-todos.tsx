import type { FixtureAlgoritmoDTO } from '@/api/clients'
import { DndContext } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { ResultadoFixture } from './fixture-vista-previa'
import type { ItemFixture } from '../../tipos'
import { FixtureAlgoritmosDisponiblesParaGenerar } from './algoritmos'
import { FixtureGeneracionListaEquipos } from '../lista-equipos'
import { FixtureSelectorFecha } from '../selector-fecha'
import type { SensorDescriptor } from '@dnd-kit/core'

export function seleccionarAlgoritmoPorCantidad(
  algoritmos: FixtureAlgoritmoDTO[],
  cantidadEquipos: number,
  prevSeleccionado: FixtureAlgoritmoDTO | undefined
): FixtureAlgoritmoDTO | undefined {
  const match = algoritmos.filter(
    (a) => a.cantidadDeEquipos === cantidadEquipos
  )
  if (match.length === 0) return undefined
  const stillValid =
    prevSeleccionado != null &&
    match.some(
      (a) =>
        (a.id ?? a.fixtureAlgoritmoId) ===
        (prevSeleccionado.id ?? prevSeleccionado.fixtureAlgoritmoId)
    )
  return stillValid ? prevSeleccionado : match[0]
}

interface PanelTodosContraTodosProps {
  algoritmos: FixtureAlgoritmoDTO[]
  listaOrdenada: ItemFixture[]
  sensors: SensorDescriptor<object>[]
  handleDragEnd: (event: never) => void
  zonaId: number
  primeraFecha: Date
  onPrimeraFechaChange: (fecha: Date) => void
}

export function PanelTodosContraTodos({
  algoritmos,
  listaOrdenada,
  sensors,
  handleDragEnd,
  zonaId,
  primeraFecha,
  onPrimeraFechaChange
}: PanelTodosContraTodosProps) {
  const cantidadEquipos = listaOrdenada.length

  const [algoritmoSeleccionado, setAlgoritmoSeleccionado] = useState<
    FixtureAlgoritmoDTO | undefined
  >(undefined)
  const [listaFijada, setListaFijada] = useState<ItemFixture[] | null>(null)

  useEffect(() => {
    const siguiente = seleccionarAlgoritmoPorCantidad(
      algoritmos,
      cantidadEquipos,
      algoritmoSeleccionado
    )
    if (siguiente === undefined) {
      setListaFijada(null)
    }
    setAlgoritmoSeleccionado(siguiente)
  }, [algoritmos, cantidadEquipos])

  function handleGenerarFixture() {
    setListaFijada(listaOrdenada)
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-6'>
        <FixtureSelectorFecha
          primeraFecha={primeraFecha}
          onFechaChange={onPrimeraFechaChange}
        />
        <FixtureAlgoritmosDisponiblesParaGenerar
          algoritmos={algoritmos}
          cantidadEquipos={cantidadEquipos}
          algoritmoSeleccionado={algoritmoSeleccionado}
          onAlgoritmoSeleccionadoChange={(algo) => {
            setAlgoritmoSeleccionado(algo)
            if ((algo?.fechas?.length ?? 0) === 0) setListaFijada(null)
          }}
          onGenerarFixture={handleGenerarFixture}
        />
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <FixtureGeneracionListaEquipos listaOrdenada={listaOrdenada} />
      </DndContext>

      {listaFijada != null &&
        algoritmoSeleccionado?.fechas != null &&
        algoritmoSeleccionado.fechas.length > 0 && (
          <ResultadoFixture
            fechas={algoritmoSeleccionado.fechas}
            lista={listaFijada}
            zonaId={zonaId}
            primeraFecha={primeraFecha}
          />
        )}
    </div>
  )
}
