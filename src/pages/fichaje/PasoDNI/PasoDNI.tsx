import { useFormContext } from 'react-hook-form'
import FormErrorHandler from '../Error/FormErrorHandler'
import Input from '../Input/Input'
import Label from '../Label/Label'

interface IProps {
  validar: (dni: string) => Promise<boolean | string>
}

const PasoDNI = ({ validar }: IProps) => {
  const {
    register,
    formState: { errors }
  } = useFormContext()

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
