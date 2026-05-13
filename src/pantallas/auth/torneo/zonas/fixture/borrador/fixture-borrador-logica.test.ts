import type { EquipoDeLaZonaDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import {
  hashEquiposDeLaZona,
  listaInicialDesdeBorradorOEquipos,
  ordenInicialListaFixture,
  primeraFechaIsoDesdeDate,
  reconciliarListaFijadaConBase,
  reconciliarListaOrdenConEquiposActuales
} from './fixture-borrador-logica'
import type { ItemFixture } from '../tipos'

function eq(id: string, nombre: string): EquipoDeLaZonaDTO {
  return { id, nombre, club: 'C' } as EquipoDeLaZonaDTO
}

describe('hashEquiposDeLaZona', () => {
  it('es independiente del orden de entrada', () => {
    const a = [eq('b', 'B'), eq('a', 'A')]
    const b = [eq('a', 'A'), eq('b', 'B')]
    expect(hashEquiposDeLaZona(a)).toBe(hashEquiposDeLaZona(b))
    expect(hashEquiposDeLaZona(a)).toBe('a|b')
  })

  it('ignora equipos sin id', () => {
    const sinId = { nombre: 'X' } as EquipoDeLaZonaDTO
    expect(hashEquiposDeLaZona([sinId, eq('z', 'Z')])).toBe('z')
  })
})

describe('ordenInicialListaFixture', () => {
  it('ordena alfabéticamente por nombre', () => {
    const items = ordenInicialListaFixture([eq('1', 'zebra'), eq('2', 'alfa')])
    expect(
      items.map((i) => (i.type === 'equipo' ? i.equipo.nombre : ''))
    ).toEqual(['alfa', 'zebra'])
  })
})

describe('reconciliarListaOrdenConEquiposActuales', () => {
  it('preserva especiales y reemplaza equipos por datos frescos', () => {
    const viejos = [eq('1', 'Viejo'), eq('2', 'Otro')]
    const frescos = [eq('1', 'Nuevo nombre'), eq('2', 'Otro')]
    const persistida: ItemFixture[] = [
      { type: 'equipo', equipo: viejos[0]! },
      { type: 'especial', valor: 'LIBRE' },
      { type: 'equipo', equipo: viejos[1]! }
    ]
    const out = reconciliarListaOrdenConEquiposActuales(persistida, frescos)
    expect(out[0]?.type).toBe('equipo')
    if (out[0]?.type === 'equipo')
      expect(out[0].equipo.nombre).toBe('Nuevo nombre')
    expect(out[1]).toEqual({ type: 'especial', valor: 'LIBRE' })
    expect(out[2]?.type).toBe('equipo')
    if (out[2]?.type === 'equipo') expect(out[2].equipo.nombre).toBe('Otro')
  })

  it('añade al final equipos nuevos presentes en la API', () => {
    const persistida: ItemFixture[] = [{ type: 'equipo', equipo: eq('1', 'A') }]
    const frescos = [eq('1', 'A'), eq('2', 'B')]
    const out = reconciliarListaOrdenConEquiposActuales(persistida, frescos)
    expect(out).toHaveLength(2)
    if (out[1]?.type === 'equipo') expect(out[1].equipo.id).toBe('2')
  })
})

describe('reconciliarListaFijadaConBase', () => {
  it('actualiza referencias de equipo desde la lista base', () => {
    const base: ItemFixture[] = [
      { type: 'equipo', equipo: eq('1', 'Desde base') },
      { type: 'especial', valor: 'INTERZONAL', numero: 1 }
    ]
    const fijada: ItemFixture[] = [
      {
        type: 'equipo',
        equipo: { id: '1', nombre: 'Viejo' } as EquipoDeLaZonaDTO
      },
      { type: 'especial', valor: 'INTERZONAL', numero: 1 }
    ]
    const out = reconciliarListaFijadaConBase(fijada, base)
    if (out[0]?.type === 'equipo')
      expect(out[0].equipo.nombre).toBe('Desde base')
    expect(out[1]).toEqual(fijada[1])
  })
})

describe('listaInicialDesdeBorradorOEquipos', () => {
  it('usa el borrador cuando el hash coincide y hay lista guardada', () => {
    const equipos = [eq('2', 'B'), eq('1', 'A')]
    const h = hashEquiposDeLaZona(equipos)
    const borrador = {
      hashEquipos: h,
      listaOrdenada: [
        { type: 'equipo' as const, equipo: eq('2', 'B') },
        { type: 'equipo' as const, equipo: eq('1', 'A') }
      ]
    }
    const out = listaInicialDesdeBorradorOEquipos({
      equipos,
      hashEquiposActual: h,
      borrador
    })
    expect(out.map((i) => (i.type === 'equipo' ? i.equipo.id : ''))).toEqual([
      '2',
      '1'
    ])
  })

  it('cae al orden alfabético si el hash del borrador no coincide', () => {
    const equipos = [eq('1', 'A'), eq('2', 'B')]
    const borrador = {
      hashEquipos: 'solo-uno',
      listaOrdenada: [
        { type: 'equipo' as const, equipo: eq('2', 'B') },
        { type: 'equipo' as const, equipo: eq('1', 'A') }
      ]
    }
    const out = listaInicialDesdeBorradorOEquipos({
      equipos,
      hashEquiposActual: hashEquiposDeLaZona(equipos),
      borrador
    })
    expect(out).toEqual(ordenInicialListaFixture(equipos))
  })

  it('cae al orden alfabético si la lista guardada está vacía', () => {
    const equipos = [eq('1', 'A')]
    const h = hashEquiposDeLaZona(equipos)
    const out = listaInicialDesdeBorradorOEquipos({
      equipos,
      hashEquiposActual: h,
      borrador: { hashEquipos: h, listaOrdenada: [] }
    })
    expect(out).toEqual(ordenInicialListaFixture(equipos))
  })
})

describe('primeraFechaIsoDesdeDate', () => {
  it('serializa en yyyy-MM-dd', () => {
    const d = new Date(Date.UTC(2026, 4, 12, 12, 0, 0))
    expect(primeraFechaIsoDesdeDate(d)).toBe('2026-05-12')
  })
})
