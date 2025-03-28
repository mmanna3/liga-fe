import { api } from '@/api/api'
import { JugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

  const hacerSubmit = methods.handleSubmit((jugadorDTO: JugadorDTO) => {
    mutation.mutate(jugadorDTO, {
      onSuccess: () => {
        navigate(
          `/fichaje-exitoso?dni=${jugadorDTO.dni}&codigoEquipo=${jugadorDTO.codigoAlfanumerico}`
        )
      },
      onError: (error) => {
        console.log('Error del servidor', error)
        const mensajeError =
          error instanceof Error ? error.message : 'Error desconocido'
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
        <form onSubmit={hacerSubmit} className='w-full'>
          {Object.keys(methods.formState.errors).length > 0 && (
            <div className='bg-green-700 py-6 px-6 w-full'>
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

          <PasoDNI />

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
