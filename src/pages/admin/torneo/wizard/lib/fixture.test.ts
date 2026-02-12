import { describe, expect, it } from 'vitest'
import {
  calculateTotalDates,
  isValidConfiguration,
  validateInterzonalPairing
} from './fixture'

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeTeams = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Equipo ${i + 1}`
  }))

// ─── isValidConfiguration ───────────────────────────────────────────────────

describe('isValidConfiguration', () => {
  it('devuelve true cuando N+L+I es par', () => {
    expect(isValidConfiguration(4, 0, 0)).toBe(true)
    expect(isValidConfiguration(3, 1, 0)).toBe(true)
    expect(isValidConfiguration(5, 1, 0)).toBe(true)
    expect(isValidConfiguration(16, 2, 0)).toBe(true)
    expect(isValidConfiguration(4, 1, 1)).toBe(true)
  })

  it('devuelve false cuando N+L+I es impar', () => {
    expect(isValidConfiguration(3, 0, 0)).toBe(false)
    expect(isValidConfiguration(5, 0, 0)).toBe(false)
    expect(isValidConfiguration(16, 1, 0)).toBe(false)
    expect(isValidConfiguration(4, 1, 0)).toBe(false)
  })
})

// ─── calculateTotalDates ────────────────────────────────────────────────────

describe('calculateTotalDates', () => {
  it('calcula jornadas para solo ida', () => {
    expect(calculateTotalDates(4, 0, 0, 'single')).toBe(3)
    expect(calculateTotalDates(6, 0, 0, 'single')).toBe(5)
    expect(calculateTotalDates(5, 1, 0, 'single')).toBe(5)
    expect(calculateTotalDates(4, 1, 1, 'single')).toBe(5)
  })

  it('calcula jornadas para ida y vuelta', () => {
    expect(calculateTotalDates(4, 0, 0, 'double')).toBe(6)
    expect(calculateTotalDates(6, 0, 0, 'double')).toBe(10)
    expect(calculateTotalDates(5, 1, 0, 'double')).toBe(10)
  })

  it('devuelve 0 para menos de 2 participantes', () => {
    expect(calculateTotalDates(1, 0, 0, 'single')).toBe(0)
    expect(calculateTotalDates(0, 0, 0, 'single')).toBe(0)
  })
})

// ─── validateInterzonalPairing ──────────────────────────────────────────────

describe('validateInterzonalPairing', () => {
  it('válido cuando todas las zonas tienen el mismo interzonalDates', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 }
    ])
    expect(result.isValid).toBe(true)
  })

  it('inválido cuando zonas tienen distinto interzonalDates', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 0, interzonalDates: 1 }
    ])
    expect(result.isValid).toBe(false)
  })

  it('válido cuando todas tienen 0', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 }
    ])
    expect(result.isValid).toBe(true)
  })

  it('inválido cuando una zona tiene 0 y otra > 0', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 }
    ])
    expect(result.isValid).toBe(false)
  })

  it('válido con una sola zona', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 5 }
    ])
    expect(result.isValid).toBe(true)
  })

  it('inválido con 3+ zonas y interzonal impar', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 3 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 0, interzonalDates: 3 },
      { id: 'z3', name: 'C', teams: makeTeams(4), freeDates: 0, interzonalDates: 3 }
    ])
    expect(result.isValid).toBe(false)
  })
})
