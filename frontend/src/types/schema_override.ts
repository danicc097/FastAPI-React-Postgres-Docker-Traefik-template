import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { components } from './schema'

// create a new interface for openapi
export type schema = components['schemas']
