import { Paso3Equipos } from '../components/paso-3-equipos'
import { esquemaPaso3 } from '../esquema-validacion'
import type { DatosPaso3, IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'

export const paso3: IPaso<DatosPaso3> = {
  numero: 3,
  titulo: 'Selección de equipos',
  tituloCorto: 'Equipos',
  Componente: Paso3Equipos,

  obtenerDatos: (form): DatosPaso3 => ({
    cantidadEquipos: form.cantidadEquipos,
    equiposSeleccionados: form.equiposSeleccionados,
    modoBusqueda: form.modoBusqueda,
    filtroAnio: form.filtroAnio,
    filtroTipo: form.filtroTipo,
    filtroTorneo: form.filtroTorneo,
    filtroFase: form.filtroFase,
    filtroZona: form.filtroZona
  }),

  validar: async (form: DatosWizardTorneo) => {
    await esquemaPaso3.parseAsync({
      cantidadEquipos: form.cantidadEquipos,
      equiposSeleccionados: form.equiposSeleccionados
    })
  },

  obtenerDefaults: (): DatosPaso3 => ({
    cantidadEquipos: 16,
    equiposSeleccionados: [],
    modoBusqueda: 'nombre',
    filtroAnio: '',
    filtroTipo: '',
    filtroTorneo: '',
    filtroFase: '',
    filtroZona: ''
  })
}
