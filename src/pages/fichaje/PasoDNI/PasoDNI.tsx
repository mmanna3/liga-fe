import { api } from '@/api/api'
import { useFormContext } from 'react-hook-form'
import FormErrorHandler from '../Error/FormErrorHandler'
import Input from '../Input/Input'
import Label from '../Label/Label'

const PasoDNI = () => {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  const validar = async (dni: string) => {
    if (!dni || dni.length < 7) return 'El DNI debe tener al menos 7 números.'

    try {
      const yaFichado = await api.elDniEstaFichado(dni)
      return !yaFichado || '¡Ups! Ya estás fichado. Consultá con tu delegado.'
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 'Error al verificar el DNI. Intente nuevamente.'
    }
  }

  return (
    <div className='bg-red-700 py-6 px-6 w-full'>
      <div className='max-w-[360px] mx-auto'>
        <Label texto='Tu DNI' />
        <Input
          type='number'
          register={register('dni', {
            required: 'El DNI es obligatorio.',
            maxLength: {
              value: 9,
              message: '¡Ups! Como máximo son 9 números.'
            },
            validate: validar
          })}
          name='dni'
          dataTestId='input-dni'
        />
        <FormErrorHandler name='dni' errors={errors} nombre='DNI' />
      </div>
    </div>
  )
}

export default PasoDNI
