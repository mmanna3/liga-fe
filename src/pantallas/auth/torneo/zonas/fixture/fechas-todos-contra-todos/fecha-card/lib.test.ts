import { JornadaDTO, LocalVisitanteEnum, PartidoDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import {
  buildPartidosDto,
  buildRequests,
  etiquetasLocalVisitanteJornada
} from './lib'

function makePartido(data: {
  id?: number
  categoriaId?: number
  categoria?: string
  resultadoLocal?: string
  resultadoVisitante?: string
}): PartidoDTO {
  return PartidoDTO.fromJS(data)
}

function makeJornadaConPartidos(
  id: number,
  partidos: ReturnType<typeof makePartido>[]
): JornadaDTO {
  return JornadaDTO.fromJS({
    id,
    resultadosVerificados: false,
    tipo: 'Normal',
    partidos
  })
}

// ---------------------------------------------------------------------------
// buildRequests
// ---------------------------------------------------------------------------

describe('buildRequests', () => {
  it('produce una única invocación, solo para la jornada editada', () => {
    // Este es el bug: al guardar se llama a la API una vez por cada jornada de
    // la fecha, en lugar de solo para la jornada que se está editando.
    const partidoJornada1 = makePartido({
      id: 10,
      categoriaId: 1,
      resultadoLocal: '1',
      resultadoVisitante: '0'
    })
    const jornada = makeJornadaConPartidos(1, [partidoJornada1])
    const valores = [{ local: '2', visitante: '1' }]

    const requests = buildRequests(jornada, jornada.partidos!, valores, false)

    expect(requests).toHaveLength(1)
    expect(requests[0].jornadaId).toBe(1)
    expect(requests[0].partidos[0].resultadoLocal).toBe('2')
    expect(requests[0].partidos[0].resultadoVisitante).toBe('1')
  })

  it('cuando jornadasDeLaFecha está vacío, igual guarda la jornada editada', () => {
    const jornada = makeJornadaConPartidos(5, [
      makePartido({ id: 50, categoriaId: 1 })
    ])
    const valores = [{ local: '3', visitante: '0' }]

    const requests = buildRequests(jornada, jornada.partidos!, valores, true)

    expect(requests).toHaveLength(1)
    expect(requests[0].jornadaId).toBe(5)
    expect(requests[0].resultadosVerificados).toBe(true)
  })

  it('propaga resultadosVerificados correctamente', () => {
    const jornada = makeJornadaConPartidos(1, [
      makePartido({ id: 10, categoriaId: 1 })
    ])

    const requests = buildRequests(
      jornada,
      jornada.partidos!,
      [{ local: '1', visitante: '0' }],
      true
    )

    expect(requests[0].resultadosVerificados).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// buildPartidosDto
// ---------------------------------------------------------------------------

describe('buildPartidosDto', () => {
  it('cuando valores está vacío (stale state), conserva los resultados existentes del partido', () => {
    // Este caso ocurre en "modo edición": el modal se abre con una jornada que
    // ya tiene resultados cargados desde el backend, pero valores[] todavía no
    // fue inicializado por el useEffect (render intermedio). Sin el fallback a
    // p.resultadoLocal, se envían strings vacíos al backend.
    const partidos = [
      makePartido({
        id: 1,
        categoriaId: 10,
        resultadoLocal: '2',
        resultadoVisitante: '1'
      }),
      makePartido({
        id: 2,
        categoriaId: 11,
        resultadoLocal: '0',
        resultadoVisitante: '3'
      })
    ]
    const valores: { local: string; visitante: string }[] = [] // stale / no inicializado

    const resultado = buildPartidosDto(partidos, valores)

    expect(resultado[0].resultadoLocal).toBe('2')
    expect(resultado[0].resultadoVisitante).toBe('1')
    expect(resultado[1].resultadoLocal).toBe('0')
    expect(resultado[1].resultadoVisitante).toBe('3')
  })

  it('cuando valores está completo, usa los valores del formulario', () => {
    const partidos = [
      makePartido({
        id: 1,
        categoriaId: 10,
        resultadoLocal: '2',
        resultadoVisitante: '1'
      })
    ]
    const valores = [{ local: '3', visitante: '0' }]

    const resultado = buildPartidosDto(partidos, valores)

    expect(resultado[0].resultadoLocal).toBe('3')
    expect(resultado[0].resultadoVisitante).toBe('0')
  })

  it('cuando el resultado del partido era null y valores no está inicializado, devuelve string vacío', () => {
    const partidos = [
      makePartido({
        id: 1,
        categoriaId: 10,
        resultadoLocal: undefined,
        resultadoVisitante: undefined
      })
    ]
    const valores: { local: string; visitante: string }[] = []

    const resultado = buildPartidosDto(partidos, valores)

    expect(resultado[0].resultadoLocal).toBe('')
    expect(resultado[0].resultadoVisitante).toBe('')
  })

  it('preserva id, categoriaId y categoria en el DTO resultante', () => {
    const partidos = [
      makePartido({
        id: 5,
        categoriaId: 42,
        categoria: 'Primera',
        resultadoLocal: '1',
        resultadoVisitante: '1'
      })
    ]
    const valores = [{ local: '1', visitante: '1' }]

    const resultado = buildPartidosDto(partidos, valores)

    expect(resultado[0].id).toBe(5)
    expect(resultado[0].categoriaId).toBe(42)
    expect(resultado[0].categoria).toBe('Primera')
  })
})

// ---------------------------------------------------------------------------
// etiquetasLocalVisitanteJornada
// ---------------------------------------------------------------------------

describe('etiquetasLocalVisitanteJornada', () => {
  function makeJornada(data: Partial<JornadaDTO>): JornadaDTO {
    return JornadaDTO.fromJS({ resultadosVerificados: false, ...data })
  }

  it('tipo Normal: devuelve local y visitante del partido', () => {
    const j = makeJornada({
      tipo: 'Normal',
      local: 'Tigre',
      visitante: 'Racing'
    })
    expect(etiquetasLocalVisitanteJornada(j)).toEqual({
      local: 'Tigre',
      visitante: 'Racing'
    })
  })

  it('tipo Normal con valores undefined: devuelve guiones', () => {
    const j = makeJornada({
      tipo: 'Normal',
      local: undefined,
      visitante: undefined
    })
    expect(etiquetasLocalVisitanteJornada(j)).toEqual({
      local: '—',
      visitante: '—'
    })
  })

  it('tipo Libre con equipo como local (localOVisitante = 1): equipo es local, Libre es visitante', () => {
    const j = makeJornada({
      tipo: 'Libre',
      equipo: 'San Lorenzo',
      localOVisitante: LocalVisitanteEnum._1
    })
    expect(etiquetasLocalVisitanteJornada(j)).toEqual({
      local: 'San Lorenzo',
      visitante: 'Libre'
    })
  })

  it('tipo Libre con equipo como visitante (localOVisitante = 2): Libre es local, equipo es visitante', () => {
    const j = makeJornada({
      tipo: 'Libre',
      equipo: 'Racing',
      localOVisitante: LocalVisitanteEnum._2
    })
    expect(etiquetasLocalVisitanteJornada(j)).toEqual({
      local: 'Libre',
      visitante: 'Racing'
    })
  })

  it('tipo Interzonal como local (localOVisitante = 1): equipo es local, Interzonal es visitante', () => {
    const j = makeJornada({
      tipo: 'Interzonal',
      equipo: 'Boca',
      localOVisitante: LocalVisitanteEnum._1
    })
    expect(etiquetasLocalVisitanteJornada(j)).toEqual({
      local: 'Boca',
      visitante: 'Interzonal'
    })
  })

  it('tipo Interzonal como visitante (localOVisitante = 2): Interzonal es local, equipo es visitante', () => {
    const j = makeJornada({
      tipo: 'Interzonal',
      equipo: 'River',
      localOVisitante: LocalVisitanteEnum._2
    })
    expect(etiquetasLocalVisitanteJornada(j)).toEqual({
      local: 'Interzonal',
      visitante: 'River'
    })
  })
})
