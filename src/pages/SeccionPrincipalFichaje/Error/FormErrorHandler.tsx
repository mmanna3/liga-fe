import { FieldErrors, FieldValues } from 'react-hook-form'
import MessageBox from './../MessageBox'

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

  return <MessageBox type='error'>{message}</MessageBox>
}

export default FormErrorHandler
