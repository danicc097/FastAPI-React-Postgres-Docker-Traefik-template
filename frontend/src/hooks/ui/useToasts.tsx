import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { UiActionCreators } from 'src/redux/modules/ui/ui'

export const useToasts = () => {
  const dispatch = useAppDispatch()

  const toasts = useAppSelector((state) => state.ui.toastList, shallowEqual)

  const addToast = (toast: Toast) => dispatch(UiActionCreators.addToast({ toast }))
  const removeToast = (toast: Toast) => dispatch(UiActionCreators.removeToast({ toast }))
  const removeToastById = (toastId: string) => dispatch(UiActionCreators.removeToastById({ toastId }))

  return { toasts, addToast, removeToast, removeToastById }
}
