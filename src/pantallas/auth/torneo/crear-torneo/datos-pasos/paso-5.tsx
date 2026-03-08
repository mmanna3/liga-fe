import { Paso5Fixture } from '../components/paso-5-fixture'
import { esquemaPaso5 } from '../esquema-validacion'
import type { DatosPaso5, IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'

export const paso5: IPaso<DatosPaso5> = {
  numero: 5,
  titulo: 'Generación de fixture',
  tituloCorto: 'Fixture',
  Componente: Paso5Fixture,

  obtenerDatos: (form): DatosPaso5 => ({
    fechasLibres: form.fechasLibres,
    fechasInterzonales: form.fechasInterzonales,
    fixtureGenerado: form.fixtureGenerado,
    prevenirChoquesDeClub: form.prevenirChoquesDeClub
  }),

  validar: async (form: DatosWizardTorneo) => {
    await esquemaPaso5.parseAsync({ fixtureGenerado: form.fixtureGenerado })
  },

  obtenerDefaults: (): DatosPaso5 => ({
    fechasLibres: 0,
    fechasInterzonales: 0,
    fixtureGenerado: false,
    prevenirChoquesDeClub: false
  })
}
