import { shallowEqual } from 'react-redux'
import { AuthActionCreators } from '../../redux/modules/auth/auth'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { COLOR_BLIND_PALETTE } from 'src/utils/colors'
import { capitalize } from 'lodash'

export const useAuthenticatedUser = () => {
  const dispatch = useAppDispatch()

  const authError = useAppSelector((state) => state.auth.error)

  const isLoading = useAppSelector((state) => state.auth.isLoading)
  const userLoaded = useAppSelector((state) => state.auth.userLoaded)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const isAdmin = useAppSelector((state) => state.auth.user?.is_superuser)
  const isVerifiedUser = useAppSelector((state) => state.auth.user?.is_verified)

  const user = useAppSelector((state) => state.auth.user, shallowEqual)
  const avatarColor =
    COLOR_BLIND_PALETTE[capitalize(user?.email).charCodeAt(0) % COLOR_BLIND_PALETTE.length] || '#1060e0'

  const logUserOut = () => dispatch(AuthActionCreators.logUserOut())

  const registerNewUser = ({ username, email, password }) => {
    return dispatch(AuthActionCreators.registerNewUser({ username, email, password }))
  }

  const requestUserLogin = ({ email, password }) => {
    return dispatch(AuthActionCreators.requestUserLogin({ email, password }))
  }

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
    avatarColor,
    logUserOut,
  }
}
