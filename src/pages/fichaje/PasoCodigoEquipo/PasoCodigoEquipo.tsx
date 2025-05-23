import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import FormErrorHandler from '../Error/FormErrorHandler'
import Input from '../Input/Input'
import Label from '../Label/Label'
import CartelMensaje from '../cartel-mensaje'

interface IProps {
  valorInicial: string
}

const PasoCodigoEquipo = ({ valorInicial }: IProps) => {
  const [codigoEquipo, setCodigoEquipo] = useState<string>(valorInicial || '')

  const {
    register,
    setValue,
    formState: { errors }
  } = useFormContext()

  // Sincronizar el valorInicial con el formulario cuando el componente se monta
  useEffect(() => {
    if (valorInicial) {
      setCodigoEquipo(valorInicial)
      setValue('codigoAlfanumerico', valorInicial)
    }
  }, [valorInicial, setValue])

  const onCodigoEquipoChange = (id: string) => {
    setCodigoEquipo(id)
  }

  const { data, isLoading, refetch } = useApiQuery({
    key: ['nombre-equipo', codigoEquipo],
    fn: async () => await api.obtenerNombreEquipo(codigoEquipo),
    activado: false
  })

  const onValidarClick = async () => {
    await refetch()
  }

  return (
    <div className='bg-blue-700 py-6 px-6 w-full'>
      <div className='flex flex-col max-w-[360px] mx-auto'>
        <div className='w-[100%]'>
          <Label
            texto={'Código de tu equipo'}
            subtitulo='Pedíselo a tu delegado'
          />
        </div>
        <div className='flex'>
          <Input
            onChange={onCodigoEquipoChange}
            type='text'
            register={register('codigoAlfanumerico', {
              required: true,
              maxLength: {
                value: 10,
                message: '¡Ups! Como máximo son 10 letras'
              }
            })}
            name='codigoAlfanumerico'
            dataTestId='input-codigo-equipo'
            className='w-1/2'
            valorInicial={codigoEquipo}
          />
          <div className='w-1/2'>
            <button
              type='button'
              className='py-auto rounded-lg h-9 bg-green-700 text-center text-white'
              style={{ width: '100%' }}
              onClick={onValidarClick}
              disabled={isLoading}
              data-testid='boton-validar-codigo'
            >
              {isLoading ? 'Validando...' : 'Validar'}
            </button>
          </div>
        </div>
        {data?.respuesta && (
          <CartelMensaje type='success'>
            Tu equipo es: <strong>{data?.respuesta}</strong>
          </CartelMensaje>
        )}
        {data?.hayError && (
          <CartelMensaje type='error'>El código es incorrecto</CartelMensaje>
        )}
      </div>
      <FormErrorHandler
        name='codigoAlfanumerico'
        errors={errors}
        nombre='código de equipo'
      />
    </div>
  )
}

export default PasoCodigoEquipo
