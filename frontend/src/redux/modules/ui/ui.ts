import { Toast } from '@elastic/eui/src/components/toast/global_toast_list'
import { AnyAction } from '@reduxjs/toolkit'
import { AsyncLocalStorage } from 'async_hooks'
import { findIndex, truncate } from 'lodash'
import { AppDispatch } from 'src/redux'
import { errorState } from 'src/redux/utils/slices'
import apiClient, { simpleApiClient } from 'src/services/apiClient'
import { operations } from 'src/types/schema'

export type initialStateType = {
  ui: {
    toastList: Toast[]
    theme: 'dark' | 'light'
    styleSheet: string
  }
}

const initialState: initialStateType = {
  ui: {
    toastList: [],
    theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
    styleSheet: `/eui_theme_${localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'}.min.css`,
  },
}

export enum UiActionType {
  ADD_TOAST = 'ui/ADD_TOAST',
  REMOVE_TOAST = 'ui/REMOVE_TOAST',
  SET_THEME = 'ui/SET_THEME',
  SET_STYLESHEET = 'ui/SET_STYLESHEET',
}

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

        toastList: state.toastList.filter((toast) => toast.id !== action.toastId),
      }

    case UiActionType.SET_THEME:
      return {
        ...state,
        theme: action.theme,
      }

    case UiActionType.SET_STYLESHEET:
      return {
        ...state,
        styleSheet: action.styleSheet,
      }

    default:
      return state
  }
}

type ActionCreatorParams = {
  toast?: Toast
  toastId?: string
  theme?: 'dark' | 'light'
}

type ActionCreators = {
  addToast: ({ toast }: ActionCreatorParams) => any
  removeToast: ({ toast }: ActionCreatorParams) => any
  removeToastById: ({ toastId }: ActionCreatorParams) => any
  setTheme: ({ theme }: ActionCreatorParams) => any
}

export const UiActionCreators: Partial<ActionCreators> = {}

UiActionCreators.addToast = ({ toast }) => {
  return async (dispatch: AppDispatch, getState: () => initialStateType) => {
    const { ui } = getState()
    const toastIds = ui.toastList.map((toast) => toast.id)

    if (toastIds.indexOf(toast.id) === -1) {
      dispatch({ type: UiActionType.ADD_TOAST, toast })
    }
  }
}

UiActionCreators.removeToast = ({ toast }) => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: UiActionType.REMOVE_TOAST, toastId: toast.id })
  }
}

UiActionCreators.removeToastById = ({ toastId }) => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: UiActionType.REMOVE_TOAST, toastId: toastId })
  }
}

UiActionCreators.setTheme = ({ theme }) => {
  return async (dispatch: AppDispatch) => {
    localStorage.setItem('theme', theme)
    dispatch({ type: UiActionType.SET_THEME, theme })
    dispatch({ type: UiActionType.SET_STYLESHEET, styleSheet: `/eui_theme_${theme}.min.css` })
  }
}
