import { describe, expect, it } from 'vitest'
import { parsearErrorApi } from './parsear-error-api'

describe('parsearErrorApi', () => {
  it('extrae el title de un error con response JSON valido', () => {
    const error = new Error('Error')
    ;(error as unknown as { response: string }).response = JSON.stringify({
      title: 'El jugador ya existe',
      status: 400
    })

    expect(parsearErrorApi(error)).toBe('El jugador ya existe')
  })

  it('devuelve mensaje por defecto si response no es JSON valido', () => {
    const error = new Error('Error')
    ;(error as unknown as { response: string }).response = 'no es json'

    expect(parsearErrorApi(error)).toBe('Error')
  })

  it('devuelve el mensaje del Error si no tiene response', () => {
    const error = new Error('Algo salio mal')

    expect(parsearErrorApi(error)).toBe('Algo salio mal')
  })

  it('devuelve mensaje por defecto si el error no es una instancia de Error', () => {
    expect(parsearErrorApi('string raro')).toBe('Error desconocido')
    expect(parsearErrorApi(42)).toBe('Error desconocido')
    expect(parsearErrorApi(null)).toBe('Error desconocido')
    expect(parsearErrorApi(undefined)).toBe('Error desconocido')
  })

  it('devuelve el mensaje personalizado por defecto si se provee', () => {
    expect(parsearErrorApi(null, 'Mi mensaje custom')).toBe(
      'Mi mensaje custom'
    )
  })

  it('devuelve mensaje por defecto si response JSON no tiene title', () => {
    const error = new Error('Error')
    ;(error as unknown as { response: string }).response = JSON.stringify({
      status: 500
    })

    expect(parsearErrorApi(error)).toBe('Error')
  })

  it('devuelve mensaje por defecto si response no es string', () => {
    const error = new Error('Error')
    ;(error as unknown as { response: number }).response = 123

    expect(parsearErrorApi(error)).toBe('Error')
  })
})
