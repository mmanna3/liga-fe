import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { Download, UserCheck } from 'lucide-react'
import { useState } from 'react'
import ModalSeleccionDelegados from './components/modal-seleccion-delegados'
import TablaDelegados from './tabla'

export default function Delegados() {
  const [modalSeleccionOpen, setModalSeleccionOpen] = useState(false)

  return (
    <>
      <FlujoHomeLayout
        titulo='Delegados'
        contenedorClassName='max-w-6xl'
        iconoTitulo={<UserCheck className='h-8 w-8 text-primary' />}
        ocultarBotonVolver
        botonera={{
          iconos: [
            {
              alApretar: () => setModalSeleccionOpen(true),
              tooltip: 'Generar carnets PDF',
              icono: Download
            }
          ]
        }}
        contenido={<TablaDelegados />}
      />
      <ModalSeleccionDelegados
        open={modalSeleccionOpen}
        onOpenChange={setModalSeleccionOpen}
      />
    </>
  )
}
