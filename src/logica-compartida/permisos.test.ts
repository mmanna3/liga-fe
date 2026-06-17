/**
 * @vitest-environment jsdom
 */
import {
  ModuloSistema,
  NivelAcceso,
  puedeEditarModulo,
  puedeEliminarEnModulo,
  tieneAccesoAModulo
} from '@/logica-compartida/permisos'
import { describe, expect, it } from 'vitest'

const permisosTorneosEdicion = [
  { modulo: ModuloSistema.Torneos, nivel: NivelAcceso.Edicion }
]

describe('permisos helpers', () => {
  it('tieneAccesoModulo con permiso devuelve true', () => {
    expect(
      tieneAccesoAModulo(permisosTorneosEdicion, ModuloSistema.Torneos, false)
    ).toBe(true)
  })

  it('tieneAccesoModulo sin permiso devuelve false', () => {
    expect(
      tieneAccesoAModulo(permisosTorneosEdicion, ModuloSistema.Clubes, false)
    ).toBe(false)
  })

  it('puedeEliminar solo con control total', () => {
    expect(
      puedeEliminarEnModulo(
        permisosTorneosEdicion,
        ModuloSistema.Torneos,
        false
      )
    ).toBe(false)
    expect(
      puedeEliminarEnModulo(
        [{ modulo: ModuloSistema.Torneos, nivel: NivelAcceso.ControlTotal }],
        ModuloSistema.Torneos,
        false
      )
    ).toBe(true)
  })

  it('super administrador bypass', () => {
    expect(tieneAccesoAModulo([], ModuloSistema.Clubes, true)).toBe(true)
    expect(puedeEditarModulo([], ModuloSistema.Clubes, true)).toBe(true)
    expect(puedeEliminarEnModulo([], ModuloSistema.Clubes, true)).toBe(true)
  })
})
