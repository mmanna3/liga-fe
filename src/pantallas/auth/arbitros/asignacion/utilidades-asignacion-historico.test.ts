import { describe, expect, it } from 'vitest'
import {
  formatearDetalleWhatsappHistorico,
  obtenerRangoAniosArbitros
} from './utilidades-asignacion'

describe('formatearDetalleWhatsappHistorico', () => {
  it('devuelve vacío si no hay WhatsApp enviado', () => {
    expect(formatearDetalleWhatsappHistorico(null)).toEqual([])
    expect(formatearDetalleWhatsappHistorico({ enviado: false })).toEqual([])
  })

  it('formatea categorías, horario y observaciones', () => {
    const lineas = formatearDetalleWhatsappHistorico({
      enviado: true,
      horarioInicio: '20:30:00',
      observaciones: 'Traer silbato',
      categoriasNombres: ['Sub 12', 'Sub 15'],
      enviadoEn: new Date('2026-01-08T18:00:00')
    })

    expect(lineas).toContain('Categorías: Sub 12, Sub 15')
    expect(lineas).toContain('Horario: 20:30')
    expect(lineas).toContain('Observaciones: Traer silbato')
    expect(lineas.some((l) => l.startsWith('Enviado:'))).toBe(true)
  })

  it('omite líneas vacías cuando faltan campos opcionales', () => {
    const lineas = formatearDetalleWhatsappHistorico({
      enviado: true,
      categoriasNombres: []
    })

    expect(lineas).toEqual([])
  })
})

describe('obtenerRangoAniosArbitros', () => {
  it('incluye el año actual y años anteriores en orden descendente', () => {
    const anios = obtenerRangoAniosArbitros(2026)
    expect(anios[0]).toBe(2027)
    expect(anios).toContain(2026)
    expect(anios).toContain(2006)
    expect(anios.length).toBe(22)
  })
})
