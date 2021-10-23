export enum AuthActionType {
  REQUEST_LOGIN = 'REQUEST_LOGIN',
  REQUEST_LOGIN_FAILURE = 'REQUEST_LOGIN_FAILURE',
  REQUEST_LOGIN_SUCCESS = 'REQUEST_LOGIN_SUCCESS',

  REQUEST_LOG_USER_OUT = 'REQUEST_LOG_USER_OUT',

  FETCHING_USER_FROM_TOKEN = 'FETCHING_USER_FROM_TOKEN',
  FETCHING_USER_FROM_TOKEN_SUCCESS = 'FETCHING_USER_FROM_TOKEN_SUCCESS',
  FETCHING_USER_FROM_TOKEN_FAILURE = 'FETCHING_USER_FROM_TOKEN_FAILURE',

  REQUEST_USER_SIGN_UP = 'REQUEST_USER_SIGN_UP',
  REQUEST_USER_SIGN_UP_SUCCESS = 'REQUEST_USER_SIGN_UP_SUCCESS',
  REQUEST_USER_SIGN_UP_FAILURE = 'REQUEST_USER_SIGN_UP_FAILURE',

  REQUEST_PASSWORD_RESET = 'REQUEST_PASSWORD_RESET',
  REQUEST_PASSWORD_RESET_SUCCESS = 'REQUEST_PASSWORD_RESET_SUCCESS',
  REQUEST_PASSWORD_RESET_FAILURE = 'REQUEST_PASSWORD_RESET_FAILURE',
}

export enum UiActionType {
  ADD_TOAST = 'ADD_TOAST',
  REMOVE_TOAST = 'REMOVE_TOAST',
}

export enum UserProfileActionType {
  REQUEST_USER_UPDATE = 'REQUEST_USER_UPDATE',
  REQUEST_USER_UPDATE_FAILURE = 'REQUEST_USER_UPDATE_FAILURE',
  REQUEST_USER_UPDATE_SUCCESS = 'REQUEST_USER_UPDATE_SUCCESS',
}

export enum AdminActionType {
  FETCH_ALL_USERS = 'FETCH_ALL_USERS',
  FETCH_ALL_USERS_SUCCESS = 'FETCH_ALL_USERS_SUCCESS',
  FETCH_ALL_USERS_FAILURE = 'FETCH_ALL_USERS_FAILURE',

  FETCH_ALL_UNVERIFIED_USERS = 'FETCH_ALL_UNVERIFIED_USERS',
  FETCH_ALL_UNVERIFIED_USERS_SUCCESS = 'FETCH_ALL_UNVERIFIED_USERS_SUCCESS',
  FETCH_ALL_UNVERIFIED_USERS_FAILURE = 'FETCH_ALL_UNVERIFIED_USERS_FAILURE',

  VERIFY_USERS = 'VERIFY_USERS',
  VERIFY_USERS_SUCCESS = 'VERIFY_USERS_SUCCESS',
  VERIFY_USERS_FAILURE = 'VERIFY_USERS_FAILURE',

  REMOVE_VERIFIED_USERS_FROM_STORE = 'REMOVE_VERIFIED_USERS_FROM_STORE',

  FETCH_ALL_PASSWORD_RESET_REQUESTS = 'FETCH_ALL_PASSWORD_RESET_REQUESTS',
  FETCH_ALL_PASSWORD_RESET_REQUESTS_SUCCESS = 'FETCH_ALL_PASSWORD_RESET_REQUESTS_SUCCESS',
  FETCH_ALL_PASSWORD_RESET_REQUESTS_FAILURE = 'FETCH_ALL_PASSWORD_RESET_REQUESTS_FAILURE',

  RESET_PASSWORD_FOR_USER = 'RESET_PASSWORD_FOR_USER',
  RESET_PASSWORD_FOR_USER_SUCCESS = 'RESET_PASSWORD_FOR_USER_SUCCESS',
  RESET_PASSWORD_FOR_USER_FAILURE = 'RESET_PASSWORD_FOR_USER_FAILURE',

  DELETE_PASSWORD_RESET_REQUEST = 'DELETE_PASSWORD_RESET_REQUEST',
  DELETE_PASSWORD_RESET_REQUEST_SUCCESS = 'DELETE_PASSWORD_RESET_REQUEST_SUCCESS',
  DELETE_PASSWORD_RESET_REQUEST_FAILURE = 'DELETE_PASSWORD_RESET_REQUEST_FAILURE',

  REMOVE_PASSWORD_RESET_REQUEST_FROM_STORE = 'REMOVE_PASSWORD_RESET_REQUEST_FROM_STORE',
}

export enum OfferActionType {
  CREATE_OFFER_FOR_CLEANING_JOB = 'CREATE_OFFER_FOR_CLEANING_JOB',
  CREATE_OFFER_FOR_CLEANING_JOB_SUCCESS = 'CREATE_OFFER_FOR_CLEANING_JOB_SUCCESS',
  CREATE_OFFER_FOR_CLEANING_JOB_FAILURE = 'CREATE_OFFER_FOR_CLEANING_JOB_FAILURE',

  FETCH_USER_OFFER_FOR_CLEANING_JOB = 'FETCH_USER_OFFER_FOR_CLEANING_JOB',
  FETCH_USER_OFFER_FOR_CLEANING_JOB_SUCCESS = 'FETCH_USER_OFFER_FOR_CLEANING_JOB_SUCCESS',
  FETCH_USER_OFFER_FOR_CLEANING_JOB_FAILURE = 'FETCH_USER_OFFER_FOR_CLEANING_JOB_FAILURE',

  FETCH_ALL_OFFERS_FOR_CLEANING_JOB = 'FETCH_ALL_OFFERS_FOR_CLEANING_JOB',
  FETCH_ALL_OFFERS_FOR_CLEANING_JOB_SUCCESS = 'FETCH_ALL_OFFERS_FOR_CLEANING_JOB_SUCCESS',
  FETCH_ALL_OFFERS_FOR_CLEANING_JOB_FAILURE = 'FETCH_ALL_OFFERS_FOR_CLEANING_JOB_FAILURE',

  ACCEPT_USERS_OFFER_FOR_CLEANING_JOB = 'ACCEPT_OFFER_FROM_USER_FOR_CLEANING_JOB',
  ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_SUCCESS = 'ACCEPT_OFFER_FROM_USER_FOR_CLEANING_JOB_SUCCESS',
  ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_FAILURE = 'ACCEPT_OFFER_FROM_USER_FOR_CLEANING_JOB_FAILURE',
}
