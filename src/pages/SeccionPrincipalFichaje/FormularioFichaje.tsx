import { FormProvider, useForm } from 'react-hook-form'
import { BASE_URL } from '../../consts'
import MessageBox from './MessageBox'
import PasoBotonEnviar from './PasoBotonEnviar/PasoBotonEnviar'
import PasoCodigoEquipo from './PasoCodigoEquipo/PasoCodigoEquipo'
import PasoDNI from './PasoDNI/PasoDNI'
import PasoFechaNacimiento from './PasoFechaNacimiento/PasoFechaNacimiento'
import PasoFotoCarnet from './PasoFotoCarnet/PasoFotoCarnet'
import PasoFotoDocumento from './PasoFotoDocumento/PasoFotoDocumento'
import PasoInput from './PasoInput/PasoInput'
import { estaLaSeccionHabilitada } from './SeccionPrincipalFichaje'

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

  const hacerElPost = async (data: unknown) => {
    if (!estaLaSeccionHabilitada()) {
      onError('La sección no está habilitada')
      return
    }

    showLoading(true)
    fetch(`${BASE_URL}/JugadorAutofichado/autofichaje`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    })
      .then((res) => res.json())
      .then((res) => {
        console.log('Respuesta', res)
        showLoading(false)
        if (res === 'OK') onSuccess((data as any).codigoAlfanumerico)
        else onError(res)
      })
      .catch(function (err) {
        console.log('Error del servidor', err)
        showLoading(false)
        onError(err)
      })
  }

  const onSubmit = (data: any) => {
    hacerElPost(data)
  }

  const huboAlgunError = !(
    Object.keys(methods.formState.errors).length === 0 &&
    methods.formState.errors.constructor === Object
  )

  return (
    <FormProvider {...methods}>
      <div className='flex justify-center font-sans text-slate-100'>
        <div className='max-w-[360px]'>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
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

            <PasoBotonEnviar />
          </form>
        </div>
      </div>
    </FormProvider>
  )
}

export default FormularioFichaje
