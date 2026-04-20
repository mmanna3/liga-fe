import { EquipoDeLaZonaDTO, LocalVisitanteEnum } from '@/api/clients'
import type { ItemFixture } from '../../tipos'
import { describe, expect, it } from 'vitest'
import { buildPayloadEliminacionDirecta } from './fixture-vista-previa'

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
  return { type: 'especial', valor: 'INTERZONAL', numero: 1 }
}

describe('buildPayloadEliminacionDirecta', () => {
  const fecha = new Date('2026-04-01T12:00:00.000Z')

  it('no incluye jornadas cuando el partido es LIBRE vs INTERZONAL', () => {
    const lista: ItemFixture[] = [libre(), interzonal()]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    expect(payload).not.toBeNull()
    expect(payload!.jornadas).toHaveLength(0)
  })

  it('no incluye jornadas cuando el partido es INTERZONAL vs LIBRE', () => {
    const lista: ItemFixture[] = [interzonal(), libre()]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    expect(payload).not.toBeNull()
    expect(payload!.jornadas).toHaveLength(0)
  })

  it('no incluye jornadas cuando el partido es LIBRE vs LIBRE', () => {
    const lista: ItemFixture[] = [libre(), libre()]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    expect(payload).not.toBeNull()
    expect(payload!.jornadas).toHaveLength(0)
  })

  it('no incluye jornadas cuando el partido es INTERZONAL vs INTERZONAL', () => {
    const lista: ItemFixture[] = [interzonal(), interzonal()]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    expect(payload).not.toBeNull()
    expect(payload!.jornadas).toHaveLength(0)
  })

  it('incluye la jornada equipo vs equipo y omite LIBRE vs INTERZONAL en la misma primera ronda', () => {
    const lista: ItemFixture[] = [
      itemEquipo('10', 'Alpha'),
      itemEquipo('20', 'Beta'),
      libre(),
      interzonal()
    ]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    expect(payload).not.toBeNull()
    const jornadas = payload!.jornadas!
    expect(jornadas).toHaveLength(1)
    const j0 = jornadas[0]! as {
      tipo?: string
      resultadosVerificados?: boolean
      localId?: unknown
      visitanteId?: unknown
    }
    expect(j0.tipo).toBe('Normal')
    expect(j0.resultadosVerificados).toBe(false)
    expect(j0.localId).toBe('10')
    expect(j0.visitanteId).toBe('20')
  })

  it('no envía jornadas vacías tipo Normal sin equipos (regresión)', () => {
    const lista: ItemFixture[] = [libre(), interzonal()]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    const vacias = (payload!.jornadas ?? []).filter(
      (j) =>
        (j as { tipo?: string }).tipo === 'Normal' &&
        !('localId' in j && (j as { localId?: unknown }).localId != null)
    )
    expect(vacias).toHaveLength(0)
  })

  it('primera ronda: equipo vs LIBRE envía Libre con equipoId y localOVisitante _1', () => {
    const lista: ItemFixture[] = [itemEquipo('10', 'Alpha'), libre()]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    expect(payload).not.toBeNull()
    const j = payload!.jornadas![0] as {
      tipo?: string
      equipoId?: unknown
      localOVisitante?: unknown
    }
    expect(j.tipo).toBe('Libre')
    expect(j.equipoId).toBe('10')
    expect(j.localOVisitante).toBe(LocalVisitanteEnum._1)
  })

  it('primera ronda: LIBRE vs equipo envía Libre con equipoId y localOVisitante _2', () => {
    const lista: ItemFixture[] = [libre(), itemEquipo('20', 'Beta')]
    const payload = buildPayloadEliminacionDirecta(lista, fecha)
    expect(payload).not.toBeNull()
    const j = payload!.jornadas![0] as {
      tipo?: string
      equipoId?: unknown
      localOVisitante?: unknown
    }
    expect(j.tipo).toBe('Libre')
    expect(j.equipoId).toBe('20')
    expect(j.localOVisitante).toBe(LocalVisitanteEnum._2)
  })
})
