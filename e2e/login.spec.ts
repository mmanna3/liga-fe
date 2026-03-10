import { expect, test } from '@playwright/test'

test('muestra la pantalla de login', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByText('Iniciar Sesión')).toBeVisible()
})
