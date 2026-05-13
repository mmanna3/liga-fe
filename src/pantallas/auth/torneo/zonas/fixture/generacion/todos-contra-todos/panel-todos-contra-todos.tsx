import type { FixtureAlgoritmoDTO } from '@/api/clients'
import { reconciliarListaFijadaConBase } from '@/pantallas/auth/torneo/zonas/fixture/borrador/fixture-borrador-logica'
import { useFixtureBorradorStore } from '@/pantallas/auth/torneo/zonas/fixture/borrador/use-fixture-borrador-store'
import { DndContext } from '@dnd-kit/core'
import type { SensorDescriptor } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { ResultadoFixture } from './fixture-vista-previa'
import type { ItemFixture } from '../../tipos'
import { FixtureAlgoritmosDisponiblesParaGenerar } from './algoritmos'
import { FixtureGeneracionListaEquipos } from '../lista-equipos'
import { FixtureSelectorFecha } from '../selector-fecha'

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

function idAlgoritmo(a: FixtureAlgoritmoDTO | undefined): string | null {
  if (a == null) return null
  const raw = a.id ?? a.fixtureAlgoritmoId
  return raw != null ? String(raw) : null
}

interface PanelTodosContraTodosProps {
  algoritmos: FixtureAlgoritmoDTO[]
  listaOrdenada: ItemFixture[]
  sensors: SensorDescriptor<object>[]
  handleDragEnd: (event: never) => void
  zonaId: number
  primeraFecha: Date
  onPrimeraFechaChange: (fecha: Date) => void
  hashEquipos: string
}

export function PanelTodosContraTodos({
  algoritmos,
  listaOrdenada,
  sensors,
  handleDragEnd,
  zonaId,
  primeraFecha,
  onPrimeraFechaChange,
  hashEquipos
}: PanelTodosContraTodosProps) {
  const cantidadEquipos = listaOrdenada.length

  const [algoritmoSeleccionado, setAlgoritmoSeleccionado] = useState<
    FixtureAlgoritmoDTO | undefined
  >(undefined)

  const [listaFijada, setListaFijada] = useState<ItemFixture[] | null>(() => {
    const b = useFixtureBorradorStore.getState().porZona[zonaId]
    if (b?.hashEquipos !== hashEquipos || !b.listaFijada) return null
    return reconciliarListaFijadaConBase(b.listaFijada, listaOrdenada)
  })

  useEffect(() => {
    setListaFijada((prev) =>
      prev == null ? null : reconciliarListaFijadaConBase(prev, listaOrdenada)
    )
  }, [listaOrdenada])

  useEffect(() => {
    if (algoritmos.length === 0) return

    let candidato = algoritmoSeleccionado
    if (candidato == null) {
      const b = useFixtureBorradorStore.getState().porZona[zonaId]
      if (b?.hashEquipos === hashEquipos && b.algoritmoIdSeleccionado) {
        candidato = algoritmos.find(
          (a) =>
            String(a.id ?? a.fixtureAlgoritmoId) === b.algoritmoIdSeleccionado
        )
      }
    }

    const siguiente = seleccionarAlgoritmoPorCantidad(
      algoritmos,
      cantidadEquipos,
      candidato
    )

    if (siguiente === undefined) {
      setListaFijada(null)
    }
    setAlgoritmoSeleccionado(siguiente)
  }, [algoritmos, cantidadEquipos, zonaId, hashEquipos, algoritmoSeleccionado])

  useEffect(() => {
    useFixtureBorradorStore.getState().patch(zonaId, hashEquipos, {
      algoritmoIdSeleccionado: idAlgoritmo(algoritmoSeleccionado),
      listaFijada
    })
  }, [zonaId, hashEquipos, algoritmoSeleccionado, listaFijada])

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
