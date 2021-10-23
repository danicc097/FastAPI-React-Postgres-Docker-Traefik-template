import { useEffect } from 'react'
import { useToasts } from 'src/hooks/ui/useToasts'
import { useAuthenticatedUser } from './useAuthenticatedUser'

export const useProtectedRoute = (
  redirectTitle = 'Access Denied',
  redirectMessage = 'Authenticated users only. Login here or create a new account to view that page.',
) => {
  // we can use redux hooks inside other hooks!
  const { userLoaded, isAuthenticated, isAdmin, isVerifiedUser } = useAuthenticatedUser()
  const { addToast } = useToasts()

  useEffect(() => {
    if (userLoaded && !isAuthenticated) {
      addToast({
        id: 'auth-toast-redirect',
        title: redirectTitle,
        color: 'warning',
        iconType: 'alert',
        toastLifeTimeMs: 15000,
        text: redirectMessage,
      })
    }
  }, [userLoaded, isAuthenticated, redirectTitle, redirectMessage, addToast])

  return { userLoaded, isAuthenticated, isAdmin, isVerifiedUser }
}
