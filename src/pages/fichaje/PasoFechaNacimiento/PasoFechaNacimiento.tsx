import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import FormErrorHandler from '../Error/FormErrorHandler'
import Input from '../Input/Input'
import Label from '../Label/Label'

const PasoFechaNacimiento = () => {
  const {
    register,
    setValue,
    formState: { errors }
  } = useFormContext()

  const [dia, setDia] = useState<string>()
  const [mes, setMes] = useState<string>()
  const [anio, setAnio] = useState<string>()

  useEffect(() => {
    setValue('fechaNacimiento', `${anio}-${mes}-${dia}T00:00:00`)
  }, [dia, mes, anio])

  const actualizarDia = (dia: string) => {
    if (dia.length === 1) dia = '0' + dia

    setDia(dia)
  }

  const actualizarMes = (mes: string) => {
    if (mes.length === 1) mes = '0' + mes

    setMes(mes)
  }

  const actualizarAnio = (anio: string) => {
    setAnio(anio)
  }

  const validarFecha = (date: string) => {
    const d = new Date(date)

    const temp = date.split('T')[0].split('-')
    const tempAnio = Number(temp[0])
    const tempMes = Number(temp[1])
    const tempDia = Number(temp[2])

    const resultado =
      d &&
      d.getFullYear() === tempAnio &&
      d.getMonth() + 1 === tempMes && // Recordar que getMonth() es 0-indexado
      d.getDate() === tempDia

    console.log(resultado)

    return resultado || '¡Ups! Hay un problema con la fecha. Revisala.'
  }

  return (
    <div className='bg-red-700 py-6 px-6 w-full'>
      <div className='max-w-[360px] mx-auto'>
        <div className=''>
          <Label texto='Tu fecha de nacimiento' />
        </div>
        <div className='flex gap-2'>
          <div className='w-1/3'>
            <p className='font-bold'>Día</p>
            <Input
              type='number'
              onChange={actualizarDia}
              className='w-20'
              dataTestId='input-dia'
            />
          </div>
          <div className='w-1/3'>
            <p className='font-bold'>Mes</p>
            <Input
              type='number'
              onChange={actualizarMes}
              className='w-20'
              dataTestId='input-mes'
            />
          </div>
          <div className='w-1/3'>
            <p className='font-bold'>Año</p>
            <Input
              type='number'
              onChange={actualizarAnio}
              className='w-20'
              dataTestId='input-anio'
            />
          </div>
        </div>
        <input
          type='hidden'
          {...register('fechaNacimiento', {
            required: true,
            validate: validarFecha
          })}
        />
        <FormErrorHandler
          name='fechaNacimiento'
          errors={errors}
          nombre='fecha'
        />
      </div>
    </div>
  )
}

export default PasoFechaNacimiento
