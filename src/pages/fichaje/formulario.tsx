import { api } from '@/api/api'
import { JugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
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
          `/fichaje-exitoso?dni=${jugadorDTO.dni}&codigoEquipo=${codigoEquipo}`
        )
      },
      onError: (err) => {
        console.log('Error del servidor', err)
        const mensajeError = err?.message || 'Error desconocido'
        const mensajeCodificado = encodeURIComponent(mensajeError)

        navigate(`/fichaje-error?mensaje=${mensajeCodificado}`)
      }
    })
  })

  const huboAlgunError = !(
    Object.keys(methods.formState.errors).length === 0 &&
    methods.formState.errors.constructor === Object
  )

  return (
    <FormProvider {...methods}>
      <div className='flex justify-center font-sans text-slate-100'>
        <div className=''>
          <form onSubmit={hacerSubmit}>
            {huboAlgunError && (
              <div className='bg-green-700 py-6 px-6'>
                <div className='mb-2 max-w-[360px] mx-auto'>
                  <CartelMensaje type='error'>
                    ¡Ups! Hubo algún <strong>error</strong>. Revisá tus datos y
                    volvé a enviarlos.
                  </CartelMensaje>
                </div>
              </div>
            )}

            <PasoCodigoEquipo valorInicial={codigoEquipo!} />

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

            <BotonEnviarDatos onEnviarClick={hacerSubmit} />
          </form>
        </div>
      </div>
    </FormProvider>
  )
}

export default FormularioFichaje
