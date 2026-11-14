import { FaseDTO, ZonaDeFaseDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import { zonasDeTablaAnual } from './modal-leyendas-tabla-anual'

function fase(zonas: { id: number; nombre: string; orden: number }[]) {
  return FaseDTO.fromJS({
    nombre: 'Fase',
    zonas: zonas.map((z) => ZonaDeFaseDTO.fromJS(z).toJSON())
  })
}

describe('zonasDeTablaAnual', () => {
  it('devuelve las zonas de Apertura con una zona homónima en Clausura, ordenadas', () => {
    const apertura = fase([
      { id: 2, nombre: 'Zona B', orden: 2 },
      { id: 1, nombre: 'Zona A ', orden: 1 },
      { id: 3, nombre: 'Solo Apertura', orden: 3 }
    ])
    const clausura = fase([
      { id: 11, nombre: 'Zona A', orden: 1 },
      { id: 12, nombre: 'Zona B', orden: 2 },
      { id: 13, nombre: 'Solo Clausura', orden: 3 }
    ])

    expect(zonasDeTablaAnual(apertura, clausura).map((z) => z.id)).toEqual([
      1, 2
    ])
  })

  it('sin alguna de las fases no hay zonas', () => {
    const apertura = fase([{ id: 1, nombre: 'Zona A', orden: 1 }])
    expect(zonasDeTablaAnual(apertura, undefined)).toEqual([])
    expect(zonasDeTablaAnual(undefined, apertura)).toEqual([])
  })
})
