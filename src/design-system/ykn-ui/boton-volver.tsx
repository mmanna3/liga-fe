import { useNavigate } from 'react-router-dom'
import { Boton } from './boton'
import Icono from '@/design-system/ykn-ui/icono'

interface Props {
  /** Ruta específica a la que navegar. Si no se provee, usa navigate(-1) */
  path?: string
  className?: string
}

const BotonVolver: React.FC<Props> = ({ path, className }: Props) => {
  const navigate = useNavigate()

  return (
    <Boton
      variant='ghost'
      size='icon'
      type='button'
      className={className}
      onClick={() => {
        if (path) navigate(path)
        else navigate(-1)
      }}
      aria-label='Volver'
    >
      <Icono nombre='Volver' className='h-5 w-5' />
    </Boton>
  )
}

export default BotonVolver
