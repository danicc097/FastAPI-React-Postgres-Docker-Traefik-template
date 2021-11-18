import { AnyAction } from '@reduxjs/toolkit'

/**
 * Generic error slice of state
 */
export function errorState(state, action: AnyAction) {
  return {
    ...state,
    isLoading: false,
    error: action.error,
  }
}
/**
 * Generic loading slice of state
 */
export function loadingState(state) {
  return {
    ...state,
    isLoading: true,
  }
}

/**
 * Generic success slice of state
 */
export function successState(state) {
  return {
    ...state,
    isLoading: false,
    error: null,
  }
}
