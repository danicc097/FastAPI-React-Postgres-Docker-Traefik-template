// centralize authentication logic as well

import { shallowEqual } from 'react-redux'
import { AuthActionCreators } from '../../redux/modules/auth/auth'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

export const useAuthenticatedUser = () => {
  const dispatch = useAppDispatch()

  // grabs fastapi's detail msg from a httpvalidationerror
  const authError = useAppSelector((state) => state.auth.error)

  const isLoading = useAppSelector((state) => state.auth.isLoading)
  const userLoaded = useAppSelector((state) => state.auth.userLoaded)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const isAdmin = useAppSelector((state) => state.auth.user.is_superuser)
  const isVerifiedUser = useAppSelector((state) => state.auth.user.is_verified)

  const user = useAppSelector((state) => state.auth.user, shallowEqual)

  // wrappers for redux actions (only the ones meant to be used inside a component)
  // no need to use connect by using this approach
  const logUserOut = () => dispatch(AuthActionCreators.logUserOut())

  const registerNewUser = ({ username, email, password }) => {
    return dispatch(AuthActionCreators.registerNewUser({ username, email, password }))
  }

  const requestUserLogin = ({ email, password }) => {
    return dispatch(AuthActionCreators.requestUserLogin({ email, password }))
  }

  // use all this functionality anywhere
  return {
    userLoaded,
    isLoading,
    isAdmin,
    isVerifiedUser,
    authError,
    registerNewUser,
    requestUserLogin,
    isAuthenticated,
    user,
    logUserOut,
  }
}
