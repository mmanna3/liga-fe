import Label from '../Label/Label';
import Input from '../Input/Input';
import FormErrorHandler from '../Error/FormErrorHandler';
import { useFormContext } from 'react-hook-form';

interface IPasoInput {
  titulo: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name: string;
  nombre: string;
  longMaxima: number;
  type?: string;
}

const PasoInput = ({ titulo, onChange, name, nombre, longMaxima, type = 'text' }: IPasoInput) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const caracteres = type === 'text' ? 'letras' : 'números';

  return (
    <div className='bg-red-700 py-6 px-3'>
      <div className=''>
        <div className=''>
          <Label texto={titulo} />
        </div>
        <div className=''>
          <Input
            type={type}
            register={register(name, {
              required: true,
              maxLength: {
                value: longMaxima,
                message: `¡Ups! Como máximo son ${longMaxima} ${caracteres}`,
              },
            })}
            name={name}
            onChange={onChange}
          />
        </div>
        <FormErrorHandler name={name} errors={errors} nombre={nombre} />
      </div>
    </div>
  );
};

export default PasoInput;
