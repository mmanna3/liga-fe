import { TorneoCategoriaDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import {
  categoriasACategoriaDto,
  categoriasDtoACategoria,
  formatoIdAOpción,
  formatoNombreDesdeId
} from './lib'

// ---------------------------------------------------------------------------
// formatoIdAOpción
// ---------------------------------------------------------------------------

describe('formatoIdAOpción', () => {
  it('1 → todos-contra-todos', () => {
    expect(formatoIdAOpción(1)).toBe('todos-contra-todos')
  })

  it('2 → eliminacion-directa', () => {
    expect(formatoIdAOpción(2)).toBe('eliminacion-directa')
  })

  it('undefined → string vacío', () => {
    expect(formatoIdAOpción(undefined)).toBe('')
  })

  it('id desconocido → string vacío', () => {
    expect(formatoIdAOpción(99)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// formatoNombreDesdeId
// ---------------------------------------------------------------------------

describe('formatoNombreDesdeId', () => {
  it('1 → "Todos contra todos"', () => {
    expect(formatoNombreDesdeId(1)).toBe('Todos contra todos')
  })

  it('2 → "Eliminación directa"', () => {
    expect(formatoNombreDesdeId(2)).toBe('Eliminación directa')
  })

  it('undefined → guión', () => {
    expect(formatoNombreDesdeId(undefined)).toBe('—')
  })

  it('id desconocido → guión', () => {
    expect(formatoNombreDesdeId(99)).toBe('—')
  })
})

// ---------------------------------------------------------------------------
// categoriasDtoACategoria
// ---------------------------------------------------------------------------

describe('categoriasDtoACategoria', () => {
  it('convierte un DTO con id numérico a Categoria con id como string', () => {
    const dtos = [
      new TorneoCategoriaDTO({
        id: 42,
        nombre: 'Sub 12',
        anioDesde: 2014,
        anioHasta: 2015,
        torneoId: 1
      })
    ]
    const result = categoriasDtoACategoria(dtos)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('42')
    expect(result[0].nombre).toBe('Sub 12')
    expect(result[0].anioDesde).toBe('2014')
    expect(result[0].anioHasta).toBe('2015')
  })

  it('maneja array vacío', () => {
    expect(categoriasDtoACategoria([])).toEqual([])
  })

  it('DTO sin id genera un id no vacío', () => {
    const dtos = [
      new TorneoCategoriaDTO({
        nombre: 'Mayores',
        anioDesde: 1990,
        anioHasta: 2005
      })
    ]
    const result = categoriasDtoACategoria(dtos)
    expect(result[0].id).toBeTruthy()
  })

  it('convierte años a string correctamente', () => {
    const dtos = [
      new TorneoCategoriaDTO({
        id: 1,
        nombre: 'Sub 20',
        anioDesde: 2006,
        anioHasta: 2010
      })
    ]
    const result = categoriasDtoACategoria(dtos)
    expect(result[0].anioDesde).toBe('2006')
    expect(result[0].anioHasta).toBe('2010')
  })
})

// ---------------------------------------------------------------------------
// categoriasACategoriaDto
// ---------------------------------------------------------------------------

describe('categoriasACategoriaDto', () => {
  it('categoría existente (id < 1B) preserva el id numérico', () => {
    const cats = [
      { id: '42', nombre: 'Sub 15', anioDesde: '2011', anioHasta: '2012' }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(42)
    expect(result[0].nombre).toBe('Sub 15')
    expect(result[0].anioDesde).toBe(2011)
    expect(result[0].anioHasta).toBe(2012)
  })

  it('categoría nueva (id ≥ 1B, como Date.now()) no incluye id', () => {
    // Date.now() genera IDs del orden de 1.7 billones, que superan el límite
    const cats = [
      {
        id: '9999999999999',
        nombre: 'Sub 10',
        anioDesde: '2016',
        anioHasta: '2017'
      }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBeUndefined()
  })

  it('filtra categorías con nombre vacío', () => {
    const cats = [
      { id: '1', nombre: '', anioDesde: '2014', anioHasta: '2015' },
      { id: '2', nombre: 'Sub 12', anioDesde: '2014', anioHasta: '2015' }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Sub 12')
  })

  it('filtra categorías con año vacío', () => {
    const cats = [
      { id: '1', nombre: 'Sub 12', anioDesde: '', anioHasta: '2015' },
      { id: '2', nombre: 'Sub 14', anioDesde: '2012', anioHasta: '' }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(0)
  })

  it('maneja array vacío', () => {
    expect(categoriasACategoriaDto([])).toEqual([])
  })

  it('trimea el nombre al convertir', () => {
    const cats = [
      { id: '1', nombre: '  Sub 18  ', anioDesde: '2008', anioHasta: '2010' }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result[0].nombre).toBe('Sub 18')
  })
})
