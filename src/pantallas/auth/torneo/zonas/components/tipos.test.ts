import { EquipoDeLaZonaDTO, EquipoDTO, IZonaDTO, ZonaDTO } from '@/api/clients'
import { describe, expect, it } from 'vitest'
import {
  aplicarAgregarEquipoAZona,
  idSortableZona,
  validarZonasParaGuardar,
  zonaDtoAEstado,
  zonaEstadoADto
} from './tipos'

// ---------------------------------------------------------------------------
// validarZonasParaGuardar
// ---------------------------------------------------------------------------

describe('validarZonasParaGuardar', () => {
  it('devuelve válido para zonas con nombres únicos', () => {
    const zonas = [
      { nombre: 'Zona A', equipos: [] },
      { nombre: 'Zona B', equipos: [] }
    ]
    expect(validarZonasParaGuardar(zonas).valido).toBe(true)
  })

  it('devuelve inválido si hay nombres duplicados exactos', () => {
    const zonas = [
      { nombre: 'Zona A', equipos: [] },
      { nombre: 'Zona A', equipos: [] }
    ]
    const resultado = validarZonasParaGuardar(zonas)
    expect(resultado.valido).toBe(false)
    expect(resultado.mensaje).toBeDefined()
  })

  it('la comparación de duplicados es case-insensitive', () => {
    const zonas = [
      { nombre: 'zona a', equipos: [] },
      { nombre: 'ZONA A', equipos: [] }
    ]
    expect(validarZonasParaGuardar(zonas).valido).toBe(false)
  })

  it('la comparación ignora espacios al inicio y final', () => {
    const zonas = [
      { nombre: '  Zona A  ', equipos: [] },
      { nombre: 'zona a', equipos: [] }
    ]
    expect(validarZonasParaGuardar(zonas).valido).toBe(false)
  })

  it('devuelve válido para lista vacía', () => {
    expect(validarZonasParaGuardar([]).valido).toBe(true)
  })

  it('devuelve válido para una sola zona', () => {
    expect(
      validarZonasParaGuardar([{ nombre: 'Zona A', equipos: [] }]).valido
    ).toBe(true)
  })

  it('devuelve inválido si un equipo está en dos zonas (todos contra todos)', () => {
    const equipo = new EquipoDTO({
      id: 1,
      nombre: 'Equipo 1',
      clubId: 1,
      zonas: []
    })
    const zonas = [
      { nombre: 'Zona A', equipos: [equipo] },
      { nombre: 'Zona B', equipos: [equipo] }
    ]
    const resultado = validarZonasParaGuardar(zonas)
    expect(resultado.valido).toBe(false)
    expect(resultado.mensaje).toContain('repetidos')
  })

  it('permite equipos repetidos entre zonas en eliminación directa', () => {
    const equipo = new EquipoDTO({
      id: 1,
      nombre: 'Equipo 1',
      clubId: 1,
      zonas: []
    })
    const zonas = [
      { nombre: 'Cat A', equipos: [equipo] },
      { nombre: 'Cat B', equipos: [equipo] }
    ]
    expect(
      validarZonasParaGuardar(zonas, {
        permitirEquiposRepetidosEntreZonas: true
      }).valido
    ).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// aplicarAgregarEquipoAZona
// ---------------------------------------------------------------------------

describe('aplicarAgregarEquipoAZona', () => {
  const equipo = new EquipoDTO({
    id: 10,
    nombre: 'Equipo X',
    clubId: 1,
    zonas: []
  })

  it('en todos contra todos mueve el equipo desde otra zona', () => {
    const zonas = [
      { nombre: 'Zona A', equipos: [equipo] },
      { nombre: 'Zona B', equipos: [] }
    ]
    const resultado = aplicarAgregarEquipoAZona(zonas, 1, equipo)
    expect(resultado[0].equipos).toHaveLength(0)
    expect(resultado[1].equipos).toHaveLength(1)
  })

  it('en eliminación directa conserva el equipo en la zona origen', () => {
    const zonas = [
      { nombre: 'Cat A', equipos: [equipo] },
      { nombre: 'Cat B', equipos: [] }
    ]
    const resultado = aplicarAgregarEquipoAZona(zonas, 1, equipo, {
      permitirEquiposRepetidosEntreZonas: true
    })
    expect(resultado[0].equipos).toHaveLength(1)
    expect(resultado[1].equipos).toHaveLength(1)
  })

  it('no duplica el equipo en la misma zona', () => {
    const zonas = [{ nombre: 'Zona A', equipos: [equipo] }]
    const resultado = aplicarAgregarEquipoAZona(zonas, 0, equipo, {
      permitirEquiposRepetidosEntreZonas: true
    })
    expect(resultado[0].equipos).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// zonaDtoAEstado
// ---------------------------------------------------------------------------

describe('zonaDtoAEstado', () => {
  it('preserva id y nombre del DTO', () => {
    const dto = new ZonaDTO({
      id: 5,
      nombre: 'Zona Norte',
      faseId: 1,
      orden: 1,
      equipos: []
    })
    const estado = zonaDtoAEstado(dto)
    expect(estado.id).toBe(5)
    expect(estado.nombre).toBe('Zona Norte')
  })

  it('convierte equipos del DTO a EquipoDTO en el estado', () => {
    const dto = new ZonaDTO({
      id: 1,
      nombre: 'Zona A',
      faseId: 100,
      orden: 1,
      equipos: [
        EquipoDeLaZonaDTO.fromJS({
          id: '7',
          nombre: 'Infantil C',
          club: 'Club X',
          codigo: 'C003'
        })
      ]
    })
    const estado = zonaDtoAEstado(dto)
    expect(estado.equipos).toHaveLength(1)
    expect(estado.equipos[0].id).toBe(7)
    expect(estado.equipos[0].nombre).toBe('Infantil C')
    expect(estado.equipos[0].clubNombre).toBe('Club X')
  })

  it('maneja lista de equipos vacía', () => {
    const dto = new ZonaDTO({
      id: 1,
      nombre: 'Zona A',
      faseId: 1,
      orden: 1,
      equipos: []
    })
    const estado = zonaDtoAEstado(dto)
    expect(estado.equipos).toHaveLength(0)
  })

  it('usa "Zona" como nombre por defecto si el DTO no tiene nombre', () => {
    // Omitir nombre intencionalmente para probar el valor por defecto
    const dto = new ZonaDTO({
      id: 2,
      faseId: 1,
      orden: 1,
      equipos: []
    } as unknown as IZonaDTO)
    const estado = zonaDtoAEstado(dto)
    expect(estado.nombre).toBe('Zona')
  })
})

// ---------------------------------------------------------------------------
// zonaEstadoADto
// ---------------------------------------------------------------------------

describe('zonaEstadoADto', () => {
  it('zona existente (con id) preserva el id en el DTO', () => {
    const zona = { id: 3, nombre: 'Zona Sur', equipos: [] }
    const dto = zonaEstadoADto(zona, 100, 2)
    expect(dto.id).toBe(3)
    expect(dto.nombre).toBe('Zona Sur')
    expect(dto.faseId).toBe(100)
    expect(dto.orden).toBe(2)
  })

  it('zona nueva (sin id) no incluye id en el DTO', () => {
    const zona = { nombre: 'Nueva Zona', equipos: [] }
    const dto = zonaEstadoADto(zona, 100, 1)
    expect(dto.id).toBeUndefined()
    expect(dto.orden).toBe(1)
  })

  it('convierte equipos EquipoDTO a EquipoDeLaZonaDTO con id como string', () => {
    const equipo = new EquipoDTO({
      id: 7,
      nombre: 'Infantil C',
      codigoAlfanumerico: 'C003',
      clubNombre: 'Club Z',
      clubId: 1,
      zonas: []
    })
    const zona = { id: 1, nombre: 'Zona A', equipos: [equipo] }
    const dto = zonaEstadoADto(zona, 100, 1)
    expect(dto.equipos).toHaveLength(1)
    expect(dto.equipos![0].id).toBe('7')
    expect(dto.equipos![0].nombre).toBe('Infantil C')
    expect(dto.equipos![0].club).toBe('Club Z')
    expect(dto.equipos![0].codigo).toBe('C003')
  })

  it('zona con lista de equipos vacía genera DTO con equipos vacíos', () => {
    const zona = { id: 1, nombre: 'Zona A', equipos: [] }
    const dto = zonaEstadoADto(zona, 100, 3)
    expect(dto.equipos).toHaveLength(0)
    expect(dto.orden).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// idSortableZona
// ---------------------------------------------------------------------------

describe('idSortableZona', () => {
  it('usa id de servidor cuando existe', () => {
    expect(idSortableZona({ id: 42, nombre: 'A', equipos: [] })).toBe('zona-42')
  })

  it('usa clientKey cuando no hay id', () => {
    expect(
      idSortableZona({
        nombre: 'A',
        equipos: [],
        clientKey: 'ck-abc'
      })
    ).toBe('ck-abc')
  })
})
