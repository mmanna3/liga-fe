import { EquipoDeLaZonaDTO, LocalVisitanteEnum } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import { buildJornadaBorrador } from './jornada-edicion'
import type { ItemFixture } from '../tipos'

function itemEquipo(id: string): ItemFixture {
  return {
    type: 'equipo',
    equipo: EquipoDeLaZonaDTO.fromJS({ id, nombre: 'Equipo' })
  }
}

function libre(): ItemFixture {
  return { type: 'especial', valor: 'LIBRE' }
}

function interzonal(n: number): ItemFixture {
  return { type: 'especial', valor: 'INTERZONAL', numero: n }
}

describe('buildJornadaBorrador', () => {
  it('Normal: local y visitante', () => {
    const j = buildJornadaBorrador(itemEquipo('1'), itemEquipo('2'))
    expect(j).toEqual({
      tipo: 'Normal',
      resultadosVerificados: false,
      localId: 1,
      visitanteId: 2
    })
  })

  it('Libre: equipo en local y LIBRE en visitante → equipoId y localOVisitante _1', () => {
    const j = buildJornadaBorrador(itemEquipo('5'), libre())
    expect(j).toEqual({
      tipo: 'Libre',
      resultadosVerificados: false,
      equipoId: 5,
      localOVisitante: LocalVisitanteEnum._1
    })
  })

  it('Libre: LIBRE en local y equipo en visitante → equipoId y localOVisitante _2', () => {
    const j = buildJornadaBorrador(libre(), itemEquipo('7'))
    expect(j).toEqual({
      tipo: 'Libre',
      resultadosVerificados: false,
      equipoId: 7,
      localOVisitante: LocalVisitanteEnum._2
    })
  })

  it('Interzonal: equipo local e interzonal en visitante → _1 y numero', () => {
    const j = buildJornadaBorrador(itemEquipo('3'), interzonal(2))
    expect(j).toEqual({
      tipo: 'Interzonal',
      resultadosVerificados: false,
      equipoId: 3,
      localOVisitante: LocalVisitanteEnum._1,
      numero: 2
    })
  })

  it('Interzonal: interzonal local y equipo visitante → _2 y numero', () => {
    const j = buildJornadaBorrador(interzonal(4), itemEquipo('8'))
    expect(j).toEqual({
      tipo: 'Interzonal',
      resultadosVerificados: false,
      equipoId: 8,
      localOVisitante: LocalVisitanteEnum._2,
      numero: 4
    })
  })
})
