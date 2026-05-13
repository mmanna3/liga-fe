import type { EquipoDeLaZonaDTO } from '@/api/clients'
import type { ItemFixture } from '../tipos'
import { describe, expect, it, beforeEach } from 'vitest'
import {
  obtenerPrimeraFechaDesdeBorrador,
  useFixtureBorradorStore,
  type FixtureBorradorPorZona
} from './use-fixture-borrador-store'

function itemEquipo(id: string, nombre: string): ItemFixture {
  return {
    type: 'equipo',
    equipo: { id, nombre, club: 'X' } as EquipoDeLaZonaDTO
  }
}

beforeEach(() => {
  useFixtureBorradorStore.getState().resetParaTests()
})

describe('useFixtureBorradorStore', () => {
  it('patch crea un borrador con merge de campos', () => {
    const h = 'a|b'
    useFixtureBorradorStore.getState().patch(7, h, {
      listaOrdenada: [itemEquipo('a', 'A')],
      primeraFechaIso: '2026-01-15',
      algoritmoIdSeleccionado: '42',
      listaFijada: [itemEquipo('a', 'A')]
    })
    const b = useFixtureBorradorStore.getState().porZona[7] as
      | FixtureBorradorPorZona
      | undefined
    expect(b).toBeDefined()
    expect(b!.hashEquipos).toBe(h)
    expect(b!.listaOrdenada).toHaveLength(1)
    expect(b!.primeraFechaIso).toBe('2026-01-15')
    expect(b!.algoritmoIdSeleccionado).toBe('42')
    expect(b!.listaFijada).toHaveLength(1)
  })

  it('patch con el mismo hash conserva campos no enviados en el partial', () => {
    useFixtureBorradorStore.getState().patch(1, 'x', {
      listaOrdenada: [itemEquipo('x', 'X')],
      primeraFechaIso: '2026-02-01',
      algoritmoIdSeleccionado: '9',
      listaFijada: null
    })
    useFixtureBorradorStore
      .getState()
      .patch(1, 'x', { primeraFechaIso: '2026-03-01' })
    const b = useFixtureBorradorStore.getState().porZona[1]!
    expect(b.listaOrdenada).toHaveLength(1)
    expect(b.primeraFechaIso).toBe('2026-03-01')
    expect(b.algoritmoIdSeleccionado).toBe('9')
  })

  it('patch con hash distinto reinicia desde borrador vacío y aplica el partial', () => {
    useFixtureBorradorStore.getState().patch(2, 'old', {
      listaOrdenada: [itemEquipo('1', 'A')],
      primeraFechaIso: '2026-01-01',
      algoritmoIdSeleccionado: '1',
      listaFijada: [itemEquipo('1', 'A')]
    })
    useFixtureBorradorStore.getState().patch(2, 'new-hash', {
      listaOrdenada: [itemEquipo('2', 'B')]
    })
    const b = useFixtureBorradorStore.getState().porZona[2]!
    expect(b.hashEquipos).toBe('new-hash')
    expect(b.listaOrdenada).toHaveLength(1)
    if (b.listaOrdenada[0]?.type === 'equipo') {
      expect(b.listaOrdenada[0].equipo.id).toBe('2')
    }
    expect(b.algoritmoIdSeleccionado).toBeNull()
    expect(b.listaFijada).toBeNull()
  })

  it('limpiarBorrador elimina la entrada de la zona', () => {
    useFixtureBorradorStore.getState().patch(3, 'a', {
      listaOrdenada: [itemEquipo('a', 'A')]
    })
    expect(useFixtureBorradorStore.getState().porZona[3]).toBeDefined()
    useFixtureBorradorStore.getState().limpiarBorrador(3)
    expect(useFixtureBorradorStore.getState().porZona[3]).toBeUndefined()
  })

  it('resetParaTests deja el mapa vacío', () => {
    useFixtureBorradorStore.getState().patch(99, 'z', {
      listaOrdenada: [itemEquipo('z', 'Z')]
    })
    expect(Object.keys(useFixtureBorradorStore.getState().porZona).length).toBe(
      1
    )
    useFixtureBorradorStore.getState().resetParaTests()
    expect(useFixtureBorradorStore.getState().porZona).toEqual({})
  })
})

describe('obtenerPrimeraFechaDesdeBorrador', () => {
  it('lee fecha cuando el hash coincide', () => {
    useFixtureBorradorStore.getState().patch(5, 'e1|e2', {
      listaOrdenada: [],
      primeraFechaIso: '2026-07-20',
      algoritmoIdSeleccionado: null,
      listaFijada: null
    })
    const d = obtenerPrimeraFechaDesdeBorrador(5, 'e1|e2')
    expect(d).not.toBeNull()
    expect(d!.getUTCFullYear()).toBe(2026)
    expect(d!.getUTCMonth()).toBe(6)
    expect(d!.getUTCDate()).toBe(20)
  })

  it('devuelve null si el hash no coincide', () => {
    useFixtureBorradorStore.getState().patch(5, 'a', {
      listaOrdenada: [],
      primeraFechaIso: '2026-07-20',
      algoritmoIdSeleccionado: null,
      listaFijada: null
    })
    expect(obtenerPrimeraFechaDesdeBorrador(5, 'b')).toBeNull()
  })
})
