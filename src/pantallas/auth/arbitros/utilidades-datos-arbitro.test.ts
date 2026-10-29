import {
  ArbitroDTO,
  FranjaHorariaArbitroEnum,
  TipoMovilidadArbitroEnum
} from '@/api/clients'
import { describe, expect, it } from 'vitest'
import {
  datosAdicionalesDesdeArbitro,
  datosAdicionalesParaBackend,
  fechaDesdeInput,
  fechaParaInput,
  FRANJAS_HORARIAS,
  mismosDatosAdicionales,
  textoRelacionInstitucional,
  textosFranjasHorarias,
  textoTipoMovilidad,
  TIPOS_MOVILIDAD,
  validarDatosAdicionales
} from './utilidades-datos-arbitro'

describe('textos de enums', () => {
  it('tiene un texto para cada tipo de movilidad', () => {
    expect(TIPOS_MOVILIDAD).toEqual(
      Object.values(TipoMovilidadArbitroEnum).filter(
        (v) => typeof v === 'number'
      )
    )
    expect(textoTipoMovilidad(TipoMovilidadArbitroEnum._4)).toBe(
      'Transporte público'
    )
  })

  it('tiene un texto para cada franja horaria', () => {
    expect(FRANJAS_HORARIAS).toEqual(
      Object.values(FranjaHorariaArbitroEnum).filter(
        (v) => typeof v === 'number'
      )
    )
  })

  it('muestra un guion si no hay movilidad', () => {
    expect(textoTipoMovilidad(undefined)).toBe('—')
  })

  it('ordena las franjas y quita repetidas', () => {
    expect(
      textosFranjasHorarias([
        FranjaHorariaArbitroEnum._5,
        FranjaHorariaArbitroEnum._1,
        FranjaHorariaArbitroEnum._5
      ])
    ).toEqual(['Sábados de 8 a 14', 'Martes a viernes de 20 a 23:30'])
  })
})

describe('textoRelacionInstitucional', () => {
  it('distingue sin dato, no y sí con institución', () => {
    expect(textoRelacionInstitucional(undefined, undefined)).toBe('—')
    expect(textoRelacionInstitucional(false, 'Club X')).toBe('No')
    expect(textoRelacionInstitucional(true, ' Club X ')).toBe('Sí: Club X')
    expect(textoRelacionInstitucional(true, '')).toBe('Sí')
  })
})

describe('fechas', () => {
  it('convierte una fecha local a yyyy-mm-dd', () => {
    expect(fechaParaInput(new Date(2001, 0, 5))).toBe('2001-01-05')
    expect(fechaParaInput(undefined)).toBe('')
  })

  it('convierte yyyy-mm-dd a medianoche UTC', () => {
    expect(fechaDesdeInput('2001-01-05')?.toISOString()).toBe(
      '2001-01-05T00:00:00.000Z'
    )
    expect(fechaDesdeInput('')).toBeUndefined()
  })
})

describe('datos adicionales', () => {
  const arbitro = new ArbitroDTO({
    id: 1,
    dni: '30111222',
    nombre: 'Juan',
    apellido: 'Uno',
    direccion: 'Calle 1',
    localidad: 'Rosario',
    fechaNacimiento: new Date('2001-01-05T00:00:00'),
    tipoMovilidad: TipoMovilidadArbitroEnum._2,
    franjasHorarias: [FranjaHorariaArbitroEnum._3, FranjaHorariaArbitroEnum._1],
    tieneRelacionInstitucional: true,
    institucion: 'Club X'
  })

  it('manda al back todos los datos que ya tenía el árbitro', () => {
    const backend = datosAdicionalesParaBackend(
      datosAdicionalesDesdeArbitro(arbitro)
    )

    expect(backend).toEqual({
      direccion: 'Calle 1',
      localidad: 'Rosario',
      fechaNacimiento: new Date('2001-01-05T00:00:00.000Z'),
      tipoMovilidad: TipoMovilidadArbitroEnum._2,
      franjasHorarias: [
        FranjaHorariaArbitroEnum._1,
        FranjaHorariaArbitroEnum._3
      ],
      tieneRelacionInstitucional: true,
      institucion: 'Club X'
    })
  })

  it('manda vacíos como undefined y no manda institución si no tiene relación', () => {
    const backend = datosAdicionalesParaBackend({
      ...datosAdicionalesDesdeArbitro(arbitro),
      direccion: '  ',
      tieneRelacionInstitucional: false
    })

    expect(backend.direccion).toBeUndefined()
    expect(backend.institucion).toBeUndefined()
  })

  it('arranca vacío para un árbitro sin datos', () => {
    expect(datosAdicionalesDesdeArbitro(undefined)).toEqual({
      direccion: '',
      localidad: '',
      fechaNacimiento: '',
      tipoMovilidad: undefined,
      franjasHorarias: [],
      tieneRelacionInstitucional: undefined,
      institucion: ''
    })
  })

  it('detecta cambios ignorando el orden de las franjas', () => {
    const inicial = datosAdicionalesDesdeArbitro(arbitro)

    expect(
      mismosDatosAdicionales(inicial, {
        ...inicial,
        franjasHorarias: [...inicial.franjasHorarias].reverse()
      })
    ).toBe(true)
    expect(
      mismosDatosAdicionales(inicial, { ...inicial, localidad: 'Funes' })
    ).toBe(false)
  })

  it('pide la institución si tiene relación institucional', () => {
    const datos = {
      ...datosAdicionalesDesdeArbitro(undefined),
      tieneRelacionInstitucional: true
    }
    expect(validarDatosAdicionales(datos)).toBe('Indicá la institución')
    expect(
      validarDatosAdicionales({ ...datos, institucion: 'Club X' })
    ).toBeUndefined()
  })
})
