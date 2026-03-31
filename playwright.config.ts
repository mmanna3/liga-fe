import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  webServer: [
    {
      command: 'node e2e/mock-server.cjs',
      port: 3001,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'npm run dev -- --port 5174',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      timeout: 60 * 1000,
      env: {
        VITE_API_BASE_URL: 'http://localhost:3001'
      }
    }
  ],
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
