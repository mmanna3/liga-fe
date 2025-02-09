import { useState, useEffect } from 'react';
import Label from '../Label/Label';
import Input from '../Input/Input';
import FormErrorHandler from '../Error/FormErrorHandler';
import { useFormContext } from 'react-hook-form';

const PasoFechaNacimiento = () => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [dia, setDia] = useState<string>();
  const [mes, setMes] = useState<string>();
  const [anio, setAnio] = useState<string>();

  useEffect(() => {
    setValue('fechaNacimiento', `${dia}-${mes}-${anio}`);
  }, [dia, mes, anio]);

  const actualizarDia = (dia: string) => {
    if (dia.length === 1) dia = '0' + dia;

    setDia(dia);
  };

  const actualizarMes = (mes: string) => {
    if (mes.length === 1) mes = '0' + mes;

    setMes(mes);
  };

  const actualizarAnio = (anio: string) => {
    setAnio(anio);
  };

  const validarFecha = (date: string) => {
    const temp = date.split('-');
    const d = new Date(temp[1] + '-' + temp[0] + '-' + temp[2]);
    const resultado =
      d &&
      d.getMonth() + 1 == Number(temp[1]) &&
      d.getDate() == Number(temp[0]) &&
      d.getFullYear() == Number(temp[2]);
    return resultado || '¡Ups! Hay un problema con la fecha. Revisala.';
  };

  return (
    <div className='bg-red-700 py-6 px-3'>
      <div className=''>
        <div className=''>
          <Label texto='Tu fecha de nacimiento' />
        </div>
        <div className='flex gap-2'>
          <div className='w-1/3'>
            <p className='font-bold'>Día</p>
            <Input type='number' onChange={actualizarDia} className='w-20' />
          </div>
          <div className='w-1/3'>
            <p className='font-bold'>Mes</p>
            <Input type='number' onChange={actualizarMes} className='w-20' />
          </div>
          <div className='w-1/3'>
            <p className='font-bold'>Año</p>
            <Input type='number' onChange={actualizarAnio} className='w-20' />
          </div>
        </div>
        <input
          type='hidden'
          {...register('fechaNacimiento', {
            required: true,
            validate: validarFecha,
          })}
        />
        <FormErrorHandler name='fechaNacimiento' errors={errors} nombre='fecha' />
      </div>
    </div>
  );
};

export default PasoFechaNacimiento;
