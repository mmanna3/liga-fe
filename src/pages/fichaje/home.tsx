import FichajeDeshabilitado from './fichaje-deshabilitado'
import FormularioFichaje from './formulario'

export const estaLaSeccionHabilitada = () => {
  const IS_DEV = import.meta.env.VITE_IS_DEV
  if (IS_DEV) return true

  const hoy = new Date()
  const diaDeHoy = hoy.getDay()
  const horaActual = hoy.getHours()
  if (
    diaDeHoy == 6 ||
    diaDeHoy == 0 ||
    diaDeHoy == 5 ||
    (diaDeHoy == 4 && horaActual >= 20)
  )
    return false
  return true
}

const SeccionPrincipalFichaje = () => {
  if (!estaLaSeccionHabilitada()) return <FichajeDeshabilitado />
  else return <FormularioFichaje />
}

export default SeccionPrincipalFichaje
