import { Paso2Fases } from '../components/paso-2-fases'
import { esquemaPaso2 } from '../esquema-validacion'
import type { DatosPaso2, IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'

export const paso2: IPaso<DatosPaso2> = {
  numero: 2,
  titulo: 'Fases del torneo',
  tituloCorto: 'Fases',
  Componente: Paso2Fases,

  obtenerDatos: (form): DatosPaso2 => ({
    fases: form.fases,
    sumarPuntosAnuales: form.sumarPuntosAnuales,
    indiceFaseActual: form.indiceFaseActual
  }),

  validar: async (form: DatosWizardTorneo) => {
    await esquemaPaso2.parseAsync({ fases: form.fases })
  },

  obtenerDefaults: (): DatosPaso2 => ({
    fases: [],
    sumarPuntosAnuales: false,
    indiceFaseActual: 0
  })
}
