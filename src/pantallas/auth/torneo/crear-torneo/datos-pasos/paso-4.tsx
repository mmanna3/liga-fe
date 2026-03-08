import { Paso4Zonas } from '../components/paso-4-zonas'
import { esquemaPaso4 } from '../esquema-validacion'
import type { DatosPaso4, IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'

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
    await esquemaPaso4.parseAsync({
      zonas: form.zonas,
      equiposSeleccionados: form.equiposSeleccionados
    })
  },

  obtenerDefaults: (): DatosPaso4 => ({
    zonas: [],
    cantidadZonas: 1,
    prevenirMismoClub: false
  })
}
