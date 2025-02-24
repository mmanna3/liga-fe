import Botonera from '@/components/ui/botonera'
import { Button } from '@/components/ui/button'
import Titulo from '@/components/ui/titulo'
import Tabla from './tabla'

export default function Club() {
  return (
    <>
      <Titulo>Clubs</Titulo>
      <Botonera>
        <Button>Crear nuevo club</Button>
      </Botonera>
      <Tabla />
    </>
  )
}
