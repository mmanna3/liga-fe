import type { FaseDTO, GrupoDeFasesDTO } from '@/api/clients'
import type { EstructuraFasesItemPayload } from '@/api/estructura-fases-api'
import { arrayMove } from '@dnd-kit/sortable'
import { tipoDeFaseAOpción, type FaseEstado } from '../../../lib'
import type { ElementoEstructuraTorneo, GrupoDeFasesEstado } from './tipos'

export const PREFIJO_DRAG_FASE_TOP = 'top-fase-'
export const PREFIJO_DRAG_GRUPO_TOP = 'top-grupo-'
export const PREFIJO_DRAG_GRUPO_DROP = 'grupo-drop-'
export const PREFIJO_DRAG_FASE_GRUPO = 'grupo-fase-'
export const SEPARADOR_FASE_GRUPO = '::'

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

export function torneoAElementos(
  fases: FaseDTO[],
  grupos: GrupoDeFasesDTO[] = []
): ElementoEstructuraTorneo[] {
  return construirElementosDesdeApi(fases, grupos, null)
}

function construirElementosDesdeApi(
  fases: FaseDTO[],
  grupos: GrupoDeFasesDTO[],
  contenedorGrupoId: number | null
): ElementoEstructuraTorneo[] {
  type Item = { numero: number; id: number; el: ElementoEstructuraTorneo }
  const items: Item[] = []

  for (const f of fases.filter(
    (x) => (x.grupoDeFasesId ?? null) === contenedorGrupoId
  )) {
    items.push({
      numero: f.numero ?? 0,
      id: f.id ?? 0,
      el: { tipo: 'fase', fase: faseDtoAFaseEstado(f) }
    })
  }

  for (const g of grupos.filter(
    (x) => (x.grupoDeFasesPadreId ?? null) === contenedorGrupoId
  )) {
    items.push({
      numero: g.numero ?? 0,
      id: g.id ?? 0,
      el: {
        tipo: 'grupo',
        grupo: {
          id: g.id,
          idLocal: g.id != null ? `grupo-${g.id}` : generarIdLocal(),
          numero: g.numero ?? 0,
          nombre: g.nombre ?? 'Grupo de fases',
          grupoDeFasesPadreId: g.grupoDeFasesPadreId,
          elementos: construirElementosDesdeApi(fases, grupos, g.id ?? null)
        }
      }
    })
  }

  return items
    .sort((a, b) => a.numero - b.numero || a.id - b.id)
    .map((x, i) => renumerarElementoEnContenedor(x.el, i + 1))
}

function renumerarElementoEnContenedor(
  el: ElementoEstructuraTorneo,
  numero: number
): ElementoEstructuraTorneo {
  if (el.tipo === 'fase') {
    return { ...el, fase: { ...el.fase, numero } }
  }
  return {
    ...el,
    grupo: {
      ...el.grupo,
      numero,
      elementos: renumerarElementosEnContenedor(el.grupo.elementos)
    }
  }
}

export function renumerarElementosEnContenedor(
  elementos: ElementoEstructuraTorneo[]
): ElementoEstructuraTorneo[] {
  return elementos.map((el, index) =>
    renumerarElementoEnContenedor(el, index + 1)
  )
}

export function renumerarElementosTopLevel(
  elementos: ElementoEstructuraTorneo[]
): ElementoEstructuraTorneo[] {
  return renumerarElementosEnContenedor(elementos)
}

export function idDragFaseTopLevel(fase: FaseEstado): string {
  return `${PREFIJO_DRAG_FASE_TOP}${fase.id ?? fase.numero}`
}

export function idDragGrupoTopLevel(grupo: GrupoDeFasesEstado): string {
  return `${PREFIJO_DRAG_GRUPO_TOP}${grupo.idLocal}`
}

export function idTopLevelDesdeElemento(el: ElementoEstructuraTorneo): string {
  return el.tipo === 'fase'
    ? idDragFaseTopLevel(el.fase)
    : idDragGrupoTopLevel(el.grupo)
}

export function idDragGrupoDrop(
  grupoOrIdLocal: GrupoDeFasesEstado | string
): string {
  const idLocal =
    typeof grupoOrIdLocal === 'string' ? grupoOrIdLocal : grupoOrIdLocal.idLocal
  return `${PREFIJO_DRAG_GRUPO_DROP}${idLocal}`
}

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

export function parseGrupoIdLocalDesdeTopLevelDragId(
  dragId: string
): string | null {
  if (!dragId.startsWith(PREFIJO_DRAG_GRUPO_TOP)) return null
  return dragId.slice(PREFIJO_DRAG_GRUPO_TOP.length)
}

/** Resuelve el grupo destino desde cualquier id de drag/drop (zona, sortable, fase en grupo). */
export function parseGrupoIdLocalDesdeCualquierId(id: string): string | null {
  return (
    parseGrupoIdLocalDesdeDropId(id) ??
    parseGrupoIdLocalDesdeFaseGrupoId(id) ??
    parseGrupoIdLocalDesdeTopLevelDragId(id)
  )
}

export function parseFaseIdDesdeFaseGrupoDragId(dragId: string): number | null {
  if (!dragId.startsWith(PREFIJO_DRAG_FASE_GRUPO)) return null
  const rest = dragId.slice(PREFIJO_DRAG_FASE_GRUPO.length)
  const sep = rest.indexOf(SEPARADOR_FASE_GRUPO)
  if (sep < 0) return null
  const faseKey = rest.slice(sep + SEPARADOR_FASE_GRUPO.length)
  const id = parseInt(faseKey, 10)
  return Number.isNaN(id) ? null : id
}

export function contarFases(elementos: ElementoEstructuraTorneo[]): number {
  return elementos.reduce((acc, el) => {
    if (el.tipo === 'fase') return acc + 1
    return acc + contarFases(el.grupo.elementos)
  }, 0)
}

export function crearGrupoVacio(padreId?: number | null): GrupoDeFasesEstado {
  return {
    idLocal: generarIdLocal(),
    numero: 0,
    nombre: 'Grupo de fases',
    grupoDeFasesPadreId: padreId,
    elementos: []
  }
}

export function estructuraAItemsDto(
  elementos: ElementoEstructuraTorneo[]
): EstructuraFasesItemPayload[] {
  return elementos.map((el) => {
    if (el.tipo === 'fase') {
      return { tipo: 'fase' as const, faseId: el.fase.id! }
    }
    return {
      tipo: 'grupo' as const,
      grupoId: el.grupo.id!,
      items: estructuraAItemsDto(el.grupo.elementos)
    }
  })
}

export function mapGruposRecursivo(
  elementos: ElementoEstructuraTorneo[],
  fn: (grupo: GrupoDeFasesEstado) => GrupoDeFasesEstado
): ElementoEstructuraTorneo[] {
  return elementos.map((el) => {
    if (el.tipo !== 'grupo') return el
    const grupo = fn(el.grupo)
    return {
      ...el,
      grupo: {
        ...grupo,
        elementos: mapGruposRecursivo(grupo.elementos, fn)
      }
    }
  })
}

export function encontrarGrupoPorIdLocal(
  elementos: ElementoEstructuraTorneo[],
  idLocal: string
): GrupoDeFasesEstado | null {
  for (const el of elementos) {
    if (el.tipo === 'grupo') {
      if (el.grupo.idLocal === idLocal) return el.grupo
      const nested = encontrarGrupoPorIdLocal(el.grupo.elementos, idLocal)
      if (nested) return nested
    }
  }
  return null
}

export function encontrarPadreGrupoIdLocal(
  elementos: ElementoEstructuraTorneo[],
  grupoIdLocal: string,
  padreIdLocal: string | null = null
): string | null {
  for (const el of elementos) {
    if (el.tipo === 'grupo') {
      if (el.grupo.idLocal === grupoIdLocal) return padreIdLocal
      const nested = encontrarPadreGrupoIdLocal(
        el.grupo.elementos,
        grupoIdLocal,
        el.grupo.idLocal
      )
      if (nested != null) return nested
    }
  }
  return null
}

export function profundidadGrupo(
  idLocal: string,
  elementos: ElementoEstructuraTorneo[]
): number {
  function buscar(
    els: ElementoEstructuraTorneo[],
    profundidad: number
  ): number | null {
    for (const el of els) {
      if (el.tipo === 'grupo') {
        if (el.grupo.idLocal === idLocal) return profundidad
        const nested = buscar(el.grupo.elementos, profundidad + 1)
        if (nested != null) return nested
      }
    }
    return null
  }
  return buscar(elementos, 1) ?? 1
}

export function reordenarElementosEnContenedorPorIndices(
  elementos: ElementoEstructuraTorneo[],
  oldIndex: number,
  newIndex: number
): ElementoEstructuraTorneo[] {
  return renumerarElementosEnContenedor(
    arrayMove(elementos, oldIndex, newIndex)
  )
}

export function reordenarElementosTopLevelPorIndices(
  elementos: ElementoEstructuraTorneo[],
  oldIndex: number,
  newIndex: number
): ElementoEstructuraTorneo[] {
  return reordenarElementosEnContenedorPorIndices(elementos, oldIndex, newIndex)
}

export function reordenarEnGrupoPorIdLocal(
  elementos: ElementoEstructuraTorneo[],
  grupoIdLocal: string,
  oldIndex: number,
  newIndex: number
): ElementoEstructuraTorneo[] {
  return mapGruposRecursivo(elementos, (grupo) => {
    if (grupo.idLocal !== grupoIdLocal) return grupo
    return {
      ...grupo,
      elementos: reordenarElementosEnContenedorPorIndices(
        grupo.elementos,
        oldIndex,
        newIndex
      )
    }
  })
}

export function moverFaseTopLevelAGrupo(
  elementos: ElementoEstructuraTorneo[],
  faseTopId: string,
  grupoIdLocal: string,
  indiceEnGrupo?: number
): ElementoEstructuraTorneo[] {
  const faseId = parseInt(faseTopId, 10)
  if (Number.isNaN(faseId)) {
    const indiceFase = elementos.findIndex(
      (el) => el.tipo === 'fase' && String(el.fase.numero) === faseTopId
    )
    if (indiceFase < 0) return elementos
    const f = elementos[indiceFase]
    if (f.tipo !== 'fase' || f.fase.id == null) return elementos
    return moverFaseEntreContenedores(
      elementos,
      f.fase.id,
      grupoIdLocal,
      indiceEnGrupo
    )
  }
  return moverFaseEntreContenedores(
    elementos,
    faseId,
    grupoIdLocal,
    indiceEnGrupo
  )
}

export function moverFaseEntreContenedores(
  elementos: ElementoEstructuraTorneo[],
  faseId: number,
  destinoGrupoIdLocal: string | null,
  indiceEnDestino?: number
): ElementoEstructuraTorneo[] {
  let faseMovida: FaseEstado | undefined

  const quitarFase = (
    els: ElementoEstructuraTorneo[]
  ): ElementoEstructuraTorneo[] =>
    els
      .filter((el) => {
        if (el.tipo === 'fase' && el.fase.id === faseId) {
          faseMovida = el.fase
          return false
        }
        return true
      })
      .map((el) =>
        el.tipo === 'grupo'
          ? {
              ...el,
              grupo: {
                ...el.grupo,
                elementos: renumerarElementosEnContenedor(
                  quitarFase(el.grupo.elementos)
                )
              }
            }
          : el
      )

  const sinFase = renumerarElementosTopLevel(quitarFase(elementos))
  if (!faseMovida) return elementos

  const insertarEn = (
    els: ElementoEstructuraTorneo[],
    contenedorGrupoIdLocal: string | null
  ): ElementoEstructuraTorneo[] => {
    if (contenedorGrupoIdLocal === destinoGrupoIdLocal) {
      const nuevos = [...els]
      const insertAt =
        indiceEnDestino != null
          ? Math.min(Math.max(indiceEnDestino, 0), nuevos.length)
          : nuevos.length
      nuevos.splice(insertAt, 0, {
        tipo: 'fase',
        fase: { ...faseMovida!, numero: 0 }
      })
      return renumerarElementosEnContenedor(nuevos)
    }
    return els.map((el) =>
      el.tipo === 'grupo'
        ? {
            ...el,
            grupo: {
              ...el.grupo,
              elementos: insertarEn(el.grupo.elementos, el.grupo.idLocal)
            }
          }
        : el
    )
  }

  if (destinoGrupoIdLocal === null) {
    const top = [...sinFase]
    const insertAt =
      indiceEnDestino != null
        ? Math.min(Math.max(indiceEnDestino, 0), top.length)
        : top.length
    top.splice(insertAt, 0, {
      tipo: 'fase',
      fase: { ...faseMovida, numero: 0 }
    })
    return renumerarElementosTopLevel(top)
  }

  return renumerarElementosTopLevel(insertarEn(sinFase, null))
}

export function actualizarFaseEnElementos(
  elementos: ElementoEstructuraTorneo[],
  faseId: number,
  campo: string,
  valor: string
): ElementoEstructuraTorneo[] {
  return elementos.map((el) => {
    if (el.tipo === 'fase' && el.fase.id === faseId) {
      return { ...el, fase: { ...el.fase, [campo]: valor } }
    }
    if (el.tipo === 'grupo') {
      return {
        ...el,
        grupo: {
          ...el.grupo,
          elementos: actualizarFaseEnElementos(
            el.grupo.elementos,
            faseId,
            campo,
            valor
          )
        }
      }
    }
    return el
  })
}

export function actualizarNombreGrupo(
  elementos: ElementoEstructuraTorneo[],
  grupoIdLocal: string,
  nombre: string
): ElementoEstructuraTorneo[] {
  return mapGruposRecursivo(elementos, (grupo) =>
    grupo.idLocal === grupoIdLocal ? { ...grupo, nombre } : grupo
  )
}

export function eliminarFaseDeElementos(
  elementos: ElementoEstructuraTorneo[],
  faseId: number
): ElementoEstructuraTorneo[] {
  const filtrar = (
    els: ElementoEstructuraTorneo[]
  ): ElementoEstructuraTorneo[] =>
    els
      .filter((el) => !(el.tipo === 'fase' && el.fase.id === faseId))
      .map((el) =>
        el.tipo === 'grupo'
          ? {
              ...el,
              grupo: {
                ...el.grupo,
                elementos: renumerarElementosEnContenedor(
                  filtrar(el.grupo.elementos)
                )
              }
            }
          : el
      )

  return renumerarElementosTopLevel(filtrar(elementos))
}

export function eliminarGrupoDevolviendoFases(
  elementos: ElementoEstructuraTorneo[],
  grupoIdLocal: string
): ElementoEstructuraTorneo[] {
  const indiceGrupo = elementos.findIndex(
    (el) => el.tipo === 'grupo' && el.grupo.idLocal === grupoIdLocal
  )
  if (indiceGrupo >= 0) {
    const grupo = elementos[indiceGrupo]
    if (grupo.tipo !== 'grupo') return elementos
    const fasesSueltas = grupo.grupo.elementos.filter((e) => e.tipo === 'fase')
    return renumerarElementosTopLevel([
      ...elementos.slice(0, indiceGrupo),
      ...fasesSueltas,
      ...elementos.slice(indiceGrupo + 1)
    ])
  }

  return renumerarElementosTopLevel(
    elementos.map((el) =>
      el.tipo === 'grupo'
        ? {
            ...el,
            grupo: {
              ...el.grupo,
              elementos: eliminarGrupoDevolviendoFases(
                el.grupo.elementos,
                grupoIdLocal
              )
            }
          }
        : el
    )
  )
}

export function todosLosIdsFasePresentes(
  elementos: ElementoEstructuraTorneo[],
  totalFases: number
): boolean {
  const ids = recolectarFaseIds(elementos)
  return ids.length === totalFases && ids.every((id) => id > 0)
}

export function recolectarFaseIds(
  elementos: ElementoEstructuraTorneo[]
): number[] {
  const ids: number[] = []
  for (const el of elementos) {
    if (el.tipo === 'fase' && el.fase.id != null && el.fase.id > 0) {
      ids.push(el.fase.id)
    } else if (el.tipo === 'grupo') {
      ids.push(...recolectarFaseIds(el.grupo.elementos))
    }
  }
  return ids
}

export function buscarFaseEnElementos(
  elementos: ElementoEstructuraTorneo[],
  faseId: number
): FaseEstado | undefined {
  for (const el of elementos) {
    if (el.tipo === 'fase' && el.fase.id === faseId) return el.fase
    if (el.tipo === 'grupo') {
      const f = buscarFaseEnElementos(el.grupo.elementos, faseId)
      if (f) return f
    }
  }
  return undefined
}

/** @deprecated usar torneoAElementos */
export function torneoFasesAElementos(
  fases: FaseDTO[]
): ElementoEstructuraTorneo[] {
  return torneoAElementos(fases, [])
}
