import type { UsuarioAccesoModuloDTO } from '@/api/clients'
import {
  ModuloSistema as ModuloSistemaApi,
  NivelAcceso as NivelAccesoApi,
  UsuarioAccesoModuloDTO as UsuarioAccesoModuloDTOClass
} from '@/api/clients'

export enum ModuloSistema {
  Torneos = 1,
  Clubes = 2,
  Equipos = 3,
  Jugadores = 4,
  Delegados = 5,
  Arbitros = 6,
  Reportes = 7,
  Configuracion = 8
}

export enum NivelAcceso {
  Edicion = 1,
  ControlTotal = 2
}

export type PermisoModulo = {
  modulo: ModuloSistema
  nivel: NivelAcceso
}

function moduloDesdeApi(modulo: ModuloSistemaApi): ModuloSistema {
  return modulo as number as ModuloSistema
}

function nivelDesdeApi(nivel: NivelAccesoApi): NivelAcceso {
  return nivel as number as NivelAcceso
}

function moduloParaApi(modulo: ModuloSistema): ModuloSistemaApi {
  return modulo as number as ModuloSistemaApi
}

function nivelParaApi(nivel: NivelAcceso): NivelAccesoApi {
  return nivel as number as NivelAccesoApi
}

export const MODULOS_SISTEMA: {
  modulo: ModuloSistema
  etiqueta: string
}[] = [
  { modulo: ModuloSistema.Torneos, etiqueta: 'Torneos' },
  { modulo: ModuloSistema.Clubes, etiqueta: 'Clubes' },
  { modulo: ModuloSistema.Equipos, etiqueta: 'Equipos' },
  { modulo: ModuloSistema.Jugadores, etiqueta: 'Jugadores' },
  { modulo: ModuloSistema.Delegados, etiqueta: 'Delegados' },
  { modulo: ModuloSistema.Arbitros, etiqueta: 'Árbitros' },
  { modulo: ModuloSistema.Reportes, etiqueta: 'Reportes' },
  { modulo: ModuloSistema.Configuracion, etiqueta: 'Configuración' }
]

export function normalizarPermisos(
  permisos?: UsuarioAccesoModuloDTO[] | null
): PermisoModulo[] {
  if (!permisos?.length) return []

  return permisos
    .filter(
      (p) =>
        p.modulo != null &&
        p.nivel != null &&
        p.modulo >= ModuloSistema.Torneos &&
        p.modulo <= ModuloSistema.Configuracion
    )
    .map((p) => ({
      modulo: moduloDesdeApi(p.modulo!),
      nivel: nivelDesdeApi(p.nivel!)
    }))
}

export function permisosDesdeClaimJson(json?: string): PermisoModulo[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json) as Array<{
      Modulo?: number
      Nivel?: number
      modulo?: number
      nivel?: number
    }>
    return parsed
      .filter(
        (p) => (p.Modulo ?? p.modulo) != null && (p.Nivel ?? p.nivel) != null
      )
      .map((p) => ({
        modulo: (p.Modulo ?? p.modulo) as ModuloSistema,
        nivel: (p.Nivel ?? p.nivel) as NivelAcceso
      }))
  } catch {
    return []
  }
}

export function tieneAccesoAModulo(
  permisos: PermisoModulo[],
  modulo: ModuloSistema,
  esSuperAdministrador: boolean
): boolean {
  if (esSuperAdministrador) return true
  return permisos.some((p) => p.modulo === modulo)
}

export function puedeEditarModulo(
  permisos: PermisoModulo[],
  modulo: ModuloSistema,
  esSuperAdministrador: boolean
): boolean {
  if (esSuperAdministrador) return true
  return permisos.some(
    (p) =>
      p.modulo === modulo &&
      (p.nivel === NivelAcceso.Edicion || p.nivel === NivelAcceso.ControlTotal)
  )
}

export function puedeEliminarEnModulo(
  permisos: PermisoModulo[],
  modulo: ModuloSistema,
  esSuperAdministrador: boolean
): boolean {
  if (esSuperAdministrador) return true
  return permisos.some(
    (p) => p.modulo === modulo && p.nivel === NivelAcceso.ControlTotal
  )
}

export function aDtoAccesosModulo(
  seleccion: Partial<Record<ModuloSistema, NivelAcceso | null>>
): UsuarioAccesoModuloDTO[] {
  return MODULOS_SISTEMA.flatMap(({ modulo }) => {
    const nivel = seleccion[modulo]
    if (nivel == null) return []
    return [
      new UsuarioAccesoModuloDTOClass({
        modulo: moduloParaApi(modulo),
        nivel: nivelParaApi(nivel)
      })
    ]
  })
}

export function seleccionDesdeAccesos(
  accesos?: UsuarioAccesoModuloDTO[] | null
): Partial<Record<ModuloSistema, NivelAcceso | null>> {
  const mapa: Partial<Record<ModuloSistema, NivelAcceso | null>> = {}
  for (const { modulo } of MODULOS_SISTEMA) {
    mapa[modulo] = null
  }
  for (const acceso of accesos ?? []) {
    if (acceso.modulo != null && acceso.nivel != null) {
      mapa[moduloDesdeApi(acceso.modulo)] = nivelDesdeApi(acceso.nivel)
    }
  }
  return mapa
}
