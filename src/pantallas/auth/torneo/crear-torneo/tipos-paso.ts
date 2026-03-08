import type { ComponentType } from 'react'
import type { DatosWizardTorneo } from './tipos'

/**
 * Cada paso "posee" un subconjunto de DatosWizardTorneo.
 * Usamos Pick para que TDatos sea siempre compatible con DatosWizardTorneo.
 */
export type DatosPaso1 = Pick<
  DatosWizardTorneo,
  'nombre' | 'temporada' | 'tipo' | 'categorias' | 'formato'
>

export type DatosPaso2 = Pick<
  DatosWizardTorneo,
  'fases' | 'sumarPuntosAnuales' | 'indiceFaseActual'
>

export type DatosPaso3 = Pick<
  DatosWizardTorneo,
  | 'cantidadEquipos'
  | 'equiposSeleccionados'
  | 'modoBusqueda'
  | 'filtroAnio'
  | 'filtroTipo'
  | 'filtroTorneo'
  | 'filtroFase'
  | 'filtroZona'
>

export type DatosPaso4 = Pick<
  DatosWizardTorneo,
  'zonas' | 'cantidadZonas' | 'prevenirMismoClub'
>

export type DatosPaso5 = Pick<
  DatosWizardTorneo,
  | 'fechasLibres'
  | 'fechasInterzonales'
  | 'fixtureGenerado'
  | 'prevenirChoquesDeClub'
>

export type DatosPaso6 = Pick<DatosWizardTorneo, 'estado'>

/**
 * Contrato que todo paso del wizard debe cumplir.
 *
 * TDatos es el subconjunto de DatosWizardTorneo que este paso "posee":
 *   - obtenerDatos() lo extrae del form (para snapshot y reversion)
 *   - obtenerDefaults() devuelve los valores vacíos (para limpiar pasos siguientes)
 *
 * validar() recibe el form completo porque algunos pasos necesitan
 * datos de pasos anteriores para validar (ej: paso 4 necesita equiposSeleccionados).
 */
export interface IPaso<
  TDatos extends Partial<DatosWizardTorneo> = Partial<DatosWizardTorneo>
> {
  readonly numero: number
  readonly titulo: string
  readonly tituloCorto: string
  readonly Componente: ComponentType
  obtenerDatos(form: DatosWizardTorneo): TDatos
  validar(form: DatosWizardTorneo): Promise<void>
  obtenerDefaults(): TDatos
}
