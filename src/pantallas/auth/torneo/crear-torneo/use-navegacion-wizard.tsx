import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { esquemaTorneo } from './esquema-validacion'
import { PASOS } from './datos-pasos'
import type { DatosWizardTorneo } from './tipos'
import { useStoreWizard } from './use-store-wizard'
import { datosIniciales } from './wizard-datos-iniciales'

export function useNavegacionWizard() {
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const accionPendienteRef = useRef<
    { tipo: 'next' } | { tipo: 'step'; targetStep: number } | null
  >(null)
  const snapshotPasoRef = useRef<Partial<DatosWizardTorneo> | null>(null)

  const {
    pasoActual,
    maxPasoAlcanzado,
    siguientePaso,
    pasoAnterior,
    irAlPaso,
    editandoDesdePasoResumen,
    setEditandoDesdePasoResumen
  } = useStoreWizard()

  const methods = useForm<DatosWizardTorneo>({
    defaultValues: datosIniciales,
    mode: 'onChange',
    resolver: zodResolver(esquemaTorneo)
  })

  const pasoConfig = PASOS[pasoActual - 1]

  const validarPasoActual = async () => {
    try {
      await pasoConfig.validar(methods.getValues())
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const mensajes = [...new Set(error.issues.map((i) => i.message))]
        toast.error(
          mensajes.length === 1 ? (
            mensajes[0]
          ) : (
            <span className='block'>
              {mensajes.map((msg, i) => (
                <span key={i} className='block'>
                  • {msg}
                </span>
              ))}
            </span>
          ),
          { duration: 8000 }
        )
      } else {
        toast.error('Por favor, completa todos los campos requeridos', {
          duration: 8000
        })
      }
      return false
    }
  }

  const debeMostrarConfirmacion = () => {
    if (
      editandoDesdePasoResumen === null ||
      editandoDesdePasoResumen !== pasoActual
    )
      return false
    const actual = pasoConfig.obtenerDatos(methods.getValues())
    return JSON.stringify(actual) !== JSON.stringify(snapshotPasoRef.current)
  }

  const aplicarReversion = () => {
    if (!snapshotPasoRef.current) return
    methods.reset({ ...methods.getValues(), ...snapshotPasoRef.current })
    setEditandoDesdePasoResumen(null)
    snapshotPasoRef.current = null
  }

  const aplicarConfirmacionYLimpieza = () => {
    const defaults = PASOS.filter((p) => p.numero > pasoActual).reduce(
      (acc, p) => ({ ...acc, ...p.obtenerDefaults() }),
      {} as Partial<DatosWizardTorneo>
    )
    methods.reset({ ...methods.getValues(), ...defaults })
    setEditandoDesdePasoResumen(null)
    snapshotPasoRef.current = null
  }

  const alEditarPaso = (numeroPaso: number) => {
    const paso = PASOS[numeroPaso - 1]
    snapshotPasoRef.current = paso.obtenerDatos(methods.getValues())
    setEditandoDesdePasoResumen(numeroPaso)
    irAlPaso(numeroPaso)
  }

  const alSiguiente = async () => {
    if (!(await validarPasoActual())) return
    if (debeMostrarConfirmacion()) {
      accionPendienteRef.current = { tipo: 'next' }
      setConfirmacionAbierta(true)
      return
    }
    siguientePaso()
  }

  const alAnterior = () => pasoAnterior()

  const alClickearPaso = async (pasoDestino: number) => {
    if (pasoDestino === pasoActual) return
    if (pasoDestino < pasoActual) {
      irAlPaso(pasoDestino)
      return
    }
    if (!(await validarPasoActual())) return
    if (pasoDestino > maxPasoAlcanzado) {
      toast.error(
        'Completa el paso actual y avanza con "Siguiente" para desbloquear más pasos',
        { duration: 8000 }
      )
      return
    }
    if (debeMostrarConfirmacion()) {
      accionPendienteRef.current = { tipo: 'step', targetStep: pasoDestino }
      setConfirmacionAbierta(true)
      return
    }
    irAlPaso(pasoDestino)
  }

  const alRevertir = () => {
    aplicarReversion()
    setConfirmacionAbierta(false)
    accionPendienteRef.current = null
  }

  const alConfirmarYLimpiar = () => {
    aplicarConfirmacionYLimpieza()
    setConfirmacionAbierta(false)
    const pendiente = accionPendienteRef.current
    accionPendienteRef.current = null
    if (pendiente?.tipo === 'next') siguientePaso()
    else if (pendiente?.tipo === 'step') irAlPaso(pendiente.targetStep)
  }

  return {
    methods,
    pasoActual,
    maxPasoAlcanzado,
    pasoConfig,
    confirmacionAbierta,
    accionPendienteRef,
    alSiguiente,
    alAnterior,
    alClickearPaso,
    alEditarPaso,
    alRevertir,
    alConfirmarYLimpiar
  }
}
