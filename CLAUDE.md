# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liga FE is a React SPA for tournament and team management (clubs, teams, players, delegates, tournaments). It has a public player registration flow ("fichaje") and an admin dashboard with role-based access. The backend is a .NET API.

## Commands

- `npm run dev` — Start dev server (localhost:5173)
- `npm run dev:lan` — Dev server accessible on LAN
- `npm run build` — Production build (Vite)
- `npm run check:tsc` — TypeScript type checking
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` — Prettier formatting
- `npm run e2e` — Playwright E2E tests
- `npm run e2e:ui` — Playwright with UI mode
- Add shadcn components: `npx shadcn@canary add`

## Architecture

### Tech Stack
React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + React Router DOM 7 + TanStack React Query 5 + Zustand 5

### Path Alias
`@/` maps to `./src/` (configured in tsconfig and vite.config.ts)

### Source Layout

- **`src/api/`** — API layer
  - `clients.ts` — Auto-generated NSwag client from .NET backend Swagger spec (do not edit manually)
  - `api.ts` — Singleton `Client` instance with base URL from `VITE_API_BASE_URL`
  - `http-client-wrapper.ts` — HTTP interceptor that injects Bearer token, handles 401/403 (auto-logout + redirect)
  - `custom-hooks/use-api-query.tsx` — Wrapper around `useQuery` with conditional enable (`activado`), result transform (`transformarResultado`), `throwOnError: true`
  - `custom-hooks/use-api-mutation.tsx` — Wrapper around `useMutation` with toast notifications via Sonner

- **`src/pages/`** — Page components organized by domain
  - `admin/` — Protected admin area with sub-folders: `club/`, `equipo/`, `jugador/`, `delegados/`, `torneo/`, `reportes/`
  - `admin/admin-layout.tsx` — Main admin layout with sidebar navigation, uses React Router `<Outlet />`
  - `fichaje/` — Public multi-step player registration flow
  - `login.tsx` — Login page

- **`src/components/ui/`** — Shadcn/ui components (New York style, Zinc base color)
- **`src/components/ykn-ui/`** — Custom branded components (Boton, Botonera, Titulo, Tabla, Detalle-Item)
- **`src/components/RequiereAutenticacion.tsx`** — Auth guard wrapper for protected routes
- **`src/components/visible-solo-para-admin.tsx`** — Conditional render for admin role

- **`src/routes/rutas.ts`** — Route path constants; `rutasNavegacion` adds `/admin/` prefix
- **`src/routes/mapa-rutas-componentes.tsx`** — React Router v7 route tree

- **`src/hooks/use-auth.ts`** — Zustand store with persist middleware for auth state (token, role, login/logout). JWT decoded via `jwt-decode`. Admin role = `"Administrador"`.

- **`src/lib/utils.ts`** — `cn()` helper (clsx + tailwind-merge), shared enums

### Data Flow Pattern
Pages use `useApiQuery`/`useApiMutation` → TanStack Query → NSwag-generated `api` client → `HttpClientWrapper` (injects auth) → Backend.

### Page Pattern
Admin pages typically follow: `Titulo` (header) → `Botonera` (action buttons) → `Tabla` or detail view, with loading/error states from `CargandoYErrorContenedor`.

## Language Convention

The codebase uses **Spanish** for variable names, component names, route paths, UI text, and API hook parameters (e.g., `activado`, `mensajeDeExito`, `antesDeMensajeExito`). Follow this convention.

## Environment Variables

- `VITE_API_BASE_URL` — Backend API base URL (dev default: `http://0.0.0.0:5072`)
- `VITE_IS_DEV` — Development flag
