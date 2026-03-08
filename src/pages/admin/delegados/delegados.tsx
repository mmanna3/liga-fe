import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { Download } from 'react-feather'
import { useState } from 'react'
import ModalSeleccionDelegados from './components/modal-seleccion-delegados'
import TablaDelegados from './tabla'

export default function Delegados() {
  const [modalSeleccionOpen, setModalSeleccionOpen] = useState(false)

  return (
    <>
      <FlujoHomeLayout
        titulo='Delegados'
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
