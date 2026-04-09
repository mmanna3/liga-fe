import { EquipoDeLaZonaDTO, FixtureAlgoritmoFechaDTO } from '@/api/clients'
import type { ItemFixture } from '../../tipos'
import { describe, expect, it } from 'vitest'
import { buildPayloadTodosContraTodos } from './fixture-vista-previa'

function itemEquipo(id: string, nombre: string): ItemFixture {
  return {
    type: 'equipo',
    equipo: EquipoDeLaZonaDTO.fromJS({ id, nombre })
  }
}

function libre(): ItemFixture {
  return { type: 'especial', valor: 'LIBRE' }
}

function interzonal(): ItemFixture {
  return { type: 'especial', valor: 'INTERZONAL' }
}

function slot(
  fecha: number,
  equipoLocal: number,
  equipoVisitante: number
): FixtureAlgoritmoFechaDTO {
  return FixtureAlgoritmoFechaDTO.fromJS({
    fecha,
    equipoLocal,
    equipoVisitante
  })
}

describe('buildPayloadTodosContraTodos', () => {
  const primeraFecha = new Date('2026-04-01T12:00:00.000Z')

  it('no incluye jornada LIBRE vs INTERZONAL', () => {
    const lista: ItemFixture[] = [libre(), interzonal()]
    const fechas = [slot(1, 1, 2)]
    const payload = buildPayloadTodosContraTodos(fechas, lista, primeraFecha)
    expect(payload).toHaveLength(1)
    expect(payload[0].jornadas).toHaveLength(0)
  })

  it('no incluye jornada INTERZONAL vs LIBRE', () => {
    const lista: ItemFixture[] = [interzonal(), libre()]
    const fechas = [slot(1, 1, 2)]
    const payload = buildPayloadTodosContraTodos(fechas, lista, primeraFecha)
    expect(payload[0].jornadas).toHaveLength(0)
  })

  it('no incluye jornada LIBRE vs LIBRE', () => {
    const lista: ItemFixture[] = [libre(), libre()]
    const fechas = [slot(1, 1, 2)]
    const payload = buildPayloadTodosContraTodos(fechas, lista, primeraFecha)
    expect(payload[0].jornadas).toHaveLength(0)
  })

  it('no incluye jornada INTERZONAL vs INTERZONAL', () => {
    const lista: ItemFixture[] = [interzonal(), interzonal()]
    const fechas = [slot(1, 1, 2)]
    const payload = buildPayloadTodosContraTodos(fechas, lista, primeraFecha)
    expect(payload[0].jornadas).toHaveLength(0)
  })

  it('incluye equipo vs equipo y omite LIBRE vs INTERZONAL en la misma fecha', () => {
    const lista: ItemFixture[] = [
      itemEquipo('10', 'Alpha'),
      itemEquipo('20', 'Beta'),
      libre(),
      interzonal()
    ]
    const fechas = [slot(1, 1, 2), slot(1, 3, 4)]
    const payload = buildPayloadTodosContraTodos(fechas, lista, primeraFecha)
    expect(payload[0].jornadas).toHaveLength(1)
    const j0 = payload[0].jornadas![0] as {
      tipo?: string
      localId?: unknown
      visitanteId?: unknown
    }
    expect(j0.tipo).toBe('Normal')
    expect(j0.localId).toBe('10')
    expect(j0.visitanteId).toBe('20')
  })

  it('no envía jornadas Normal sin equipos (regresión)', () => {
    const lista: ItemFixture[] = [libre(), interzonal()]
    const fechas = [slot(1, 1, 2)]
    const payload = buildPayloadTodosContraTodos(fechas, lista, primeraFecha)
    const vacias = payload[0].jornadas!.filter(
      (j) =>
        (j as { tipo?: string }).tipo === 'Normal' &&
        !('localId' in j && (j as { localId?: unknown }).localId != null)
    )
    expect(vacias).toHaveLength(0)
  })
})
