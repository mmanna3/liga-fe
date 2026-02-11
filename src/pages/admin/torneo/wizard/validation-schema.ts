import { z } from 'zod'

// Schema para categoría
const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  yearFrom: z.string(),
  yearTo: z.string()
})

// Schema para fase
const phaseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre de la fase es requerido'),
  format: z.enum(['all-vs-all', 'elimination']),
  rounds: z.enum(['single', 'double']),
  zoneFormats: z.record(z.string(), z.enum(['all-vs-all', 'elimination'])),
  tiebreakers: z.array(z.string()),
  transitionMode: z.enum(['manual', 'automatic']),
  qualifiersPerZone: z.number(),
  qualifiersStartPosition: z.number(),
  qualifiersEndPosition: z.number(),
  crossGroupQualifiers: z.number(),
  comparisonMode: z.enum(['total-points', 'average-points']),
  enableTriangular: z.boolean(),
  tieResolution: z.enum(['penalties', 'extra-time', 'advantage']),
  transitionRules: z.array(z.string()),
  completed: z.boolean()
})

// Schema para equipo
const wizardTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  club: z.string(),
  tournament: z.string(),
  zone: z.string()
})

// Schema para zona
const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  teams: z.array(wizardTeamSchema),
  phaseId: z.string()
})

// Schema completo del wizard
export const tournamentWizardSchema = z.object({
  // Step 1: Información
  name: z.string().min(1, 'El nombre del torneo es requerido'),
  season: z.string().min(4, 'La temporada es requerida'),
  type: z
    .enum(['FUTSAL', 'BABY', 'FUTBOL 11', 'FEMENINO', ''])
    .refine((val) => val !== '', { message: 'Debes seleccionar un tipo de torneo' }),
  categories: z
    .array(categorySchema)
    .min(1, 'Debes agregar al menos una categoría')
    .refine(
      (cats) => cats.every((c) => c.name.trim() !== ''),
      { message: 'Todas las categorías deben tener nombre' }
    ),
  format: z
    .enum(['ANUAL', 'RELAMPAGO', 'MUNDIAL', 'PERSONALIZADO', ''])
    .refine((val) => val !== '', { message: 'Debes seleccionar un formato' }),

  // Step 2: Fases
  phases: z.array(phaseSchema).min(1, 'Debe haber al menos una fase'),
  sumAnnualPoints: z.boolean(),
  currentPhaseIndex: z.number(),

  // Step 3: Equipos
  teamCount: z.number().min(2, 'Debe haber al menos 2 equipos'),
  selectedTeams: z.array(wizardTeamSchema),
  searchMode: z.enum(['name', 'tournament']),
  filterTournament: z.string(),
  filterZone: z.string(),

  // Step 4: Zonas
  zones: z.array(zoneSchema),
  zonesCount: z.number().min(1, 'Debe haber al menos 1 zona'),
  preventSameClub: z.boolean(),

  // Step 5: Fixture
  hasFreeBye: z.boolean(),
  hasInterzonal: z.boolean(),
  fixtureGenerated: z.boolean(),
  numberOfDates: z.number().min(0),
  preventClubClash: z.boolean(),

  // Step 6: Estado
  status: z.enum(['draft', 'published'])
})

// Schemas de validación por paso
export const step1Schema = tournamentWizardSchema.pick({
  name: true,
  season: true,
  type: true,
  categories: true,
  format: true
})

export const step2Schema = tournamentWizardSchema.pick({
  phases: true
})

export const step3Schema = tournamentWizardSchema
  .pick({
    teamCount: true,
    selectedTeams: true
  })
  .refine(
    (data) => data.selectedTeams.length === data.teamCount,
    {
      message: 'Debes seleccionar la cantidad exacta de equipos',
      path: ['selectedTeams']
    }
  )

export const step4Schema = tournamentWizardSchema
  .pick({
    zones: true,
    zonesCount: true,
    selectedTeams: true
  })
  .refine(
    (data) => {
      const totalTeamsInZones = data.zones.reduce(
        (acc, zone) => acc + zone.teams.length,
        0
      )
      return totalTeamsInZones === data.selectedTeams.length
    },
    {
      message: 'Todos los equipos deben estar asignados a una zona',
      path: ['zones']
    }
  )

export const step5Schema = tournamentWizardSchema
  .pick({
    fixtureGenerated: true
  })
  .refine((data) => data.fixtureGenerated === true, {
    message: 'Debes generar el fixture antes de continuar',
    path: ['fixtureGenerated']
  })

export const step6Schema = tournamentWizardSchema.pick({
  status: true
})

export type TournamentWizardFormData = z.infer<typeof tournamentWizardSchema>
