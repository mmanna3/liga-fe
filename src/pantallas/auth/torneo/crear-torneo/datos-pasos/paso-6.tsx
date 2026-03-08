import { Paso6Resumen } from '../components/paso-6-resumen'
import { esquemaPaso6 } from '../esquema-validacion'
import type { DatosPaso6, IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'

export const paso6: IPaso<DatosPaso6> = {
  numero: 6,
  titulo: 'Resumen y confirmación',
  tituloCorto: 'Resumen',
  // Paso6Resumen recibe alEditarPaso como prop.
  // Se renderiza directamente en crear-torneo.tsx para poder pasarle ese prop.
  Componente: Paso6Resumen,

  obtenerDatos: (form): DatosPaso6 => ({
    estado: form.estado
  }),

  validar: async (form: DatosWizardTorneo) => {
    await esquemaPaso6.parseAsync({ estado: form.estado })
  },

  obtenerDefaults: (): DatosPaso6 => ({
    estado: 'draft'
  })
}
