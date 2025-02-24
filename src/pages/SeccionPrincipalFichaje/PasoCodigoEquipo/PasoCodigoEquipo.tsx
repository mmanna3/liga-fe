import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { BASE_URL } from '../../../consts'
import FormErrorHandler from '../Error/FormErrorHandler'
import Input from '../Input/Input'
import Label from '../Label/Label'
import MessageBox from './../MessageBox'

interface IProps {
  valorInicial: string
}

const PasoCodigoEquipo = (props: IProps) => {
  const [codigoEquipo, setCodigoEquipo] = useState<string>(props.valorInicial)
  const [codigoEquipoEsValido, setCodigoEquipoEsValido] = useState<
    boolean | null
  >(null)
  const [nombreEquipo, setNombreEquipo] = useState('')
  const [yaValidoCodigoEquipo, setYaValidoCodigoEquipo] = useState(false)

  const {
    register,
    formState: { errors }
  } = useFormContext()

  const onCodigoEquipoChange = (id: string) => {
    setCodigoEquipo(id)
  }

  const validar = async () => {
    return fetch(
      `${BASE_URL}/publico/obtenerNombreDelEquipo?codigoAlfanumerico=${codigoEquipo}`
    )
      .then((response) => response.json())
      .then((data) => {
        setNombreEquipo(data)
        setCodigoEquipoEsValido(true)
        setYaValidoCodigoEquipo(true)
        return true
      })
      .catch(() => {
        setCodigoEquipoEsValido(false)
        setYaValidoCodigoEquipo(true)
        return false
      })
  }

  const onValidarClick = async () => {
    const resultado = await validar()
    return resultado
  }

  return (
    <div className='bg-blue-700 py-6 px-3'>
      <div className='flex flex-col'>
        <div className='w-[100%]'>
          <Label
            texto={'Código de tu equipo'}
            subtitulo='Pedíselo a tu delegado'
          />
        </div>
        <div className='flex'>
          <Input
            onChange={onCodigoEquipoChange}
            type='string'
            register={register('codigoAlfanumerico', {
              required: true,
              validate: { asyncValidate: onValidarClick }
            })}
            valorInicial={props.valorInicial}
            name='codigoAlfanumerico'
            className='w-1/2'
          />
          <div className='w-1/2'>
            <button
              type='button'
              className='py-auto rounded-lg bg-green-700 text-center text-white'
              style={{ width: '100%' }}
              onClick={onValidarClick}
            >
              Validar
            </button>
          </div>
        </div>
        {yaValidoCodigoEquipo &&
          (codigoEquipoEsValido ? (
            <MessageBox type='success'>
              Tu equipo es: <strong>{nombreEquipo}</strong>
            </MessageBox>
          ) : (
            <MessageBox type='error'>El código es incorrecto</MessageBox>
          ))}

        <FormErrorHandler
          errors={errors}
          name='codigoAlfanumerico'
          nombre='código de equipo'
        />
      </div>
    </div>
  )
}

export default PasoCodigoEquipo
