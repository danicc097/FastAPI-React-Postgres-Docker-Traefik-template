import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import { AnyAction } from '@reduxjs/toolkit'
import { UiActionType } from './action-types'
import initialState, { initialStateType } from './initialState'
import { AppDispatch } from './store'

// Recommended to enforce the return type of reducers to prevent "nevers".
// When we do dispatch({ type: UiActionType.ADD_TOAST, toast })
// we are doing dispatch(action), so we can access whatever we pass along dispatch
export default function uiReducer(
  state: initialStateType['ui'] = initialState.ui,
  action: AnyAction,
): initialStateType['ui'] {
  switch (action.type) {
    case UiActionType.ADD_TOAST:
      return {
        ...state,
        toastList: [...state.toastList, action.toast],
      }
    case UiActionType.REMOVE_TOAST:
      return {
        ...state,
        // remove specified toast by id
        toastList: state.toastList.filter((toast) => toast.id !== action.toastId),
      }
    default:
      return state
  }
}

type UiActionsType = {
  addToast: (toast: Toast) => any
  removeToast: (toast: Toast) => any
  removeToastById: (toastId: string) => any
}

export const UiActions: Partial<UiActionsType> = {}

UiActions.addToast = (toast) => (dispatch: AppDispatch, getState: any) => {
  const { ui } = getState()
  const toastIds = ui.toastList.map((toast) => toast.id)

  if (toastIds.indexOf(toast.id) === -1) {
    dispatch({ type: UiActionType.ADD_TOAST, toast })
  }
}

UiActions.removeToast = (toast) => (dispatch: AppDispatch) => {
  dispatch({ type: UiActionType.REMOVE_TOAST, toastId: toast.id })
}

UiActions.removeToastById = (toastId) => (dispatch: AppDispatch) => {
  dispatch({ type: UiActionType.REMOVE_TOAST, toastId: toastId })
}
