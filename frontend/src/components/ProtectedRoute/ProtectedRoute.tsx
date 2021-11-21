import React, { ElementType } from 'react'
import { EuiLoadingSpinner } from '@elastic/eui'
import { useProtectedRoute } from 'src/hooks/auth/useProtectedRoute'
import LoginPage from '../../views/Login/LoginPage/LoginPage'
import PagePermissions from '../Permissions/PagePermissions'

type ProtectedRouteProps = {
  component: ElementType
  adminRoute?: boolean
  verifiedUserRoute?: boolean
}

/**
 * Restrict a route to specific users and protect against unauthenticated users
 */
export default function ProtectedRoute({
  component: Component,
  adminRoute = false,
  verifiedUserRoute = false,
  ...props
}: ProtectedRouteProps) {
  const { isAuthenticated, userLoaded, isAdmin, isVerifiedUser } = useProtectedRoute()

  if (!userLoaded) return <EuiLoadingSpinner size="xl" />

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
      </>
    )
  }

  const element = <Component {...props} />

  if (adminRoute) {
    return <PagePermissions element={element} isAllowed={isAdmin}></PagePermissions>
  } else if (verifiedUserRoute) {
    return <PagePermissions element={element} isAllowed={isVerifiedUser}></PagePermissions>
  } else {
    return element
  }
}
