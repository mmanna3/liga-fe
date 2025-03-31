import { api } from '@/api/api'
import { JugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import BotonEnviarDatos from './boton-enviar-datos/boton-enviar-datos'
import CartelMensaje from './cartel-mensaje'
import PasoCodigoEquipo from './PasoCodigoEquipo/PasoCodigoEquipo'
import PasoDNI from './PasoDNI/PasoDNI'

const FichajeEnOtroEquipo = () => {
  const methods = useForm<JugadorDTO>({ mode: 'onBlur' })
  const navigate = useNavigate()

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

  const validarDNI = async (dni: string) => {
    if (!dni || dni.length < 7) return 'El DNI debe tener al menos 7 números.'

    try {
      const yaFichado = await api.elDniEstaFichado(dni)
      return (
        yaFichado ||
        '¡Ups! No estás fichado en ningún otro equipo. Fichate en uno cargando todos los datos y después en otro solo con el DNI.'
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 'Error al verificar el DNI. Intente nuevamente.'
    }
  }

  return (
    <FormProvider {...methods}>
      <div className='min-h-screen bg-green-700'>
        <div className='font-sans text-slate-100 w-full bg-green-700'>
          <div className='py-6 w-full'>
            <div className='max-w-[360px] mx-auto text-left'>
              <h1 className='text-2xl! font-bold mb-2 text-white'>
                Fichate en otro equipo
              </h1>
              <p className='text-sm text-green-300'>
                Si ya estás fichado en algún equipo de la liga, podés ficharte
                en otro.
              </p>
            </div>
          </div>
          <form onSubmit={hacerSubmit} className='w-full'>
            {Object.keys(methods.formState.errors).length > 0 && (
              <div className='pb-6 pt-2 px-6 w-full'>
                <div className='mb-2 max-w-[360px] mx-auto'>
                  <CartelMensaje type='error'>
                    ¡Ups! Hubo algún <strong>error</strong>. Revisá tus datos y
                    volvé a enviarlos.
                  </CartelMensaje>
                </div>
              </div>
            )}
            <PasoDNI validar={validarDNI} />
            <PasoCodigoEquipo valorInicial='' />
            <BotonEnviarDatos
              onEnviarClick={hacerSubmit}
              estaCargando={mutation.isPending}
            />
          </form>
        </div>
      </div>
    </FormProvider>
  )
}

export default FichajeEnOtroEquipo
