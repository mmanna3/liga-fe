import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'

interface Props {
  texto?: string
  path?: string
}

const BotonVolver: React.FC<Props> = ({ texto = 'Volver', path }: Props) => {
  const navigate = useNavigate()

  return (
    <Button
      variant='outline'
      type='button'
      onClick={() => {
        if (path) navigate(path)
        else navigate(-1)
      }}
    >
      {texto}
    </Button>
  )
}

export default BotonVolver
