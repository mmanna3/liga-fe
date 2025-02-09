import { useState } from 'react'
import FormularioFichaje from './FormularioFichaje'
import MessageBox from './MessageBox'
import { Spinner } from './Spinner'

export const estaLaSeccionHabilitada = () => {
  // const hoy = new Date()
  // const diaDeHoy = hoy.getDay()
  // const horaActual = hoy.getHours()
  // if (
  //   diaDeHoy == 6 ||
  //   diaDeHoy == 0 ||
  //   diaDeHoy == 5 ||
  //   (diaDeHoy == 4 && horaActual >= 20)
  // )
  //   return false
  return true
}

const SeccionPrincipalFichaje = () => {
  const [mensajeExitoVisible, mostrarMensajeExito] = useState(false)
  const [mensajeErrorServidor, mostrarMensajeErrorServidor] = useState<
    string | undefined
  >('')
  const [spinnerVisible, mostrarSpinner] = useState(false)
  const [codigoEquipoAnterior, setCodigoEquipoAnterior] = useState('')

  const onSuccess = (codigoEquipo: string) => {
    mostrarMensajeExito(true)
    setCodigoEquipoAnterior(codigoEquipo)
  }

  if (!estaLaSeccionHabilitada())
    return (
      <MessageBox type='info' large>
        El fichaje está deshabilitado.
      </MessageBox>
    )
  else if (mensajeExitoVisible)
    return (
      <MessageBox type='info' large>
        <>
          ¡Tus datos se enviaron correctamente! Gracias por ficharte.
          <div className='mt-6'>
            <button
              onClick={() => mostrarMensajeExito(false)}
              className='rounded-lg bg-green-700 py-3 px-3 text-center text-white'
            >
              Fichar otro jugador
            </button>
          </div>
        </>
      </MessageBox>
    )
  else if (mensajeErrorServidor)
    if (mensajeErrorServidor === 'Error')
      return (
        <MessageBox type='error' large>
          ¡Ups! Hubo un <strong>error</strong>. Volvé a intentar más tarde.
        </MessageBox>
      )
    else
      return (
        <MessageBox type='error' large>
          ¡Ups! Hubo un <strong>error</strong>. {mensajeErrorServidor}
        </MessageBox>
      )
  else if (spinnerVisible) return <Spinner />
  else
    return (
      <FormularioFichaje
        codigoEquipo={codigoEquipoAnterior}
        showLoading={mostrarSpinner}
        onSuccess={onSuccess}
        onError={(mensaje: string) => mostrarMensajeErrorServidor(mensaje)}
      />
    )
}

export default SeccionPrincipalFichaje
