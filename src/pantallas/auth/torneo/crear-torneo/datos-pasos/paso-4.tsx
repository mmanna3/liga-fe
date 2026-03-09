import { Paso4Zonas } from '../components/paso-4-zonas'
import { esquemaPaso4 } from '../esquema-validacion'
import { validarEmparejamientoInterzonal, validarZonas } from '../lib/fixture'
import type { DatosPaso4, IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'
import { z } from 'zod'

export const paso4: IPaso<DatosPaso4> = {
  numero: 4,
  titulo: 'Configuración de zonas',
  tituloCorto: 'Zonas',
  Componente: Paso4Zonas,

  obtenerDatos: (form): DatosPaso4 => ({
    zonas: form.zonas,
    cantidadZonas: form.cantidadZonas,
    prevenirMismoClub: form.prevenirMismoClub
  }),

  // Necesita equiposSeleccionados del paso anterior para validar que todos
  // los equipos estén asignados a una zona.
  validar: async (form: DatosWizardTorneo) => {
    const nombres = form.zonas.map((zona) => zona.nombre.trim())
    const duplicados = nombres.filter((n, i) => nombres.indexOf(n) !== i)
    if (duplicados.length > 0) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ['zonas'],
          message: `Hay zonas con el mismo nombre: ${[...new Set(duplicados)].join(', ')}`
        }
      ])
    }

    const zonasConUnSoloEquipo = form.zonas.filter(
      (zona) => zona.equipos.length === 1
    )
    if (zonasConUnSoloEquipo.length > 0) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ['zonas'],
          message: `No puede haber zonas con un solo equipo: ${zonasConUnSoloEquipo.map((zona) => zona.nombre).join(', ')}`
        }
      ])
    }

    await esquemaPaso4.parseAsync({
      zonas: form.zonas,
      equiposSeleccionados: form.equiposSeleccionados
    })

    const faseActual = form.fases[form.indiceFaseActual]
    if (!faseActual) return

    const zonasConEquipos = form.zonas.filter((z) => z.equipos.length > 0)
    if (zonasConEquipos.length === 0) return

    const entradasDeZona = zonasConEquipos.map((z) => ({
      id: z.id,
      nombre: z.nombre,
      equipos: z.equipos.map((t) => ({ id: t.id, nombre: t.nombre })),
      fechasLibres:
        (z as typeof z & { fechasLibres?: number }).fechasLibres ?? 0,
      fechasInterzonales:
        (z as typeof z & { fechasInterzonales?: number }).fechasInterzonales ??
        0
    }))

    const esEliminacion = faseActual.formato === 'eliminacion'
    const validaciones = validarZonas(
      entradasDeZona,
      esEliminacion ? 'eliminacion' : 'todos-contra-todos'
    )

    const errores: string[] = []

    for (const v of validaciones) {
      if (!v.esValida) {
        errores.push(
          esEliminacion
            ? `${v.nombreZona}: la suma de equipos, fechas LIBRES y fechas INTERZONALES (${v.totalParticipantes}) tiene que ser potencia de 2`
            : `${v.nombreZona}: la suma de equipos, fechas LIBRES y fechas INTERZONALES (${v.totalParticipantes}) tiene que ser par`
        )
      }
    }

    if (zonasConEquipos.length > 1) {
      const emparejamiento = validarEmparejamientoInterzonal(entradasDeZona)
      if (!emparejamiento.esValido) {
        errores.push(emparejamiento.mensaje)
      }
    }

    if (errores.length > 0) {
      throw new z.ZodError(
        errores.map((message) => ({
          code: z.ZodIssueCode.custom,
          path: ['zonas'],
          message
        }))
      )
    }
  },

  obtenerDefaults: (): DatosPaso4 => ({
    zonas: [],
    cantidadZonas: 1,
    prevenirMismoClub: false
  })
}
