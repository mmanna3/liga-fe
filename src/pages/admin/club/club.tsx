import { Button } from '@/components/ui/button'
import Botonera from '@/components/ykn-ui/botonera'
import Titulo from '@/components/ykn-ui/titulo'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate } from 'react-router-dom'
import Tabla from './tabla'

export default function Club() {
  const navigate = useNavigate()

  return (
    <>
      <Titulo>Clubes</Titulo>
      <Botonera>
        <Button onClick={() => navigate(rutasNavegacion.crearClub)}>
          Crear nuevo club
        </Button>
      </Botonera>
      <Tabla />
    </>
  )
}
