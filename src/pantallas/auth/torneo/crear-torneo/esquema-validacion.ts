import { z } from 'zod'

// Esquema para categoría
const esquemaCategoria = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre de la categoría es requerido'),
  anioDesde: z.string(),
  anioHasta: z.string()
})

// Esquema para fase
const esquemaFase = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre de la fase es requerido'),
  formato: z.enum(['todos-contra-todos', 'eliminacion']),
  vueltas: z.enum(['ida', 'ida-y-vuelta'])
})

// Esquema para equipo
const esquemaEquipoWizard = z.object({
  id: z.number(),
  nombre: z.string(),
  club: z.string(),
  torneo: z.string(),
  zona: z.string(),
  anio: z.string().optional(),
  tipo: z.string().optional(),
  fase: z.string().optional()
})

// Esquema para zona
const esquemaZona = z.object({
  id: z.string(),
  nombre: z.string(),
  equipos: z.array(esquemaEquipoWizard),
  idFase: z.string(),
  fechasLibres: z.number().min(0),
  fechasInterzonales: z.number().min(0)
})

// Esquema completo del wizard
export const esquemaTorneo = z.object({
  // Paso 1: Información
  nombre: z.string().min(1, 'El nombre del torneo es requerido'),
  temporada: z.string().min(4, 'La temporada es requerida'),
  tipo: z
    .enum(['FUTSAL', 'BABY', 'FUTBOL 11', 'FEMENINO', ''])
    .refine((val) => val !== '', {
      message: 'Debes seleccionar un tipo de torneo'
    }),
  categorias: z
    .array(esquemaCategoria)
    .min(1, 'Debes agregar al menos una categoría')
    .refine((cats) => cats.every((c) => c.nombre.trim() !== ''), {
      message: 'Todas las categorías deben tener nombre'
    }),
  formato: z
    .enum(['ANUAL', 'RELAMPAGO', 'MUNDIAL', 'PERSONALIZADO', ''])
    .refine((val) => val !== '', { message: 'Debes seleccionar un formato' }),

  // Paso 2: Fases
  fases: z.array(esquemaFase).min(1, 'Debe haber al menos una fase'),
  sumarPuntosAnuales: z.boolean(),
  indiceFaseActual: z.number(),

  // Paso 3: Equipos
  cantidadEquipos: z.number().min(2, 'Debe haber al menos 2 equipos'),
  equiposSeleccionados: z.array(esquemaEquipoWizard),
  modoBusqueda: z.enum(['nombre', 'torneo']),
  filtroAnio: z.string(),
  filtroTipo: z.string(),
  filtroTorneo: z.string(),
  filtroFase: z.string(),
  filtroZona: z.string(),

  // Paso 4: Zonas
  zonas: z.array(esquemaZona),
  cantidadZonas: z.number().min(1, 'Debe haber al menos 1 zona'),
  prevenirMismoClub: z.boolean(),

  // Paso 5: Fixture
  fechasLibres: z.number().min(0),
  fechasInterzonales: z.number().min(0),
  fixtureGenerado: z.boolean(),
  prevenirChoquesDeClub: z.boolean(),

  // Paso 6: Estado
  estado: z.enum(['borrador', 'publicado'])
})

// Esquemas de validación por paso
export const esquemaPaso1 = esquemaTorneo.pick({
  nombre: true,
  temporada: true,
  tipo: true,
  categorias: true,
  formato: true
})

export const esquemaPaso2 = esquemaTorneo.pick({
  fases: true
})

export const esquemaPaso3 = esquemaTorneo
  .pick({
    cantidadEquipos: true,
    equiposSeleccionados: true
  })
  .refine((data) => data.equiposSeleccionados.length === data.cantidadEquipos, {
    message: 'Debes seleccionar la cantidad exacta de equipos',
    path: ['equiposSeleccionados']
  })

export const esquemaPaso4 = esquemaTorneo
  .pick({
    zonas: true,
    equiposSeleccionados: true
  })
  .refine((data) => data.zonas.length >= 1, {
    message: 'Debe haber al menos una zona',
    path: ['zonas']
  })
  .refine(
    (data) => {
      const totalEquiposEnZonas = data.zonas.reduce(
        (acc, zona) => acc + zona.equipos.length,
        0
      )
      return totalEquiposEnZonas === data.equiposSeleccionados.length
    },
    {
      message: 'Todos los equipos deben estar asignados a una zona',
      path: ['zonas']
    }
  )

export const esquemaPaso5 = esquemaTorneo
  .pick({
    fixtureGenerado: true
  })
  .refine((data) => data.fixtureGenerado === true, {
    message: 'Debes generar el fixture antes de continuar',
    path: ['fixtureGenerado']
  })

export const esquemaPaso6 = esquemaTorneo.pick({
  estado: true
})

export type DatosFormTorneo = z.infer<typeof esquemaTorneo>
