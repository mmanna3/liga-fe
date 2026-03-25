import { FixtureAlgoritmoDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import { esConteoValidoEliminacionDirecta } from './generacion/panel-eliminacion-directa'
import { buildBracket } from './generacion/resultado-eliminacion-directa'
import { seleccionarAlgoritmoPorCantidad } from './generacion/panel-todos-contra-todos'

// ---------------------------------------------------------------------------
// esConteoValidoEliminacionDirecta
// ---------------------------------------------------------------------------

describe('esConteoValidoEliminacionDirecta', () => {
  it.each([2, 4, 8, 16])('devuelve true para %i equipos', (n) => {
    expect(esConteoValidoEliminacionDirecta(n)).toBe(true)
  })

  it.each([0, 1, 3, 5, 6, 7, 9, 10, 12, 15, 17, 32])(
    'devuelve false para %i equipos',
    (n) => {
      expect(esConteoValidoEliminacionDirecta(n)).toBe(false)
    }
  )
})

// ---------------------------------------------------------------------------
// buildBracket (eliminación directa)
// ---------------------------------------------------------------------------

describe('buildBracket', () => {
  it('2 equipos: genera solo la Final con ambos equipos', () => {
    const instancias = buildBracket(['A', 'B'])
    expect(instancias).toHaveLength(1)
    expect(instancias[0].nombre).toBe('Final')
    expect(instancias[0].partidos).toHaveLength(1)
    expect(instancias[0].partidos[0]).toEqual({ local: 'A', visitante: 'B' })
  })

  it('4 equipos: primera ronda es Semifinal con equipos, Final vacía', () => {
    const instancias = buildBracket(['A', 'B', 'C', 'D'])
    expect(instancias).toHaveLength(2)

    const [semis, final] = instancias
    expect(semis.nombre).toBe('Semifinal')
    expect(semis.partidos).toHaveLength(2)
    expect(semis.partidos[0]).toEqual({ local: 'A', visitante: 'B' })
    expect(semis.partidos[1]).toEqual({ local: 'C', visitante: 'D' })

    expect(final.nombre).toBe('Final')
    expect(final.partidos).toHaveLength(1)
    expect(final.partidos[0]).toEqual({ local: null, visitante: null })
  })

  it('8 equipos: tres instancias en orden, solo la primera con equipos', () => {
    const equipos = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']
    const instancias = buildBracket(equipos)
    expect(instancias).toHaveLength(3)

    expect(instancias[0].nombre).toBe('Cuartos de final')
    expect(instancias[0].partidos).toHaveLength(4)
    expect(instancias[0].partidos[0]).toEqual({ local: 'E1', visitante: 'E2' })
    expect(instancias[0].partidos[3]).toEqual({ local: 'E7', visitante: 'E8' })

    expect(instancias[1].nombre).toBe('Semifinal')
    expect(instancias[1].partidos).toHaveLength(2)
    expect(instancias[1].partidos[0]).toEqual({ local: null, visitante: null })

    expect(instancias[2].nombre).toBe('Final')
    expect(instancias[2].partidos).toHaveLength(1)
    expect(instancias[2].partidos[0]).toEqual({ local: null, visitante: null })
  })

  it('16 equipos: cuatro instancias, primera con 8 partidos llenos', () => {
    const equipos = Array.from({ length: 16 }, (_, i) => `E${i + 1}`)
    const instancias = buildBracket(equipos)
    expect(instancias).toHaveLength(4)

    expect(instancias[0].nombre).toBe('Octavos de final')
    expect(instancias[0].partidos).toHaveLength(8)
    expect(instancias[0].partidos[0]).toEqual({ local: 'E1', visitante: 'E2' })
    expect(instancias[0].partidos[7]).toEqual({
      local: 'E15',
      visitante: 'E16'
    })

    expect(instancias[1].nombre).toBe('Cuartos de final')
    expect(instancias[1].partidos).toHaveLength(4)

    expect(instancias[2].nombre).toBe('Semifinal')
    expect(instancias[2].partidos).toHaveLength(2)

    expect(instancias[3].nombre).toBe('Final')
    expect(instancias[3].partidos).toHaveLength(1)

    // All non-first rounds are empty
    for (const inst of instancias.slice(1)) {
      for (const p of inst.partidos) {
        expect(p.local).toBeNull()
        expect(p.visitante).toBeNull()
      }
    }
  })

  it('la cantidad de partidos en rondas posteriores sigue la progresión /2', () => {
    const equipos = Array.from({ length: 16 }, (_, i) => `E${i + 1}`)
    const instancias = buildBracket(equipos)
    const cantidades = instancias.map((i) => i.partidos.length)
    expect(cantidades).toEqual([8, 4, 2, 1])
  })
})

// ---------------------------------------------------------------------------
// seleccionarAlgoritmoPorCantidad (todos contra todos)
// ---------------------------------------------------------------------------

function makeAlgoritmo(
  id: number,
  cantidadDeEquipos: number
): FixtureAlgoritmoDTO {
  return FixtureAlgoritmoDTO.fromJS({
    id,
    cantidadDeEquipos,
    nombre: `Algo ${id}`,
    fechas: []
  })
}

describe('seleccionarAlgoritmoPorCantidad', () => {
  it('devuelve undefined si no hay algoritmos para esa cantidad', () => {
    const algoritmos = [makeAlgoritmo(1, 4)]
    expect(
      seleccionarAlgoritmoPorCantidad(algoritmos, 6, undefined)
    ).toBeUndefined()
  })

  it('devuelve el primero de la lista cuando no había selección previa', () => {
    const algoritmos = [makeAlgoritmo(1, 6), makeAlgoritmo(2, 6)]
    const result = seleccionarAlgoritmoPorCantidad(algoritmos, 6, undefined)
    expect(result?.id).toBe(1)
  })

  it('mantiene el algoritmo seleccionado si sigue siendo válido para la nueva cantidad', () => {
    const algoritmos = [makeAlgoritmo(1, 6), makeAlgoritmo(2, 6)]
    const prevSeleccionado = makeAlgoritmo(2, 6)
    const result = seleccionarAlgoritmoPorCantidad(
      algoritmos,
      6,
      prevSeleccionado
    )
    expect(result?.id).toBe(2)
  })

  it('cambia al primero válido si el algoritmo previo no aplica a la nueva cantidad', () => {
    const algoritmos = [makeAlgoritmo(1, 8), makeAlgoritmo(2, 8)]
    const prevSeleccionado = makeAlgoritmo(3, 6)
    const result = seleccionarAlgoritmoPorCantidad(
      algoritmos,
      8,
      prevSeleccionado
    )
    expect(result?.id).toBe(1)
  })

  it('devuelve undefined si la lista de algoritmos está vacía', () => {
    expect(seleccionarAlgoritmoPorCantidad([], 6, undefined)).toBeUndefined()
  })

  it('devuelve undefined si ningún algoritmo coincide con la cantidad', () => {
    const algoritmos = [makeAlgoritmo(1, 4), makeAlgoritmo(2, 8)]
    expect(
      seleccionarAlgoritmoPorCantidad(algoritmos, 6, undefined)
    ).toBeUndefined()
  })

  it('usa fixtureAlgoritmoId como fallback cuando id es undefined', () => {
    const a = FixtureAlgoritmoDTO.fromJS({
      fixtureAlgoritmoId: 99,
      cantidadDeEquipos: 4,
      nombre: 'Sin id',
      fechas: []
    })
    const prev = FixtureAlgoritmoDTO.fromJS({
      fixtureAlgoritmoId: 99,
      cantidadDeEquipos: 4,
      nombre: 'Sin id',
      fechas: []
    })
    const result = seleccionarAlgoritmoPorCantidad([a], 4, prev)
    expect(result?.fixtureAlgoritmoId).toBe(99)
  })
})
