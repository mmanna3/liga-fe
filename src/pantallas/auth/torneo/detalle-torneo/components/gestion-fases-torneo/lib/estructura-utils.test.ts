import { describe, expect, it } from 'vitest'
import {
  contarFases,
  estructuraAItemsDto,
  encontrarGrupoPorIdLocal,
  moverFaseEntreContenedores,
  moverFaseTopLevelAGrupo,
  profundidadGrupo,
  renumerarElementosTopLevel,
  torneoAElementos,
  todosLosIdsFasePresentes
} from './estructura-utils'

const fasesApi = [
  { id: 1, numero: 1, nombre: 'Fase A', grupoDeFasesId: undefined },
  { id: 2, numero: 1, nombre: 'Fase B', grupoDeFasesId: 10 },
  { id: 3, numero: 2, nombre: 'Fase C', grupoDeFasesId: 10 },
  { id: 4, numero: 1, nombre: 'Fase D', grupoDeFasesId: 11 },
  { id: 5, numero: 2, nombre: 'Fase E', grupoDeFasesId: 11 },
  { id: 6, numero: 3, nombre: 'Fase F', grupoDeFasesId: undefined }
] as unknown as import('@/api/clients').FaseDTO[]

const gruposApi = [
  { id: 10, numero: 2, nombre: 'Grupo A', grupoDeFasesPadreId: undefined },
  { id: 11, numero: 3, nombre: 'Grupo B', grupoDeFasesPadreId: 10 }
] as unknown as import('@/api/clients').GrupoDeFasesDTO[]

describe('torneoAElementos', () => {
  it('reconstruye el árbol canónico con numeración por contenedor', () => {
    const elementos = torneoAElementos(fasesApi, gruposApi)

    expect(elementos).toHaveLength(3)
    expect(elementos[0].tipo).toBe('fase')
    if (elementos[0].tipo === 'fase') {
      expect(elementos[0].fase.nombre).toBe('Fase A')
      expect(elementos[0].fase.numero).toBe(1)
    }

    expect(elementos[1].tipo).toBe('grupo')
    if (elementos[1].tipo === 'grupo') {
      expect(elementos[1].grupo.nombre).toBe('Grupo A')
      expect(elementos[1].grupo.numero).toBe(2)
      expect(elementos[1].grupo.elementos).toHaveLength(3)

      const sub = elementos[1].grupo.elementos[2]
      expect(sub.tipo).toBe('grupo')
      if (sub.tipo === 'grupo') {
        expect(sub.grupo.nombre).toBe('Grupo B')
        expect(sub.grupo.elementos).toHaveLength(2)
        expect(sub.grupo.elementos[0].tipo).toBe('fase')
        if (sub.grupo.elementos[0].tipo === 'fase') {
          expect(sub.grupo.elementos[0].fase.numero).toBe(1)
        }
      }
    }

    expect(elementos[2].tipo).toBe('fase')
    if (elementos[2].tipo === 'fase') {
      expect(elementos[2].fase.nombre).toBe('Fase F')
      expect(elementos[2].fase.numero).toBe(3)
    }
  })

  it('funciona sin grupos (torneo plano)', () => {
    const planas = fasesApi.filter((f) => !f.grupoDeFasesId)
    const elementos = torneoAElementos(planas, [])
    expect(elementos).toHaveLength(2)
    expect(contarFases(elementos)).toBe(2)
  })
})

describe('estructuraAItemsDto', () => {
  it('serializa el árbol para PUT estructura-fases', () => {
    const elementos = torneoAElementos(fasesApi, gruposApi)
    const dto = estructuraAItemsDto(elementos)

    expect(dto[0]).toEqual({ tipo: 'fase', faseId: 1 })
    expect(dto[1].tipo).toBe('grupo')
    if (dto[1].tipo === 'grupo') {
      expect(dto[1].grupoId).toBe(10)
      expect(dto[1].items?.[2].tipo).toBe('grupo')
    }
    expect(dto[2]).toEqual({ tipo: 'fase', faseId: 6 })
  })
})

describe('profundidadGrupo', () => {
  it('calcula profundidad 1 para grupo raíz y 2 para subgrupo', () => {
    const elementos = torneoAElementos(fasesApi, gruposApi)
    const grupoRaiz = elementos[1]
    if (grupoRaiz.tipo !== 'grupo') throw new Error('expected grupo')

    expect(profundidadGrupo(grupoRaiz.grupo.idLocal, elementos)).toBe(1)

    const sub = grupoRaiz.grupo.elementos[2]
    if (sub.tipo !== 'grupo') throw new Error('expected subgrupo')
    expect(profundidadGrupo(sub.grupo.idLocal, elementos)).toBe(2)
  })
})

describe('renumerarElementosTopLevel', () => {
  it('asigna números 1..n en el contenedor raíz', () => {
    const elementos = torneoAElementos(fasesApi, gruposApi)
    const invertidos = [...elementos].reverse()
    const renumerados = renumerarElementosTopLevel(invertidos)

    renumerados.forEach((el, i) => {
      if (el.tipo === 'fase') expect(el.fase.numero).toBe(i + 1)
      else expect(el.grupo.numero).toBe(i + 1)
    })
  })
})

describe('todosLosIdsFasePresentes', () => {
  it('valida que todas las fases del torneo están en el árbol', () => {
    const elementos = torneoAElementos(fasesApi, gruposApi)
    expect(todosLosIdsFasePresentes(elementos, fasesApi.length)).toBe(true)
  })
})

describe('moverFaseTopLevelAGrupo', () => {
  it('mueve una fase del torneo a un subgrupo anidado', () => {
    const elementos = torneoAElementos(fasesApi, gruposApi)
    const grupoRaiz = elementos[1]
    if (grupoRaiz.tipo !== 'grupo') throw new Error('expected grupo raíz')
    const subgrupo = grupoRaiz.grupo.elementos[2]
    if (subgrupo.tipo !== 'grupo') throw new Error('expected subgrupo')

    const nuevos = moverFaseTopLevelAGrupo(
      elementos,
      '6',
      subgrupo.grupo.idLocal
    )
    const faseFEnSubgrupo = subgrupo.grupo.elementos.some(
      (el) => el.tipo === 'fase' && el.fase.id === 6
    )
    expect(
      nuevos[1].tipo === 'grupo' &&
        nuevos[1].grupo.elementos[2].tipo === 'grupo' &&
        nuevos[1].grupo.elementos[2].grupo.elementos.some(
          (el) => el.tipo === 'fase' && el.fase.id === 6
        )
    ).toBe(true)
    expect(faseFEnSubgrupo).toBe(false)
    expect(nuevos.filter((el) => el.tipo === 'fase')).toHaveLength(1)
  })
})

describe('moverFaseEntreContenedores', () => {
  it('mueve una fase de un grupo a otro', () => {
    const elementos = torneoAElementos(fasesApi, gruposApi)
    const nuevos = moverFaseEntreContenedores(elementos, 2, 'grupo-11')
    const subgrupo = encontrarGrupoPorIdLocal(nuevos, 'grupo-11')
    expect(subgrupo).not.toBeNull()
    expect(
      subgrupo!.elementos.some((el) => el.tipo === 'fase' && el.fase.id === 2)
    ).toBe(true)
    const grupoRaiz = encontrarGrupoPorIdLocal(nuevos, 'grupo-10')
    expect(
      grupoRaiz!.elementos.filter(
        (el) => el.tipo === 'fase' && el.fase.id === 2
      )
    ).toHaveLength(0)
  })
})
