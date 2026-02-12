import { describe, expect, it } from 'vitest'
import {
  isPowerOf2,
  isValidForElimination,
  validateZones
} from './fixture'

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeTeams = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Equipo ${i + 1}`
  }))

// ─── isPowerOf2 ────────────────────────────────────────────────────────────

describe('isPowerOf2', () => {
  it.each([2, 4, 8, 16, 32, 64, 128])('%i es potencia de 2', (n) => {
    expect(isPowerOf2(n)).toBe(true)
  })

  it.each([0, 1, 3, 5, 6, 7, 9, 10, 12, 15, 17, 24, 100])(
    '%i NO es potencia de 2',
    (n) => {
      expect(isPowerOf2(n)).toBe(false)
    }
  )
})

// ─── isValidForElimination ─────────────────────────────────────────────────

describe('isValidForElimination', () => {
  it.each([
    { teams: 4, free: 0, iz: 0, expected: true, label: '4+0+0=4' },
    { teams: 8, free: 0, iz: 0, expected: true, label: '8+0+0=8' },
    { teams: 16, free: 0, iz: 0, expected: true, label: '16+0+0=16' },
    { teams: 6, free: 2, iz: 0, expected: true, label: '6+2+0=8' },
    { teams: 5, free: 2, iz: 1, expected: true, label: '5+2+1=8' },
    { teams: 7, free: 1, iz: 0, expected: true, label: '7+1+0=8' },
    { teams: 12, free: 4, iz: 0, expected: true, label: '12+4+0=16' },
    { teams: 5, free: 1, iz: 0, expected: false, label: '5+1+0=6' },
    { teams: 6, free: 0, iz: 0, expected: false, label: '6+0+0=6' },
    { teams: 3, free: 0, iz: 0, expected: false, label: '3+0+0=3' },
    { teams: 10, free: 0, iz: 0, expected: false, label: '10+0+0=10' },
    { teams: 9, free: 2, iz: 0, expected: false, label: '9+2+0=11' },
    { teams: 14, free: 1, iz: 0, expected: false, label: '14+1+0=15' }
  ])('$label → $expected', ({ teams, free, iz, expected }) => {
    expect(isValidForElimination(teams, free, iz)).toBe(expected)
  })
})

// ─── validateZones mode elimination ────────────────────────────────────────

describe('validateZones mode elimination', () => {
  it('1 zona válida (6+2=8)', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(6), freeDates: 2, interzonalDates: 0 }
    ]
    const result = validateZones(zones, 'elimination')
    expect(result[0].isValid).toBe(true)
    expect(result[0].totalParticipants).toBe(8)
  })

  it('1 zona inválida (5+1=6)', () => {
    const result = validateZones(
      [{ id: 'z1', name: 'A', teams: makeTeams(5), freeDates: 1, interzonalDates: 0 }],
      'elimination'
    )
    expect(result[0].isValid).toBe(false)
    expect(result[0].totalParticipants).toBe(6)
  })

  it('2 zonas: ambas válidas', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 },
      { id: 'z2', name: 'B', teams: makeTeams(8), freeDates: 0, interzonalDates: 0 }
    ]
    const result = validateZones(zones, 'elimination')
    expect(result.every((v) => v.isValid)).toBe(true)
  })

  it('2 zonas: una válida, una inválida', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 },
      { id: 'z2', name: 'B', teams: makeTeams(6), freeDates: 0, interzonalDates: 0 }
    ]
    const result = validateZones(zones, 'elimination')
    expect(result[0].isValid).toBe(true)
    expect(result[1].isValid).toBe(false)
  })

  it('3 zonas mixtas', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 },
      { id: 'z2', name: 'B', teams: makeTeams(6), freeDates: 2, interzonalDates: 0 },
      { id: 'z3', name: 'C', teams: makeTeams(5), freeDates: 1, interzonalDates: 0 }
    ]
    const result = validateZones(zones, 'elimination')
    expect(result[0].isValid).toBe(true) // 4
    expect(result[1].isValid).toBe(true) // 8
    expect(result[2].isValid).toBe(false) // 6
  })

  it('5 zonas todas válidas', () => {
    const zones = Array.from({ length: 5 }, (_, i) => ({
      id: `z${i}`,
      name: `Z${i}`,
      teams: makeTeams(4),
      freeDates: 0,
      interzonalDates: 0
    }))
    const result = validateZones(zones, 'elimination')
    expect(result.every((v) => v.isValid)).toBe(true)
  })
})

// ─── Escenarios comunes de eliminación ─────────────────────────────────────

describe('escenarios comunes de eliminación', () => {
  it.each([
    { total: 8, label: '8 participantes' },
    { total: 16, label: '16 participantes' },
    { total: 32, label: '32 participantes' }
  ])('$label: potencia de 2 directa', ({ total }) => {
    expect(isValidForElimination(total, 0, 0)).toBe(true)
  })

  it('6+2=8 es válido', () => {
    expect(isValidForElimination(6, 2, 0)).toBe(true)
  })

  it('12+4=16 es válido', () => {
    expect(isValidForElimination(12, 4, 0)).toBe(true)
  })

  it('5+3=8 es válido', () => {
    expect(isValidForElimination(5, 3, 0)).toBe(true)
  })

  it('10+6=16 con mezcla libre+interzonal', () => {
    expect(isValidForElimination(10, 4, 2)).toBe(true)
  })
})
