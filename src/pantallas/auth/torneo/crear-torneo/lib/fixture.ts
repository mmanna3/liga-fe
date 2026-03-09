/**
 * Generación de fixture mediante round-robin con equipos fantasma.
 *
 * El fixture se genera POR ZONA. Cada zona tiene su propio round-robin
 * independiente. Se agregan L equipos "LIBRE" e I equipos "INTERZONAL"
 * como participantes fantasma al round-robin de cada zona (método círculo).
 *
 * Restricción: para cada zona, N_zona + L + I debe ser par.
 */

// Re-exports de tipos
export type {
  EntradaFixture,
  FechaFixture,
  EstadisticasEquipo,
  EstadisticasFixture,
  FixturePorZona,
  ValidacionZona,
  ValidacionEmparejamientoInterzonal,
  EntradaDeZona
} from './fixture-tipos'

// Re-exports de validación
export {
  esPotenciaDe2,
  esConfiguracionValida,
  esValidoParaEliminacion,
  validarZonas,
  validarEmparejamientoInterzonal,
  calcularTotalFechas,
  calcularTotalFechasPorZonas
} from './fixture-validacion'

// Re-exports de generación
export {
  generarFixture,
  generarTodosLosFixtures,
  fusionarYResolverInterzonal,
  calcularEstadisticasFixture,
  construirParticipantesEliminacion,
  intercambiarEquiposEnFecha,
  intercambiarParticipantesEnBracket
} from './fixture-generacion'

// ─── Aliases de compatibilidad con el código anterior ────────────────────────
// Mantenidos para no romper imports que usan los nombres anteriores en inglés.

export { esPotenciaDe2 as isPowerOf2 } from './fixture-validacion'
export { esConfiguracionValida as isValidConfiguration } from './fixture-validacion'
export { esValidoParaEliminacion as isValidForElimination } from './fixture-validacion'
export { validarZonas as validateZones } from './fixture-validacion'
export { validarEmparejamientoInterzonal as validateInterzonalPairing } from './fixture-validacion'
export { generarFixture as generateFixture } from './fixture-generacion'
export { generarTodosLosFixtures as generateAllFixtures } from './fixture-generacion'
export { fusionarYResolverInterzonal as mergeAndResolveInterzonal } from './fixture-generacion'

// Alias de tipo legado
export type { EntradaDeZona as ZoneInput } from './fixture-tipos'
export type { ValidacionZona as ZoneValidation } from './fixture-tipos'
export type { ValidacionEmparejamientoInterzonal as InterzonalPairingValidation } from './fixture-tipos'
export type { FixturePorZona as ZoneFixture } from './fixture-tipos'
export type { EntradaFixture as FixtureEntry } from './fixture-tipos'
export type { FechaFixture as FixtureDate } from './fixture-tipos'
export type { EstadisticasFixture as FixtureStats } from './fixture-tipos'
export type { EstadisticasEquipo as TeamStats } from './fixture-tipos'
