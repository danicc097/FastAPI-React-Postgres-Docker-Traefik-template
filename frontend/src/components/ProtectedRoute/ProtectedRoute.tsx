import React, { ElementType } from 'react'
import { EuiLoadingSpinner } from '@elastic/eui'
import { useProtectedRoute } from 'src/hooks/auth/useProtectedRoute'
import LoginPage from '../../views/Login/LoginPage/LoginPage'
import PermissionsNeeded from '../PermissionsNeeded/PermissionsNeeded'

type ProtectedRoutePropTypes = {
  component: ElementType
  adminRoute?: boolean
  verifiedUserRoute?: boolean
}

export default function ProtectedRoute({
  component: Component,
  adminRoute = false,
  verifiedUserRoute = false,
  ...props
}: ProtectedRoutePropTypes) {
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
    return <PermissionsNeeded element={element} isAllowed={isAdmin} adminRoute={true}></PermissionsNeeded>
  } else if (verifiedUserRoute) {
    return <PermissionsNeeded element={element} isAllowed={isVerifiedUser}></PermissionsNeeded>
  } else {
    return element
  }
}
