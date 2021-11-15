import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import { AnyAction } from '@reduxjs/toolkit'
import { AppDispatch } from 'src/redux'

type initialStateType = {
  ui: {
    toastList: Toast[]
  }
}

const initialState: initialStateType = {
  ui: {
    toastList: [],
  },
}

export enum UiActionType {
  ADD_TOAST = 'ui/ADD_TOAST',
  REMOVE_TOAST = 'ui/REMOVE_TOAST',
}

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

export const UiActionCreators: Partial<UiActionsType> = {}

UiActionCreators.addToast = (toast) => (dispatch: AppDispatch, getState: () => initialStateType) => {
  // we can access state inside action creators
  const { ui } = getState()
  const toastIds = ui.toastList.map((toast) => toast.id)

  if (toastIds.indexOf(toast.id) === -1) {
    dispatch({ type: UiActionType.ADD_TOAST, toast })
  }
}

UiActionCreators.removeToast = (toast) => (dispatch: AppDispatch) => {
  dispatch({ type: UiActionType.REMOVE_TOAST, toastId: toast.id })
}

UiActionCreators.removeToastById = (toastId) => (dispatch: AppDispatch) => {
  dispatch({ type: UiActionType.REMOVE_TOAST, toastId: toastId })
}
