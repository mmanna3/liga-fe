import { api } from '@/api/api'
import { JugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BotonEnviarDatos from './boton-enviar-datos/boton-enviar-datos'
import CartelMensaje from './cartel-mensaje'
import PasoCodigoEquipo from './PasoCodigoEquipo/PasoCodigoEquipo'
import PasoDNI from './PasoDNI/PasoDNI'
import PasoFechaNacimiento from './PasoFechaNacimiento/PasoFechaNacimiento'
import PasoFotoCarnet from './PasoFotoCarnet/PasoFotoCarnet'
import PasoFotoDocumento from './PasoFotoDocumento/PasoFotoDocumento'
import PasoInput from './PasoInput/PasoInput'

const FormularioFichaje = () => {
  const methods = useForm<JugadorDTO>({ mode: 'onBlur' })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const codigoEquipo = searchParams.get('codigoEquipo')

  const mutation = useApiMutation({
    fn: async (jug: JugadorDTO) => {
      await api.jugadorPOST(jug)
    }
  })

  const validarDNI = async (dni: string) => {
    if (!dni || dni.length < 7) return 'El DNI debe tener al menos 7 números.'

    try {
      const yaFichado = await api.elDniEstaFichado(dni)
      return !yaFichado || '¡Ups! Ya estás fichado. Consultá con tu delegado.'
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 'Error al verificar el DNI. Intente nuevamente.'
    }
  }

  const hacerSubmit = methods.handleSubmit((jugadorDTO: JugadorDTO) => {
    mutation.mutate(jugadorDTO, {
      onSuccess: () => {
        navigate(
          `/fichaje-exitoso?dni=${jugadorDTO.dni}&codigoEquipo=${jugadorDTO.codigoAlfanumerico}`
        )
      },
      onError: (error) => {
        const mensajeError =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSON.parse((error as any)?.response)?.title || 'Error desconocido'
        console.log('El error:', mensajeError)

        const mensajeCodificado = encodeURIComponent(mensajeError)

        navigate(`/fichaje-error?mensaje=${mensajeCodificado}`)
      }
    })
  })

  useEffect(() => {
    if (Object.keys(methods.formState.errors).length > 0)
      window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [methods.formState.errors])

  return (
    <FormProvider {...methods}>
      <div className='font-sans text-slate-100 w-full'>
        <div className='bg-green-700 py-6 w-full'>
          <div className='max-w-[360px] mx-auto text-left'>
            <h1 className='text-2xl! font-bold mb-2 text-white'>
              Cargá tus datos para ficharte
            </h1>
            <Link
              to='/fichaje-en-otro-equipo'
              className='text-sm text-green-300 hover:text-green-100! transition-colors'
            >
              <span>¿Ya estás fichado? </span>
              <span className='underline'>Fichate en otro equipo</span>
            </Link>
          </div>
        </div>
        <form onSubmit={hacerSubmit} className='w-full'>
          {Object.keys(methods.formState.errors).length > 0 && (
            <div className='bg-green-700 pb-6 pt-2 px-6 w-full'>
              <div className='mb-2 max-w-[360px] mx-auto'>
                <CartelMensaje type='error'>
                  ¡Ups! Hubo algún <strong>error</strong>. Revisá tus datos y
                  volvé a enviarlos.
                </CartelMensaje>
              </div>
            </div>
          )}

          <PasoCodigoEquipo valorInicial={codigoEquipo || ''} />

          <PasoInput
            longMaxima={10}
            name='nombre'
            nombre='nombre'
            titulo='Tu nombre'
          />

          <PasoInput
            longMaxima={11}
            name='apellido'
            nombre='apellido'
            titulo='Tu apellido'
          />

          <PasoDNI validar={validarDNI} />

          <PasoFechaNacimiento />

          <PasoFotoCarnet />

          <PasoFotoDocumento
            titulo='Foto del frente de tu DNI'
            name='fotoDNIFrente'
            nombre='foto de FRENTE del DNI'
          />

          <PasoFotoDocumento
            titulo='Foto de la parte de atrás de tu DNI'
            name='fotoDNIDorso'
            nombre='foto de ATRÁS del DNI'
          />

          <BotonEnviarDatos
            onEnviarClick={hacerSubmit}
            estaCargando={mutation.isPending}
          />
        </form>
      </div>
    </FormProvider>
  )
}

export default FormularioFichaje
