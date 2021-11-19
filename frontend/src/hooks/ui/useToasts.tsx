import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { UiActionCreators } from 'src/redux/modules/ui/ui'

export const useToasts = () => {
  const dispatch = useAppDispatch()

  // references to state slices
  const toasts = useAppSelector((state) => state.ui.toastList, shallowEqual)

  // wrappers for redux actions
  // instead of using connect, we return a function that can be imported and called directly
  const addToast = (toast: Toast) => dispatch(UiActionCreators.addToast(toast))
  const removeToast = (toast: Toast) => dispatch(UiActionCreators.removeToast(toast))
  const removeToastById = (toastId: string) => dispatch(UiActionCreators.removeToastById(toastId))

  // use all this functionality anywhere
  return { toasts, addToast, removeToast, removeToastById }
}
