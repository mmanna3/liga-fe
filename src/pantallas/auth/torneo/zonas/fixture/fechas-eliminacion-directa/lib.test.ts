import { FechaEliminacionDirectaDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import { campeonSinJugarDeFechas } from './lib'

function fecha(instanciaId: number, jornadas: object[]) {
  return FechaEliminacionDirectaDTO.fromJS({ id: 1, instanciaId, jornadas })
}

describe('campeonSinJugarDeFechas', () => {
  it('detecta la Final con una única jornada Libre', () => {
    const r = campeonSinJugarDeFechas([
      fecha(2, [{ id: 1, tipo: 'Libre', equipo: 'Alpha', localOVisitante: 1 }])
    ])
    expect(r?.equipo).toBe('Alpha')
  })

  it('no aplica a una Final con un partido normal', () => {
    expect(
      campeonSinJugarDeFechas([
        fecha(2, [{ id: 1, tipo: 'Normal', local: 'A', visitante: 'B' }])
      ])
    ).toBeNull()
  })

  it('no aplica si hay más de una instancia', () => {
    expect(
      campeonSinJugarDeFechas([
        fecha(4, [{ id: 1, tipo: 'Libre', equipo: 'A', localOVisitante: 1 }]),
        fecha(2, [{ id: 2, tipo: 'Libre', equipo: 'A', localOVisitante: 1 }])
      ])
    ).toBeNull()
  })
})
