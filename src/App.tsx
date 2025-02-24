import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { rutas } from './rutas'

const router = createBrowserRouter(rutas)

export default function App() {
  return <RouterProvider router={router} />
}
