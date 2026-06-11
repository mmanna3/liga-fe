import { TorneoCategoriaDTO, TipoDeFaseEnum } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import {
  categoriasACategoriaDto,
  categoriasDtoACategoria,
  formatearHorarioDeJuego,
  horarioParaInput,
  tipoDeFaseAOpción,
  tipoDeFaseNombreDesdeEnum
} from './lib'

// ---------------------------------------------------------------------------
// horario
// ---------------------------------------------------------------------------

describe('horarioParaInput', () => {
  it('devuelve HH:mm desde un valor con segundos', () => {
    expect(horarioParaInput('20:30:00')).toBe('20:30')
  })

  it('devuelve vacío si no hay valor', () => {
    expect(horarioParaInput(null)).toBe('')
  })
})

describe('formatearHorarioDeJuego', () => {
  it('muestra el horario recortado', () => {
    expect(formatearHorarioDeJuego('18:45:00')).toBe('18:45')
  })

  it('muestra guión si no hay valor', () => {
    expect(formatearHorarioDeJuego(undefined)).toBe('—')
  })
})

// ---------------------------------------------------------------------------
// tipoDeFaseAOpción
// ---------------------------------------------------------------------------

describe('tipoDeFaseAOpción', () => {
  it('_1 → todos-contra-todos', () => {
    expect(tipoDeFaseAOpción(TipoDeFaseEnum._1)).toBe('todos-contra-todos')
  })

  it('_2 → eliminacion-directa', () => {
    expect(tipoDeFaseAOpción(TipoDeFaseEnum._2)).toBe('eliminacion-directa')
  })

  it('undefined → string vacío', () => {
    expect(tipoDeFaseAOpción(undefined)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// tipoDeFaseNombreDesdeEnum
// ---------------------------------------------------------------------------

describe('tipoDeFaseNombreDesdeEnum', () => {
  it('_1 → "Todos contra todos"', () => {
    expect(tipoDeFaseNombreDesdeEnum(TipoDeFaseEnum._1)).toBe(
      'Todos contra todos'
    )
  })

  it('_2 → "Eliminación directa"', () => {
    expect(tipoDeFaseNombreDesdeEnum(TipoDeFaseEnum._2)).toBe(
      'Eliminación directa'
    )
  })

  it('undefined → guión', () => {
    expect(tipoDeFaseNombreDesdeEnum(undefined)).toBe('—')
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
        orden: 1,
        torneoId: 1
      })
    ]
    const result = categoriasDtoACategoria(dtos)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('42')
    expect(result[0].nombre).toBe('Sub 12')
    expect(result[0].anioDesde).toBe('2014')
    expect(result[0].anioHasta).toBe('2015')
    expect(result[0].orden).toBe(1)
  })

  it('maneja array vacío', () => {
    expect(categoriasDtoACategoria([])).toEqual([])
  })

  it('DTO sin id genera un id no vacío', () => {
    const dtos = [
      new TorneoCategoriaDTO({
        nombre: 'Mayores',
        anioDesde: 1990,
        anioHasta: 2005,
        orden: 1
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
        anioHasta: 2010,
        orden: 1
      })
    ]
    const result = categoriasDtoACategoria(dtos)
    expect(result[0].anioDesde).toBe('2006')
    expect(result[0].anioHasta).toBe('2010')
    expect(result[0].orden).toBe(1)
  })

  it('ordena por el campo orden del DTO', () => {
    const dtos = [
      new TorneoCategoriaDTO({
        id: 2,
        nombre: 'Segunda',
        anioDesde: 2010,
        anioHasta: 2011,
        orden: 2
      }),
      new TorneoCategoriaDTO({
        id: 1,
        nombre: 'Primera',
        anioDesde: 2008,
        anioHasta: 2009,
        orden: 1
      })
    ]
    const result = categoriasDtoACategoria(dtos)
    expect(result.map((c) => c.nombre)).toEqual(['Primera', 'Segunda'])
    expect(result.map((c) => c.orden)).toEqual([1, 2])
  })
})

// ---------------------------------------------------------------------------
// categoriasACategoriaDto
// ---------------------------------------------------------------------------

describe('categoriasACategoriaDto', () => {
  it('categoría existente (id < 1B) preserva el id numérico', () => {
    const cats = [
      {
        id: '42',
        nombre: 'Sub 15',
        anioDesde: '2011',
        anioHasta: '2012',
        orden: 1
      }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(42)
    expect(result[0].nombre).toBe('Sub 15')
    expect(result[0].anioDesde).toBe(2011)
    expect(result[0].anioHasta).toBe(2012)
    expect(result[0].orden).toBe(1)
  })

  it('categoría nueva (id ≥ 1B, como Date.now()) no incluye id', () => {
    // Date.now() genera IDs del orden de 1.7 billones, que superan el límite
    const cats = [
      {
        id: '9999999999999',
        nombre: 'Sub 10',
        anioDesde: '2016',
        anioHasta: '2017',
        orden: 1
      }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBeUndefined()
  })

  it('filtra categorías con nombre vacío', () => {
    const cats = [
      {
        id: '1',
        nombre: '',
        anioDesde: '2014',
        anioHasta: '2015',
        orden: 1
      },
      {
        id: '2',
        nombre: 'Sub 12',
        anioDesde: '2014',
        anioHasta: '2015',
        orden: 2
      }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Sub 12')
  })

  it('filtra categorías con año vacío', () => {
    const cats = [
      {
        id: '1',
        nombre: 'Sub 12',
        anioDesde: '',
        anioHasta: '2015',
        orden: 1
      },
      {
        id: '2',
        nombre: 'Sub 14',
        anioDesde: '2012',
        anioHasta: '',
        orden: 2
      }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result).toHaveLength(0)
  })

  it('maneja array vacío', () => {
    expect(categoriasACategoriaDto([])).toEqual([])
  })

  it('trimea el nombre al convertir', () => {
    const cats = [
      {
        id: '1',
        nombre: '  Sub 18  ',
        anioDesde: '2008',
        anioHasta: '2010',
        orden: 1
      }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result[0].nombre).toBe('Sub 18')
  })

  it('ordena por orden y renumera al convertir', () => {
    const cats = [
      {
        id: '2',
        nombre: 'B',
        anioDesde: '2010',
        anioHasta: '2011',
        orden: 2
      },
      {
        id: '1',
        nombre: 'A',
        anioDesde: '2008',
        anioHasta: '2009',
        orden: 1
      }
    ]
    const result = categoriasACategoriaDto(cats)
    expect(result.map((r) => r.nombre)).toEqual(['A', 'B'])
    expect(result.map((r) => r.orden)).toEqual([1, 2])
  })
})
