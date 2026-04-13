import { describe, expect, it } from 'vitest'
import {
  CANCHA_TIPO_ID,
  CANCHA_TIPO_ID_POR_DEFECTO,
  OPCIONES_CANCHA_TIPO,
  tituloCanchaTipoPorId
} from './opciones-cancha-tipo'

describe('OPCIONES_CANCHA_TIPO', () => {
  it('tiene 4 opciones alineadas con el backend (1–4)', () => {
    expect(OPCIONES_CANCHA_TIPO).toHaveLength(4)
    expect(OPCIONES_CANCHA_TIPO.map((o) => o.id)).toEqual(['1', '2', '3', '4'])
  })
})

describe('tituloCanchaTipoPorId', () => {
  it('devuelve el título para cada id conocido', () => {
    expect(tituloCanchaTipoPorId(CANCHA_TIPO_ID.Cubierta)).toBe('Cubierta')
    expect(tituloCanchaTipoPorId(CANCHA_TIPO_ID.Descubierta)).toBe(
      'Descubierta'
    )
    expect(tituloCanchaTipoPorId(CANCHA_TIPO_ID.Semidescubierta)).toBe(
      'Semidescubierta'
    )
    expect(tituloCanchaTipoPorId(CANCHA_TIPO_ID.Consultar)).toBe('Consultar')
  })

  it('usa el id por defecto cuando el id es undefined', () => {
    expect(tituloCanchaTipoPorId(undefined)).toBe('Descubierta')
    expect(CANCHA_TIPO_ID_POR_DEFECTO).toBe(CANCHA_TIPO_ID.Descubierta)
  })

  it('devuelve em dash para ids no reconocidos', () => {
    expect(tituloCanchaTipoPorId(999)).toBe('—')
  })
})
