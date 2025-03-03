import { api } from '@/api/api'
import { JugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { FormProvider, useForm } from 'react-hook-form'
import MessageBox from './MessageBox'
import PasoBotonEnviar from './PasoBotonEnviar/PasoBotonEnviar'
import PasoCodigoEquipo from './PasoCodigoEquipo/PasoCodigoEquipo'
import PasoDNI from './PasoDNI/PasoDNI'
import PasoFechaNacimiento from './PasoFechaNacimiento/PasoFechaNacimiento'
import PasoFotoCarnet from './PasoFotoCarnet/PasoFotoCarnet'
import PasoFotoDocumento from './PasoFotoDocumento/PasoFotoDocumento'
import PasoInput from './PasoInput/PasoInput'

interface IProps {
  showLoading: React.Dispatch<React.SetStateAction<boolean>>
  onSuccess: (codigoAlfanumerico: string) => void
  onError: (mensaje: string) => void
  codigoEquipo: string
}

const FormularioFichaje = ({
  showLoading,
  onSuccess,
  onError,
  codigoEquipo
}: IProps) => {
  const methods = useForm()

  const mutation = useApiMutation({
    fn: async (jug: JugadorDTO) => {
      await api.jugadorPOST(jug)
    }
  })

  const hacerSubmit = () => {
    const jugadorDTO = methods.getValues() as JugadorDTO

    showLoading(true)
    mutation.mutate(jugadorDTO, {
      onSuccess: () => {
        showLoading(false)
        onSuccess(jugadorDTO.codigoAlfanumerico!)
      },
      onError: (err) => {
        console.log('Error del servidor', err)
        showLoading(false)
        onError(err.message)
      }
    })
    showLoading(false)
  }

  const huboAlgunError = !(
    Object.keys(methods.formState.errors).length === 0 &&
    methods.formState.errors.constructor === Object
  )

  return (
    <FormProvider {...methods}>
      <div className='flex justify-center font-sans text-slate-100'>
        <div className=''>
          <form onSubmit={(e) => e.preventDefault()}>
            {huboAlgunError && (
              <div className='mb-2'>
                <MessageBox type='error'>
                  ¡Ups! Hubo algún <strong>error</strong>. Revisá tus datos y
                  volvé a enviarlos.
                </MessageBox>
              </div>
            )}

            <PasoCodigoEquipo valorInicial={codigoEquipo} />

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

            <PasoBotonEnviar onEnviarClick={hacerSubmit} />
          </form>
        </div>
      </div>
    </FormProvider>
  )
}

export default FormularioFichaje
