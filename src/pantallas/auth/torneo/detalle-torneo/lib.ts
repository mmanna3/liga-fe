import {
  FaseCategoriaDTO,
  TorneoCategoriaDTO,
  TipoDeFaseEnum
} from '@/api/clients'
import type { OpcionSelector } from '@/design-system/ykn-ui/selector-simple'
import type { Categoria } from '../crear-torneo/tipos'

export function horarioParaInput(val?: string | null): string {
  if (!val) return ''
  return val.slice(0, 5)
}

export function formatearHorarioDeJuego(val?: string | null): string {
  if (!val) return '—'
  return val.slice(0, 5)
}

export const OPCIONES_FORMATO: OpcionSelector[] = [
  { id: 'todos-contra-todos', titulo: 'Todos contra todos' },
  { id: 'eliminacion-directa', titulo: 'Eliminación directa' }
]

export interface FaseEstado {
  id?: number
  numero: number
  nombre: string
  formato: string
  sePuedeEditar: boolean
}

export function tipoDeFaseAOpción(tipoDeFase?: TipoDeFaseEnum): string {
  if (tipoDeFase === TipoDeFaseEnum._1) return 'todos-contra-todos'
  if (tipoDeFase === TipoDeFaseEnum._2) return 'eliminacion-directa'
  return ''
}

export function tipoDeFaseNombreDesdeEnum(tipoDeFase?: TipoDeFaseEnum): string {
  if (tipoDeFase === TipoDeFaseEnum._1) return 'Todos contra todos'
  if (tipoDeFase === TipoDeFaseEnum._2) return 'Eliminación directa'
  return '—'
}

export function categoriasDtoACategoria(
  dtos: TorneoCategoriaDTO[]
): Categoria[] {
  return ordenarCategoriasDto(dtos).map((c, index) => ({
    id: String(c.id ?? `${Date.now()}-${Math.random()}`),
    nombre: c.nombre ?? '',
    anioDesde: String(c.anioDesde ?? ''),
    anioHasta: String(c.anioHasta ?? ''),
    orden: index + 1
  }))
}

function ordenarCategoriasDto<T extends { orden?: number; id?: number }>(
  dtos: T[]
): T[] {
  return [...(dtos ?? [])].sort((a, b) => {
    const ao = a.orden ?? Number.MAX_SAFE_INTEGER
    const bo = b.orden ?? Number.MAX_SAFE_INTEGER
    if (ao !== bo) return ao - bo
    return (a.id ?? 0) - (b.id ?? 0)
  })
}

export function faseCategoriasDtoACategoria(
  dtos: FaseCategoriaDTO[]
): Categoria[] {
  return ordenarCategoriasDto(dtos).map((c, index) => ({
    id: String(c.id ?? `${Date.now()}-${Math.random()}`),
    nombre: c.nombre ?? '',
    anioDesde: String(c.anioDesde ?? ''),
    anioHasta: String(c.anioHasta ?? ''),
    orden: index + 1
  }))
}

export function faseCategoriasACategoriaDto(
  cats: Categoria[],
  faseId?: number
): FaseCategoriaDTO[] {
  return categoriasACategoriaDto(cats).map(
    (c) =>
      new FaseCategoriaDTO({
        ...c,
        faseId
      })
  )
}

export function categoriasACategoriaDto(
  cats: Categoria[]
): TorneoCategoriaDTO[] {
  return cats
    .filter(
      (c) =>
        c.nombre.trim() !== '' &&
        c.anioDesde.trim() !== '' &&
        c.anioHasta.trim() !== ''
    )
    .sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id))
    .map((c, index) => {
      const idNum = parseInt(c.id, 10)
      const esCategoriaExistente =
        !isNaN(idNum) && idNum > 0 && idNum < 1_000_000_000
      return new TorneoCategoriaDTO({
        ...(esCategoriaExistente && { id: idNum }),
        nombre: c.nombre.trim(),
        anioDesde: parseInt(c.anioDesde, 10),
        anioHasta: parseInt(c.anioHasta, 10),
        orden: index + 1
      })
    })
}
