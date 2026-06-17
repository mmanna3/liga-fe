/**
 * @vitest-environment jsdom
 */
import { TooltipProvider } from '@/design-system/base-ui/tooltip'
import { BotonEliminar } from './boton-eliminar'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const esAdminMock = vi.fn()

vi.mock('@/logica-compartida/hooks/use-auth', () => ({
  useAuth: (selector: (state: { esAdmin: () => boolean }) => unknown) =>
    selector({ esAdmin: esAdminMock })
}))

function renderBotonEliminar(props: ComponentProps<typeof BotonEliminar>) {
  return render(
    <TooltipProvider>
      <BotonEliminar {...props} />
    </TooltipProvider>
  )
}

describe('BotonEliminar', () => {
  afterEach(() => {
    cleanup()
    esAdminMock.mockReset()
  })

  it('no renderiza si el usuario no es admin', () => {
    esAdminMock.mockReturnValue(false)

    const { container } = renderBotonEliminar({
      titulo: 'Eliminar item',
      subtitulo: '¿Confirmás?',
      onEliminar: () => {}
    })

    expect(container.innerHTML).toBe('')
  })

  it('renderiza para Administrador', () => {
    esAdminMock.mockReturnValue(true)

    renderBotonEliminar({
      titulo: 'Eliminar item',
      subtitulo: '¿Confirmás?',
      onEliminar: () => {}
    })

    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeTruthy()
  })

  it('abre el modal de confirmación y ejecuta onEliminar', () => {
    esAdminMock.mockReturnValue(true)
    const onEliminar = vi.fn()

    renderBotonEliminar({
      titulo: 'Eliminar torneo',
      subtitulo: '¿Estás seguro?',
      eliminarTexto: 'Eliminar torneo',
      onEliminar
    })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar torneo' }))
    expect(onEliminar).toHaveBeenCalledTimes(1)
  })

  it('muestra aviso cuando puedeEliminar es false', () => {
    esAdminMock.mockReturnValue(true)

    renderBotonEliminar({
      titulo: 'Eliminar torneo',
      subtitulo: '¿Estás seguro?',
      onEliminar: () => {},
      puedeEliminar: false,
      textoNoSePuedeEliminar: 'No se puede eliminar porque tiene fases.',
      tooltip: 'Eliminar torneo'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar torneo' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog.textContent).toContain('No se puede eliminar')
    expect(dialog.textContent).toContain(
      'No se puede eliminar porque tiene fases.'
    )
  })
})
