import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'

interface Props {
  texto: string
}

const BotonVolver: React.FC<Props> = ({ texto }: Props) => {
  const navigate = useNavigate()

  return (
    <Button variant='outline' type='button' onClick={() => navigate(-1)}>
      {texto}
    </Button>
  )
}

export default BotonVolver
