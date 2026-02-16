import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VisibleSoloParaAdmin } from './visible-solo-para-admin'

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/use-auth', () => ({
  useAuth: mockUseAuth
}))

describe('VisibleSoloParaAdmin', () => {
  it('muestra el contenido cuando el usuario es admin', () => {
    mockUseAuth.mockReturnValue({ esAdmin: () => true })

    render(
      <VisibleSoloParaAdmin>
        <div>Solo para admin</div>
      </VisibleSoloParaAdmin>
    )

    expect(screen.getByText('Solo para admin')).toBeInTheDocument()
  })

  it('no muestra nada cuando el usuario no es admin', () => {
    cleanup()
    mockUseAuth.mockReturnValue({ esAdmin: () => false })

    const { container } = render(
      <VisibleSoloParaAdmin>
        <div>Solo para admin</div>
      </VisibleSoloParaAdmin>
    )

    expect(screen.queryByText('Solo para admin')).not.toBeInTheDocument()
    expect(container.innerHTML).toBe('')
  })
})
