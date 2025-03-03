import { FieldErrors, FieldValues } from 'react-hook-form'
import CartelMensaje from '../cartel-mensaje'

interface IError {
  errors: FieldErrors<FieldValues>
  name: string
  nombre: string
}

const FormErrorHandler = ({ errors, name, nombre }: IError) => {
  let message = undefined

  if (errors[name] && errors[name]?.type === 'required')
    message = `¡Ups! Te olvidaste tu ${nombre}`
  else if (errors[name] && errors[name]?.type !== 'required')
    message = (errors[name] as any).message

  return (
    <div className='max-w-[360px] mx-auto'>
      <CartelMensaje type='error'>{message}</CartelMensaje>
    </div>
  )
}

export default FormErrorHandler
