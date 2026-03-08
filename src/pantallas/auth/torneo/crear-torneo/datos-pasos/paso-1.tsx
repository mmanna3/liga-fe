import { Paso1Informacion } from '../components/paso-1-informacion'
import { esquemaPaso1 } from '../esquema-validacion'
import type { DatosPaso1, IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'

export const paso1: IPaso<DatosPaso1> = {
  numero: 1,
  titulo: 'Información del torneo',
  tituloCorto: 'Info',
  Componente: Paso1Informacion,

  obtenerDatos: (form): DatosPaso1 => ({
    nombre: form.nombre,
    temporada: form.temporada,
    tipo: form.tipo,
    categorias: form.categorias,
    formato: form.formato
  }),

  validar: async (form: DatosWizardTorneo) => {
    await esquemaPaso1.parseAsync({
      nombre: form.nombre,
      temporada: form.temporada,
      tipo: form.tipo,
      categorias: form.categorias,
      formato: form.formato
    })
  },

  obtenerDefaults: (): DatosPaso1 => ({
    nombre: '',
    temporada: new Date().getFullYear().toString(),
    tipo: '',
    categorias: [],
    formato: ''
  })
}
