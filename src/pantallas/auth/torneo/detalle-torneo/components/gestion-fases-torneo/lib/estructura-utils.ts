import type { FaseDTO } from '@/api/clients'
import { arrayMove } from '@dnd-kit/sortable'
import { tipoDeFaseAOpción, type FaseEstado } from '../../../lib'
import type { ElementoEstructuraTorneo, GrupoDeFasesEstado } from './tipos'

export const PREFIJO_DRAG_FASE_TOP = 'top-fase-'
export const PREFIJO_DRAG_GRUPO_DROP = 'grupo-drop-'
export const PREFIJO_DRAG_FASE_GRUPO = 'grupo-fase-'

export function generarIdLocal(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function faseDtoAFaseEstado(f: FaseDTO): FaseEstado {
  return {
    id: f.id,
    numero: f.numero ?? 0,
    nombre: f.nombre ?? '',
    formato: tipoDeFaseAOpción(f.tipoDeFase),
    sePuedeEditar: f.sePuedeEditar !== false
  }
}

export function torneoFasesAElementos(
  fases: FaseDTO[]
): ElementoEstructuraTorneo[] {
  const ordenadas = [...(fases ?? [])].sort(
    (a, b) => (a.numero ?? 0) - (b.numero ?? 0)
  )
  return ordenadas.map((f) => ({
    tipo: 'fase' as const,
    fase: faseDtoAFaseEstado(f)
  }))
}

export function renumerarElementosTopLevel(
  elementos: ElementoEstructuraTorneo[]
): ElementoEstructuraTorneo[] {
  return elementos.map((el, index) => {
    const numero = index + 1
    if (el.tipo === 'fase') {
      return { ...el, fase: { ...el.fase, numero } }
    }
    return { ...el, grupo: { ...el.grupo, numero } }
  })
}

export function renumerarFasesGrupo(fases: FaseEstado[]): FaseEstado[] {
  return fases.map((f, index) => ({ ...f, numero: index + 1 }))
}

export function idDragFaseTopLevel(fase: FaseEstado): string {
  return `${PREFIJO_DRAG_FASE_TOP}${fase.id ?? fase.numero}`
}

export function idDragGrupoDrop(
  grupoOrIdLocal: GrupoDeFasesEstado | string
): string {
  const idLocal =
    typeof grupoOrIdLocal === 'string' ? grupoOrIdLocal : grupoOrIdLocal.idLocal
  return `${PREFIJO_DRAG_GRUPO_DROP}${idLocal}`
}

export const SEPARADOR_FASE_GRUPO = '::'

export function idDragFaseEnGrupo(
  grupoIdLocal: string,
  fase: FaseEstado,
  index: number
): string {
  const faseKey = fase.id != null ? String(fase.id) : `idx-${index}`
  return `${PREFIJO_DRAG_FASE_GRUPO}${grupoIdLocal}${SEPARADOR_FASE_GRUPO}${faseKey}`
}

export function parseGrupoIdLocalDesdeDropId(dropId: string): string | null {
  if (!dropId.startsWith(PREFIJO_DRAG_GRUPO_DROP)) return null
  return dropId.slice(PREFIJO_DRAG_GRUPO_DROP.length)
}

export function parseGrupoIdLocalDesdeFaseGrupoId(
  faseGrupoId: string
): string | null {
  if (!faseGrupoId.startsWith(PREFIJO_DRAG_FASE_GRUPO)) return null
  const rest = faseGrupoId.slice(PREFIJO_DRAG_FASE_GRUPO.length)
  const sep = rest.indexOf(SEPARADOR_FASE_GRUPO)
  if (sep <= 0) return null
  return rest.slice(0, sep)
}

export function parseFaseIdDesdeTopLevelDragId(dragId: string): string | null {
  if (!dragId.startsWith(PREFIJO_DRAG_FASE_TOP)) return null
  return dragId.slice(PREFIJO_DRAG_FASE_TOP.length)
}

export function contarFases(elementos: ElementoEstructuraTorneo[]): number {
  return elementos.reduce((acc, el) => {
    if (el.tipo === 'fase') return acc + 1
    return acc + el.grupo.fases.length
  }, 0)
}

export function crearGrupoVacio(): GrupoDeFasesEstado {
  return {
    idLocal: generarIdLocal(),
    numero: 0,
    nombre: 'Grupo de fases',
    fases: []
  }
}

export function moverFaseTopLevelAGrupo(
  elementos: ElementoEstructuraTorneo[],
  faseTopId: string,
  grupoIdLocal: string,
  indiceEnGrupo?: number
): ElementoEstructuraTorneo[] {
  const indiceFase = elementos.findIndex(
    (el) =>
      el.tipo === 'fase' &&
      (el.fase.id != null
        ? String(el.fase.id) === faseTopId
        : String(el.fase.numero) === faseTopId)
  )
  if (indiceFase < 0) return elementos

  const faseMovida = elementos[indiceFase]
  if (faseMovida.tipo !== 'fase') return elementos

  const faseParaGrupo: FaseEstado = { ...faseMovida.fase, numero: 0 }
  const sinFase = elementos.filter((_, i) => i !== indiceFase)

  const conFaseEnGrupo = sinFase.map((el) => {
    if (el.tipo !== 'grupo' || el.grupo.idLocal !== grupoIdLocal) return el
    const fases = [...el.grupo.fases]
    const insertAt =
      indiceEnGrupo != null
        ? Math.min(Math.max(indiceEnGrupo, 0), fases.length)
        : fases.length
    fases.splice(insertAt, 0, faseParaGrupo)
    return {
      ...el,
      grupo: {
        ...el.grupo,
        fases: renumerarFasesGrupo(fases)
      }
    }
  })

  return renumerarElementosTopLevel(conFaseEnGrupo)
}

export function reordenarFasesEnGrupo(
  elementos: ElementoEstructuraTorneo[],
  grupoIdLocal: string,
  oldIndex: number,
  newIndex: number
): ElementoEstructuraTorneo[] {
  return elementos.map((el) => {
    if (el.tipo !== 'grupo' || el.grupo.idLocal !== grupoIdLocal) return el
    const fases = arrayMove(el.grupo.fases, oldIndex, newIndex)
    return {
      ...el,
      grupo: { ...el.grupo, fases: renumerarFasesGrupo(fases) }
    }
  })
}

export function eliminarGrupoDevolviendoFases(
  elementos: ElementoEstructuraTorneo[],
  grupoIdLocal: string
): ElementoEstructuraTorneo[] {
  const indiceGrupo = elementos.findIndex(
    (el) => el.tipo === 'grupo' && el.grupo.idLocal === grupoIdLocal
  )
  if (indiceGrupo < 0) return elementos

  const grupo = elementos[indiceGrupo]
  if (grupo.tipo !== 'grupo') return elementos

  const fasesSueltas: ElementoEstructuraTorneo[] = grupo.grupo.fases.map(
    (f) => ({ tipo: 'fase' as const, fase: f })
  )

  const sinGrupo = [
    ...elementos.slice(0, indiceGrupo),
    ...fasesSueltas,
    ...elementos.slice(indiceGrupo + 1)
  ]

  return renumerarElementosTopLevel(sinGrupo)
}

export function actualizarFaseEnElementos(
  elementos: ElementoEstructuraTorneo[],
  ubicacion:
    | { nivel: 'top'; index: number }
    | { nivel: 'grupo'; grupoIndex: number; faseIndex: number },
  campo: string,
  valor: string
): ElementoEstructuraTorneo[] {
  return elementos.map((el, i) => {
    if (ubicacion.nivel === 'top') {
      if (ubicacion.index !== i || el.tipo !== 'fase') return el
      return { ...el, fase: { ...el.fase, [campo]: valor } }
    }

    if (ubicacion.nivel === 'grupo') {
      if (ubicacion.grupoIndex !== i || el.tipo !== 'grupo') return el
      return {
        ...el,
        grupo: {
          ...el.grupo,
          fases: el.grupo.fases.map((f, fi) =>
            fi === ubicacion.faseIndex ? { ...f, [campo]: valor } : f
          )
        }
      }
    }

    return el
  })
}

export function actualizarNombreGrupo(
  elementos: ElementoEstructuraTorneo[],
  grupoIndex: number,
  nombre: string
): ElementoEstructuraTorneo[] {
  return elementos.map((el, i) => {
    if (i !== grupoIndex || el.tipo !== 'grupo') return el
    return { ...el, grupo: { ...el.grupo, nombre } }
  })
}

export function eliminarFaseDeElementos(
  elementos: ElementoEstructuraTorneo[],
  ubicacion:
    | { nivel: 'top'; index: number }
    | { nivel: 'grupo'; grupoIndex: number; faseIndex: number }
): ElementoEstructuraTorneo[] {
  if (ubicacion.nivel === 'top') {
    const filtrados = elementos.filter((_, i) => i !== ubicacion.index)
    return renumerarElementosTopLevel(filtrados)
  }

  return renumerarElementosTopLevel(
    elementos.map((el, i) => {
      if (i !== ubicacion.grupoIndex || el.tipo !== 'grupo') return el
      const fases = el.grupo.fases.filter((_, fi) => fi !== ubicacion.faseIndex)
      return {
        ...el,
        grupo: { ...el.grupo, fases: renumerarFasesGrupo(fases) }
      }
    })
  )
}

export function indiceFaseTopLevelPorId(
  elementos: ElementoEstructuraTorneo[],
  faseId: number
): number {
  return elementos.findIndex(
    (el) => el.tipo === 'fase' && el.fase.id === faseId
  )
}
