interface RequiereAutenticacionProps {
  children: React.ReactNode
}

export function RequiereAutenticacion({
  children
}: RequiereAutenticacionProps) {
  // const { isAuthenticated } = useAuth()
  // const location = useLocation()

  // if (!isAuthenticated) {
  //   return <Navigate to='/login' state={{ from: location }} replace />
  // }

  return children
}
