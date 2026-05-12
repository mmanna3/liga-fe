import { ZonaDeFaseDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import { zonasDeFaseOrdenadas } from './datos-fase-lectura'

describe('zonasDeFaseOrdenadas', () => {
  it('ordena por campo orden ascendente', () => {
    const zonas = [
      new ZonaDeFaseDTO({ id: 1, nombre: 'C', orden: 3 }),
      new ZonaDeFaseDTO({ id: 2, nombre: 'A', orden: 1 }),
      new ZonaDeFaseDTO({ id: 3, nombre: 'B', orden: 2 })
    ]
    const ordenadas = zonasDeFaseOrdenadas(zonas)
    expect(ordenadas.map((z) => z.nombre)).toEqual(['A', 'B', 'C'])
  })

  it('trata orden ausente como 0', () => {
    const zonas = [
      new ZonaDeFaseDTO({ id: 1, nombre: 'Primero', orden: 0 }),
      new ZonaDeFaseDTO({ id: 2, nombre: 'Sin orden' }),
      new ZonaDeFaseDTO({ id: 3, nombre: 'Último', orden: 2 })
    ]
    const ordenadas = zonasDeFaseOrdenadas(zonas)
    expect(ordenadas.map((z) => z.nombre)).toEqual([
      'Primero',
      'Sin orden',
      'Último'
    ])
  })

  it('desempata por id cuando orden es igual', () => {
    const zonas = [
      new ZonaDeFaseDTO({ id: 20, nombre: 'B', orden: 1 }),
      new ZonaDeFaseDTO({ id: 10, nombre: 'A', orden: 1 })
    ]
    const ordenadas = zonasDeFaseOrdenadas(zonas)
    expect(ordenadas.map((z) => z.id)).toEqual([10, 20])
  })
})
